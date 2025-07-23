import React from 'react';
import { useMarketSummary } from '../hooks/useFinancialData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const MarketSummary: React.FC = () => {
  const { marketSummary, loading, error } = useMarketSummary();

  if (loading) {
    return (
      <div className="card mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !marketSummary) {
    return (
      <div className="card mb-6">
        <div className="flex items-center text-red-600">
          <Activity className="w-5 h-5 mr-2" />
          <span>Unable to load market summary</span>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="mb-6">
      {/* Market Indices */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketSummary.indices.map((index) => (
            <div key={index.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{index.name}</div>
                <div className="text-lg font-bold">{formatNumber(index.value, 2)}</div>
              </div>
              <div className={`flex items-center text-sm font-medium ${
                index.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {index.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {index.change >= 0 && '+'}{formatNumber(index.change)}
                ({index.changePercent >= 0 && '+'}{formatNumber(index.changePercent)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Gainers */}
        <div className="card">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
            Top Gainers
          </h3>
          <div className="space-y-2">
            {marketSummary.topGainers.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-sm text-gray-900">{stock.symbol}</div>
                  <div className="text-xs text-gray-600">${formatNumber(stock.price)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    +{formatNumber(stock.changePercent)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    +${formatNumber(stock.change)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="card">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
            Top Losers
          </h3>
          <div className="space-y-2">
            {marketSummary.topLosers.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-sm text-gray-900">{stock.symbol}</div>
                  <div className="text-xs text-gray-600">${formatNumber(stock.price)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    {formatNumber(stock.changePercent)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    ${formatNumber(stock.change)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="card">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-600" />
            Most Active
          </h3>
          <div className="space-y-2">
            {marketSummary.mostActive.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-sm text-gray-900">{stock.symbol}</div>
                  <div className="text-xs text-gray-600">${formatNumber(stock.price)}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.changePercent >= 0 && '+'}{formatNumber(stock.changePercent)}%
                  </div>
                  <div className="text-xs text-blue-600">
                    {formatNumber(stock.volume / 1000000, 1)}M vol
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
