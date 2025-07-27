import { useState, useEffect, useCallback } from 'react';
import type { StockData, MarketSummary } from '../types/financial';
import { AlphaVantageService } from '../services/AlphaVantageService';

export const useStockData = (symbols: string[]) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const alphaVantageService = AlphaVantageService.getInstance();

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stockData = await alphaVantageService.getMultipleStocks(symbols);
      setStocks(stockData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbols, alphaVantageService]);

  useEffect(() => {
    if (symbols.length > 0) {
      fetchStocks();
    }
  }, [fetchStocks, symbols]);

  // Set up periodic updates (Alpha Vantage doesn't have WebSocket, so we'll poll)
  useEffect(() => {
    if (symbols.length === 0) return;

    // Update every 2 minutes to respect rate limits
    const interval = setInterval(() => {
      fetchStocks();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchStocks, symbols]);

  return {
    stocks,
    loading,
    error,
    lastUpdate,
    refetch: fetchStocks,
  };
};

export const useMarketSummary = () => {
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const alphaVantageService = AlphaVantageService.getInstance();

  const fetchMarketSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await alphaVantageService.getMarketSummary();
      setMarketSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market summary');
    } finally {
      setLoading(false);
    }
  }, [alphaVantageService]);

  useEffect(() => {
    fetchMarketSummary();
    
    // Refresh every 5 minutes to respect rate limits
    const interval = setInterval(fetchMarketSummary, 300000);
    return () => clearInterval(interval);
  }, [fetchMarketSummary]);

  return {
    marketSummary,
    loading,
    error,
    refetch: fetchMarketSummary,
  };
};
