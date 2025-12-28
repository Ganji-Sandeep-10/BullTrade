import 'dotenv/config';
import { httpPusher } from '@exness-v3/redis/streams';
import { addToStreamWithTrim } from '@exness-v3/redis/stream-utils';

type PriceState = {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
};

let latestPrices: Record<string, PriceState> = {};
let dirtyPrices: Record<string, PriceState> = {};
let redisConnected = false;

const ENGINE_STREAM_KEY = 'stream:engine';
const ENGINE_STREAM_MAXLEN = Number(process.env.ENGINE_STREAM_MAXLEN ?? 50000);
const PRICE_DELTA_THRESHOLD = 0.0005; // 0.05%

/**
 * Connect to Redis
 */
(async () => {
  try {
    console.log('Connecting to Redis...');
    await httpPusher.connect();
    redisConnected = true;
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
})();

/**
 * WebSocket connection to Backpack
 */
const ws = new WebSocket('wss://ws.backpack.exchange/');

const subscribeMessage = {
  method: 'SUBSCRIBE',
  params: [
    'bookTicker.BTC_USDC',
    'bookTicker.ETH_USDC',
    'bookTicker.SOL_USDC',
  ],
  id: 1,
};

ws.onopen = () => {
  console.log('Connected to Backpack WS');
  ws.send(JSON.stringify(subscribeMessage));
};

ws.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if (!payload?.data) return;

  const trade = payload.data as Trade;
  const [decimal, integer] = getIntAndDecimal(trade.a);

  if (integer === undefined || decimal === undefined) return;

  const updatedPrice: PriceState = {
    buyPrice: Math.round(integer * 1.01),
    sellPrice: integer,
    decimal,
  };

  const prev = latestPrices[trade.s];

  // 🔑 Deduplicate price updates
  if (
    !prev ||
    Math.abs(updatedPrice.sellPrice - prev.sellPrice) / prev.sellPrice >
      PRICE_DELTA_THRESHOLD
  ) {
    latestPrices[trade.s] = updatedPrice;
    dirtyPrices[trade.s] = updatedPrice;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed. Restarting process...');
  setTimeout(() => process.exit(1), 5000);
};

const ENGINE_PRICE_PUSH_INTERVAL = 10000; // 10 seconds
/**
 * Batch price updates every 10 seconds
 */
setInterval(async () => {
  if (!redisConnected) return;

  const symbols = Object.keys(dirtyPrices);
  if (symbols.length === 0) return;

  const batch = dirtyPrices;
  dirtyPrices = {};

  const event = {
    type: 'PRICE_UPDATE',
    data: batch,
    ts: Date.now(),
  };

  try {
    await addToStreamWithTrim(
      ENGINE_STREAM_KEY,
      '*',
      {
        type: event.type,
        data: JSON.stringify(event.data),
        ts: event.ts.toString(),
      },
      ENGINE_STREAM_MAXLEN
    );

    console.log(
      `[POOLER] pushed ${symbols.length} symbols to engine`
    );
  } catch (err) {
    console.error('Failed to push price update:', err);
  }
}, ENGINE_PRICE_PUSH_INTERVAL);

/**
 * Types
 */
interface Trade {
  A: string;
  B: string;
  E: number;
  T: number;
  a: string;
  b: string;
  e: string;
  s: string;
  u: number;
}

/**
 * Helpers
 */
function getIntAndDecimal(price: string): [number, number] | [undefined, undefined] {
  const parts = price.split('.');
  if (!parts[1]) return [undefined, undefined];

  const decimal = parts[1].length;
  const integer = Number(parts.join(''));

  return [decimal, integer];
}

