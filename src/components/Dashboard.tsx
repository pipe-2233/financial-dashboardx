import React, { useState } from 'react';
import { StockCard } from './StockCard';
import { StockChart } from './StockChart';
import { MarketSummary } from './MarketSummary';
import { LoadingCard } from './LoadingSpinner';
import { PortfolioStats } from './PortfolioStats';
import { useStockData } from '../hooks/useFinancialData';
import { Search, RefreshCw, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

export const Dashboard: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_SYMBOLS);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [searchSymbol, setSearchSymbol] = useState('');
  
  const { stocks, loading, error, lastUpdate, refetch } = useStockData(watchlist);

  const handleAddStock = () => {
    if (searchSymbol && !watchlist.includes(searchSymbol.toUpperCase())) {
      setWatchlist([...watchlist, searchSymbol.toUpperCase()]);
      setSearchSymbol('');
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    if (selectedStock === symbol && watchlist.length > 1) {
      setSelectedStock(watchlist.find(s => s !== symbol) || watchlist[0]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStock();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600">Real-time market analysis and portfolio tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* DEMO DISCLAIMER */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-yellow-800 font-semibold">Demo Mode</h3>
            <p className="text-yellow-700 text-sm">
              This is a demonstration dashboard. All portfolio values and trading data are simulated. 
              Market data is real and provided by Alpha Vantage API. <strong>No real money is involved.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleAddStock}
            disabled={!searchSymbol}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Stock
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Error: {error}
          </div>
        </div>
      )}

      <MarketSummary />

      <PortfolioStats stocks={stocks} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stock Grid */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Watchlist</h2>
            <span className="text-sm text-gray-500">{stocks.length} stocks</span>
          </div>
          
          {loading && stocks.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} title="Loading stock data..." height={180} />
              ))}
            </div>
          ) : (
            <div className="stock-grid">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="relative group">
                  <StockCard
                    stock={stock}
                    onClick={() => setSelectedStock(stock.symbol)}
                  />
                  <button
                    onClick={() => handleRemoveStock(stock.symbol)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                    title="Remove from watchlist"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="xl:col-span-1">
          <StockChart symbol={selectedStock} height={400} />
        </div>
      </div>
    </div>
  );
};
