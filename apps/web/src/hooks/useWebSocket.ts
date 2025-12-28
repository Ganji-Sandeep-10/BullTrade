import { useEffect, useRef } from 'react';
import { setSymbolPrice } from '@/lib/price-store';

export interface TradeMessage {
  type: 'ASK' | 'BID';
  symbol: string;
  price: number;
  originalPrice: number;
  quantity: number;
  time: number;
}

// Keep a shared connection outside the hook
let ws: WebSocket | null = null;
let listeners: ((msg: TradeMessage) => void)[] = [];
let reconnectTimeout: NodeJS.Timeout | null = null;
let closeTimeout: NodeJS.Timeout | null = null;
const WS_URL = 'wss://ws.backpack.exchange/';

const SUBSCRIBE_MESSAGE = {
  method: 'SUBSCRIBE',
  params: ['bookTicker.BTC_USDC', 'bookTicker.ETH_USDC', 'bookTicker.SOL_USDC'],
  id: 1,
} as const;

export function useWebSocket(onMessage: (msg: TradeMessage) => void) {
  // Store the latest callback in a ref to avoid reconnections
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Wrapper function that calls the latest callback
    const stableCallback = (msg: TradeMessage) => {
      callbackRef.current(msg);
    };

    // Function to create/reconnect WebSocket
    const connectWebSocket = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        try {
          ws?.send(JSON.stringify(SUBSCRIBE_MESSAGE));
        } catch (err) {
          console.error('WS subscribe error:', err);
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          // Backpack bookTicker event
          if (parsed?.data && parsed?.data?.e === 'bookTicker') {
            const t = parsed.data as BackpackBookTicker;
            const symbol = mapPairToUiSymbol(t.s);
            const now = Date.now();

            const ask = Number(t.a);
            const bid = Number(t.b);

            if (Number.isFinite(ask) && Number.isFinite(bid)) {
              setSymbolPrice(symbol, { ask, bid, time: now });

              const askMsg: TradeMessage = {
                type: 'ASK',
                symbol,
                price: ask,
                originalPrice: ask,
                quantity: Number(t.A) || 0,
                time: now,
              };
              const bidMsg: TradeMessage = {
                type: 'BID',
                symbol,
                price: bid,
                originalPrice: bid,
                quantity: Number(t.B) || 0,
                time: now,
              };

              listeners.forEach((cb) => cb(askMsg));
              listeners.forEach((cb) => cb(bidMsg));
            }

            return;
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        ws = null;

        // Don't clear listeners - they're still mounted!
        // Auto-reconnect after 3 seconds if there are still listeners
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          if (listeners.length > 0 && !ws) {
            connectWebSocket();
          }
        }, 3000);
      };
    };

    // Handle page visibility changes (laptop sleep/wake)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - reconnect if needed
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial connection
    connectWebSocket();

    // Cancel any pending close timeout since we have an active listener
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }

    // Register listener for this hook call
    listeners.push(stableCallback);

    // Cleanup when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listeners = listeners.filter((cb) => cb !== stableCallback);

      // If no more listeners, schedule socket close after a delay
      // This prevents rapid close/reconnect cycles during component remounts
      if (listeners.length === 0 && ws) {
        if (closeTimeout) clearTimeout(closeTimeout);
        closeTimeout = setTimeout(() => {
          // Double-check there are still no listeners
          if (listeners.length === 0 && ws) {
            ws.close();
            ws = null;
          }
        }, 1000); // Wait 1 second before closing
      }
    };
  }, []);
}

type BackpackBookTicker = {
  e: 'bookTicker';
  E: number;
  s: string;
  a: string;
  A: string;
  b: string;
  B: string;
  u: string;
  T: number;
};

function mapPairToUiSymbol(pair: string): string {
  // Example inputs: BTC_USDC, ETH_USDC, SOL_USDC
  // UI expects: BTCUSDT, ETHUSDT, SOLUSDT (for Binance compatibility)
  const compact = pair.replace('_', '');
  if (compact.endsWith('USDC')) return compact.replace('USDC', 'USDT');
  return compact;
}
