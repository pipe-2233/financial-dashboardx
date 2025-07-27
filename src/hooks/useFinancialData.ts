import { useState, useEffect, useCallback } from 'react';
import type { StockData, MarketSummary } from '../types/financial';
import FinancialModelingPrepService from '../services/FinancialModelingPrepService';

export const useStockData = (symbols: string[]) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const financialService = new FinancialModelingPrepService();

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stockData = await financialService.getMultipleStocks(symbols);
      setStocks(stockData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbols, financialService]);

  useEffect(() => {
    if (symbols.length > 0) {
      fetchStocks();
    }
  }, [fetchStocks, symbols]);

  // Set up periodic updates
  useEffect(() => {
    if (symbols.length === 0) return;

    // Conservative update intervals to preserve API quota
    // Real data: every 1 hour (3600000ms), Mock data: every 2 hours (7200000ms)
    const updateInterval = financialService.hasApiKey() ? 3600000 : 7200000;
    
    const interval = setInterval(() => {
      fetchStocks();
    }, updateInterval);

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

  const financialService = new FinancialModelingPrepService();

  const fetchMarketSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await financialService.getMarketSummary();
      setMarketSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market summary');
    } finally {
      setLoading(false);
    }
  }, [financialService]);

  useEffect(() => {
    fetchMarketSummary();
    
    // Refresh every 1 hour for real data, every 2 hours for mock data
    const interval = setInterval(fetchMarketSummary, financialService.hasApiKey() ? 3600000 : 7200000);
    return () => clearInterval(interval);
  }, [fetchMarketSummary]);

  return {
    marketSummary,
    loading,
    error,
    refetch: fetchMarketSummary,
  };
};
