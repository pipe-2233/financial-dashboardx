import type { StockData, HistoricalData, MarketSummary, NewsItem, TechnicalIndicator } from '../types/financial';

export class FinancialService {
  private static instance: FinancialService;
  private mockPrices: Map<string, number> = new Map();

  private constructor() {
    this.initializeMockPrices();
  }

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  private initializeMockPrices(): void {
    this.mockPrices.set('AAPL', 175.43);
    this.mockPrices.set('GOOGL', 2847.63);
    this.mockPrices.set('MSFT', 334.75);
    this.mockPrices.set('AMZN', 3342.88);
    this.mockPrices.set('TSLA', 1008.78);
    this.mockPrices.set('NVDA', 220.89);
    this.mockPrices.set('META', 331.26);
    this.mockPrices.set('NFLX', 400.52);
  }

  async getStockData(symbol: string): Promise<StockData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const basePrice = this.mockPrices.get(symbol) || 100;
    const change = (Math.random() - 0.5) * 10;
    const price = Math.max(0.01, basePrice + change);
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      name: this.getCompanyName(symbol),
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
      high52Week: Math.round((price * (1.2 + Math.random() * 0.3)) * 100) / 100,
      low52Week: Math.round((price * (0.7 - Math.random() * 0.2)) * 100) / 100,
      lastUpdate: new Date().toISOString(),
    };
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    return Promise.all(symbols.map(symbol => this.getStockData(symbol)));
  }

  async getHistoricalData(symbol: string, period: string = '1M'): Promise<HistoricalData[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const basePrice = this.mockPrices.get(symbol) || 100;
    const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 90;
    const data: HistoricalData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const open = basePrice + (Math.random() - 0.5) * 20;
      const close = open + (Math.random() - 0.5) * 10;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      data.push({
        timestamp: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.floor(Math.random() * 5000000) + 500000,
      });
    }
    
    return data;
  }

  async getMarketSummary(): Promise<MarketSummary> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stocks = await this.getMultipleStocks(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']);
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    
    return {
      indices: [
        { name: 'S&P 500', value: 4445.70, change: 12.45, changePercent: 0.28 },
        { name: 'DOW JONES', value: 34908.05, change: -89.24, changePercent: -0.26 },
        { name: 'NASDAQ', value: 13421.47, change: 52.90, changePercent: 0.40 },
      ],
      topGainers: sorted.slice(0, 3),
      topLosers: sorted.slice(-3).reverse(),
      mostActive: stocks.sort((a, b) => b.volume - a.volume).slice(0, 3),
    };
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [
      { name: 'RSI (14)', value: 45 + Math.random() * 30, signal: Math.random() > 0.5 ? 'BUY' : 'SELL', description: 'Relative Strength Index' },
      { name: 'MACD', value: (Math.random() - 0.5) * 2, signal: Math.random() > 0.6 ? 'BUY' : 'HOLD', description: 'Moving Average Convergence Divergence' },
      { name: 'SMA (20)', value: (this.mockPrices.get(symbol) || 100) * (0.95 + Math.random() * 0.1), signal: 'HOLD', description: 'Simple Moving Average' },
      { name: 'EMA (12)', value: (this.mockPrices.get(symbol) || 100) * (0.98 + Math.random() * 0.04), signal: 'BUY', description: 'Exponential Moving Average' },
    ];
  }

  async getNews(symbols?: string[]): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Tech Stocks Rally Continues as AI Investments Soar',
        summary: 'Major technology companies see continued growth driven by artificial intelligence investments and cloud computing demand.',
        url: '#',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Financial Times',
        symbols: ['AAPL', 'GOOGL', 'MSFT', 'NVDA']
      },
      {
        id: '2',
        title: 'Market Volatility Expected as Fed Meeting Approaches',
        summary: 'Investors await Federal Reserve decision on interest rates amid ongoing inflation concerns.',
        url: '#',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: 'Reuters',
        symbols: []
      },
      {
        id: '3',
        title: 'Electric Vehicle Sales Surge in Q4',
        summary: 'EV manufacturers report record sales numbers as consumer adoption accelerates.',
        url: '#',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: 'Bloomberg',
        symbols: ['TSLA']
      },
    ];
    
    return mockNews.filter(news => 
      !symbols || symbols.length === 0 || 
      symbols.some(symbol => news.symbols.includes(symbol))
    );
  }

  // Simulate real-time price updates
  subscribeToRealTimeUpdates(symbols: string[], callback: (data: StockData[]) => void): () => void {
    const interval = setInterval(async () => {
      const updates = await this.getMultipleStocks(symbols);
      callback(updates);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  private getCompanyName(symbol: string): string {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
    };
    return names[symbol] || `${symbol} Corp.`;
  }
}
