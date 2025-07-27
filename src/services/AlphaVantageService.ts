import type { StockData, HistoricalData, MarketSummary } from '../types/financial';

export class AlphaVantageService {
  private static instance: AlphaVantageService;
  private readonly API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  private readonly BASE_URL = 'https://www.alphavantage.co/query';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  private constructor() {}

  public static getInstance(): AlphaVantageService {
    if (!AlphaVantageService.instance) {
      AlphaVantageService.instance = new AlphaVantageService();
    }
    return AlphaVantageService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private async makeRequest(params: Record<string, string>): Promise<any> {
    const url = new URL(this.BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append('apikey', this.API_KEY);

    const cacheKey = url.toString();
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for API errors
      if (data['Error Message'] || data['Note'] || data['Information']) {
        const errorMsg = data['Error Message'] || data['Note'] || data['Information'];
        if (errorMsg.includes('rate limit') || errorMsg.includes('premium')) {
          console.warn('⚠️ Alpha Vantage API rate limit reached. Using fallback data.');
        } else {
          console.warn('⚠️ Alpha Vantage API issue:', errorMsg);
        }
        throw new Error(errorMsg);
      }

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Alpha Vantage API Error:', error);
      throw error;
    }
  }

  async getStockData(symbol: string): Promise<StockData> {
    try {
      const data = await this.makeRequest({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase()
      });

      const quote = data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const price = parseFloat(quote['05. price']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      return {
        symbol: symbol.toUpperCase(),
        name: this.getCompanyName(symbol),
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: parseInt(quote['06. volume']),
        marketCap: 0, // Alpha Vantage doesn't provide this in quote
        high52Week: parseFloat(quote['03. high']),
        low52Week: parseFloat(quote['04. low']),
        lastUpdate: new Date().toISOString(),
        isRealData: true, // Mark as real API data
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // Fallback to mock data if API fails
      return this.getMockStockData(symbol);
    }
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    // Process symbols with delays to avoid rate limiting
    const results: StockData[] = [];
    
    for (const symbol of symbols) {
      try {
        const data = await this.getStockData(symbol);
        results.push(data);
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        // Add mock data if API fails
        results.push(this.getMockStockData(symbol));
      }
    }
    
    return results;
  }

  async getHistoricalData(symbol: string, period: string = '1M'): Promise<HistoricalData[]> {
    try {
      const data = await this.makeRequest({
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: 'compact' // Last 100 data points
      });

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : 90;
      const sortedDates = Object.keys(timeSeries).sort().slice(-days);

      return sortedDates.map(date => ({
        timestamp: date,
        open: parseFloat(timeSeries[date]['1. open']),
        high: parseFloat(timeSeries[date]['2. high']),
        low: parseFloat(timeSeries[date]['3. low']),
        close: parseFloat(timeSeries[date]['4. close']),
        volume: parseInt(timeSeries[date]['5. volume'])
      }));

    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Fallback to mock data
      return this.getMockHistoricalData(symbol, period);
    }
  }

  async getMarketSummary(): Promise<MarketSummary> {
    try {
      // Get data for major stocks
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'];
      const stocks = await this.getMultipleStocks(symbols);
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
    } catch (error) {
      console.error('Error fetching market summary:', error);
      // Fallback to mock data
      return this.getMockMarketSummary();
    }
  }

  // Fallback methods for when API fails
  private getMockStockData(symbol: string): StockData {
    const mockPrices: Record<string, number> = {
      'AAPL': 175.43, 'GOOGL': 2847.63, 'MSFT': 334.75, 'AMZN': 3342.88,
      'TSLA': 1008.78, 'NVDA': 220.89, 'META': 331.26, 'NFLX': 400.52
    };

    const basePrice = mockPrices[symbol.toUpperCase()] || 100;
    const change = (Math.random() - 0.5) * 10;
    const price = Math.max(0.01, basePrice + change);
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
      high52Week: Math.round((price * (1.2 + Math.random() * 0.3)) * 100) / 100,
      low52Week: Math.round((price * (0.7 - Math.random() * 0.2)) * 100) / 100,
      lastUpdate: new Date().toISOString(),
      isRealData: false, // Mark as simulated data
    };
  }

  private getMockHistoricalData(_symbol: string, period: string): HistoricalData[] {
    const basePrice = 100;
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

  private getMockMarketSummary(): MarketSummary {
    return {
      indices: [
        { name: 'S&P 500', value: 4445.70, change: 12.45, changePercent: 0.28 },
        { name: 'DOW JONES', value: 34908.05, change: -89.24, changePercent: -0.26 },
        { name: 'NASDAQ', value: 13421.47, change: 52.90, changePercent: 0.40 },
      ],
      topGainers: [],
      topLosers: [],
      mostActive: [],
    };
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
    return names[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corp.`;
  }
}
