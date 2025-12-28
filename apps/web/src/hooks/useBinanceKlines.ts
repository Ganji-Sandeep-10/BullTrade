import { useEffect, useRef } from 'react';

export interface BinanceKline {
  t: number; // Kline start time
  T: number; // Kline close time
  s: string; // Symbol
  i: string; // Interval
  f: number; // First trade ID
  L: number; // Last trade ID
  o: string; // Open price
  c: string; // Close price
  h: string; // High price
  l: string; // Low price
  v: string; // Base asset volume
  n: number; // Number of trades
  x: boolean; // Is this kline closed?
  q: string; // Quote asset volume
  V: string; // Taker buy base asset volume
  Q: string; // Taker buy quote asset volume
  B: string; // Ignore
}

interface UseBinanceKlinesOptions {
  symbol: string;
  interval: string;
  onUpdate: (candle: { time: number; open: number; high: number; low: number; close: number }) => void;
}

function mapIntervalToBinance(interval: string): string {
  if (interval === '10m') return '15m';
  return interval;
}

export function useBinanceKlines({ symbol, interval, onUpdate }: UseBinanceKlinesOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Convert symbol to lowercase for Binance stream
    const wsSymbol = symbol.toLowerCase();
    const mappedInterval = mapIntervalToBinance(interval);
    const wsUrl = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${mappedInterval}`;

    console.log(`🔌 Connecting to Binance WS: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.e === 'kline') {
          const k = message.k as BinanceKline;
          const candle = {
            time: Math.floor(k.t / 1000), // Convert to seconds
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          };
          onUpdate(candle);
        }
      } catch (error) {
        console.error('Error parsing Binance WS message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Binance WS error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [symbol, interval, onUpdate]);
}
