import React from 'react';
import type { StockData } from '../types/financial';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PortfolioStatsProps {
  stocks: StockData[];
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({ stocks }) => {
  const calculateStats = () => {
    if (stocks.length === 0) {
      return {
        totalValue: 0,
        totalChange: 0,
        totalChangePercent: 0,
        gainers: 0,
        losers: 0,
      };
    }

    const totalValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;
    const gainers = stocks.filter(stock => stock.change > 0).length;
    const losers = stocks.filter(stock => stock.change < 0).length;

    return {
      totalValue,
      totalChange,
      totalChangePercent,
      gainers,
      losers,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.totalValue)}
            </p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Change */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Change</p>
            <p className={`text-xl font-bold ${
              stats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(stats.totalChange)}
            </p>
            <p className={`text-sm ${
              stats.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(stats.totalChangePercent)}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${
            stats.totalChange >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {stats.totalChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Gainers */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Gainers</p>
            <p className="text-xl font-bold text-green-600">{stats.gainers}</p>
            <p className="text-sm text-gray-500">
              {stocks.length > 0 ? ((stats.gainers / stocks.length) * 100).toFixed(0) : 0}% of portfolio
            </p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Losers */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Losers</p>
            <p className="text-xl font-bold text-red-600">{stats.losers}</p>
            <p className="text-sm text-gray-500">
              {stocks.length > 0 ? ((stats.losers / stocks.length) * 100).toFixed(0) : 0}% of portfolio
            </p>
          </div>
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
