export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  lastUpdate: string;
  isRealData?: boolean; // Indicates if data is from real API or simulated
}

export interface HistoricalData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  description: string;
}

export interface Portfolio {
  id: string;
  stocks: PortfolioStock[];
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
}

export interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketSummary {
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }[];
  topGainers: StockData[];
  topLosers: StockData[];
  mostActive: StockData[];
}

export interface AlertConfig {
  id: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLUME_ABOVE' | 'CHANGE_PERCENT';
  threshold: number;
  enabled: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  symbols: string[];
}
