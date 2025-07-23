import { useState, useEffect, useCallback } from 'react';
import type { StockData, MarketSummary } from '../types/financial';
import { FinancialService } from '../services/FinancialService';

export const useStockData = (symbols: string[]) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const financialService = FinancialService.getInstance();

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

  // Set up real-time updates
  useEffect(() => {
    if (symbols.length === 0) return;

    const unsubscribe = financialService.subscribeToRealTimeUpdates(
      symbols,
      (updatedStocks) => {
        setStocks(updatedStocks);
        setLastUpdate(new Date());
      }
    );

    return unsubscribe;
  }, [symbols, financialService]);

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

  const financialService = FinancialService.getInstance();

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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketSummary, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketSummary]);

  return {
    marketSummary,
    loading,
    error,
    refetch: fetchMarketSummary,
  };
};
