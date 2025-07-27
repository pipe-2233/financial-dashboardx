import React from 'react';
import type { StockData } from '../types/financial';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Smartphone,
  Search,
  Monitor,
  ShoppingCart,
  Car,
  Cpu,
  Users,
  Play,
  Building2
} from 'lucide-react';

interface StockCardProps {
  stock: StockData;
  onClick?: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const isPositive = stock.change >= 0;
  const isNegative = stock.change < 0;
  const isNeutral = stock.change === 0;

  const getCompanyIcon = (symbol: string) => {
    const iconProps = { className: "w-8 h-8", strokeWidth: 1.5 };
    
    switch (symbol.toUpperCase()) {
      case 'AAPL':
        return <Smartphone {...iconProps} className="w-8 h-8 text-gray-600" />;
      case 'GOOGL':
      case 'GOOG':
        return <Search {...iconProps} className="w-8 h-8 text-blue-600" />;
      case 'MSFT':
        return <Monitor {...iconProps} className="w-8 h-8 text-blue-700" />;
      case 'AMZN':
        return <ShoppingCart {...iconProps} className="w-8 h-8 text-orange-600" />;
      case 'TSLA':
        return <Car {...iconProps} className="w-8 h-8 text-red-600" />;
      case 'NVDA':
        return <Cpu {...iconProps} className="w-8 h-8 text-green-600" />;
      case 'META':
        return <Users {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'NFLX':
        return <Play {...iconProps} className="w-8 h-8 text-red-500" />;
      default:
        return <Building2 {...iconProps} className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${formatNumber(marketCap, 0)}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <div 
      className={`card hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getCompanyIcon(stock.symbol)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 truncate max-w-48">{stock.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            ${formatNumber(stock.price)}
          </div>
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 
            isNegative ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
            {isNeutral && <Minus className="w-4 h-4 mr-1" />}
            {isPositive && '+'}${formatNumber(Math.abs(stock.change))} 
            ({isPositive && '+'}{formatNumber(stock.changePercent)}%)
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block">Volume</span>
          <span className="font-medium text-gray-900">{formatVolume(stock.volume)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Market Cap</span>
          <span className="font-medium text-gray-900">{formatMarketCap(stock.marketCap)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">52W High</span>
          <span className="font-medium text-gray-900">${formatNumber(stock.high52Week)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">52W Low</span>
          <span className="font-medium text-gray-900">${formatNumber(stock.low52Week)}</span>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last updated: {new Date(stock.lastUpdate).toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-2">
            {stock.isRealData ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                REAL DATA
              </span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                SIMULATED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
