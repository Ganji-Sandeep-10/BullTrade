import { useEffect, useRef, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, UTCTimestamp, Time } from 'lightweight-charts';
import { useTheme } from '@/contexts/ThemeContext';
import { useCandles } from '@/hooks/useCandles';
import { useBinanceKlines } from '@/hooks/useBinanceKlines';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

// Calculate appropriate tick size based on timeframe
function getTickSize(interval: string): number {
  const tickSizes: Record<string, number> = {
    '1m': 20,    // $20 increments for 1 minute
    '5m': 50,    // $50 increments for 5 minutes
    '30m': 100,  // $100 increments for 30 minutes
    '1h': 200,   // $200 increments for 1 hour (current default)
    '6h': 500,   // $500 increments for 6 hours
    '1d': 1000,  // $1000 increments for 1 day
    '3d': 2000,  // $2000 increments for 3 days
  };
  return tickSizes[interval] || 200;
}

export function TradingChart({ symbol, interval }: TradingChartProps) {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const initializedRef = useRef(false);

  const { data: historicalCandles } = useCandles(symbol, interval);

  // Handle live updates from Binance WebSocket
  const handleLiveUpdate = useCallback((candle: { time: number; open: number; high: number; low: number; close: number }) => {
    if (candlestickSeriesRef.current) {
      const candleForChart = {
        ...candle,
        time: candle.time as UTCTimestamp,
      };
      if (!initializedRef.current) {
        candlestickSeriesRef.current.setData([candleForChart]);
        initializedRef.current = true;
        return;
      }

      candlestickSeriesRef.current.update(candleForChart);
    }
  }, []);

  useBinanceKlines({
    symbol,
    interval,
    onUpdate: handleLiveUpdate
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with theme-aware colors
    const isDark = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDark ? '#000000' : '#FFFFFF' },
        textColor: isDark ? '#D1D4DC' : '#191919',
      },
      grid: {
        vertLines: { color: isDark ? '#2B2B43' : '#E6E6E6' },
        horzLines: { color: isDark ? '#2B2B43' : '#E6E6E6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDark ? '#2B2B43' : '#D1D4DC',
        tickMarkFormatter: (time: Time, tickMarkType: number, locale: string) => {
          const ts = (typeof time === 'number' ? time : Number(time)) as number;
          const date = new Date(ts * 1000);

          // For different tick mark types, show different formats
          if (tickMarkType === 0) { // Year
            return date.toLocaleDateString('en-IN', {
              year: 'numeric'
            });
          } else if (tickMarkType === 1) { // Month
            return date.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric'
            });
          } else if (tickMarkType === 2) { // Day of month
            return date.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric'
            });
          } else { // Time (hours/minutes)
            return date.toLocaleTimeString('en-IN', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2B2B43' : '#D1D4DC',
        ticksVisible: true,
        minimumWidth: 80,
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
      },
    });

    chartRef.current = chart;

    // Add candlestick series with proper colors (green for bullish, red for bearish)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',        // Green for bullish (close > open)
      downColor: '#ef5350',      // Red for bearish (close < open)
      borderUpColor: '#26a69a',  // Green border for bullish
      borderDownColor: '#ef5350', // Red border for bearish
      wickUpColor: '#26a69a',    // Green wick for bullish
      wickDownColor: '#ef5350',  // Red wick for bearish
    });

    candlestickSeriesRef.current = candlestickSeries;
    initializedRef.current = false;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, interval, theme]);

  useEffect(() => {
    if (!candlestickSeriesRef.current) return;
    if (!historicalCandles || historicalCandles.length === 0) return;

    const dataForChart = historicalCandles.map((c) => ({
      ...c,
      time: c.time as UTCTimestamp,
    }));

    candlestickSeriesRef.current.setData(dataForChart);
    initializedRef.current = true;
  }, [historicalCandles, symbol, interval]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
}
