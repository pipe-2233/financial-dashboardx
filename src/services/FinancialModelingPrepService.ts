import type { StockData, MarketSummary } from '../types/financial';

export default class FinancialModelingPrepService {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private mockDataCache = new Map<string, StockData>(); // Cache for consistent mock data

  constructor() {
    this.apiKey = import.meta.env.VITE_FMP_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Financial Modeling Prep API key not found. Using mock data.');
    }
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private getCacheKey(symbol: string): string {
    return `stock_${symbol.toUpperCase()}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheExpiry;
  }

  private async makeRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Check for API limits or errors
      if (data.error || (Array.isArray(data) && data.length === 0)) {
        console.warn('Financial Modeling Prep API error or no data');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return null;
    }
  }

  private generateMockData(symbol: string): StockData {
    // Check if we already have mock data for this symbol
    const existing = this.mockDataCache.get(symbol.toUpperCase());
    if (existing) {
      // Simulate small price changes (±2%) to make it more realistic
      const priceVariation = (Math.random() - 0.5) * 0.04; // ±2%
      const newPrice = existing.price * (1 + priceVariation);
      const newChange = newPrice - existing.price;
      
      const updatedData: StockData = {
        ...existing,
        price: Number(newPrice.toFixed(2)),
        change: Number(newChange.toFixed(2)),
        changePercent: Number(((newChange / existing.price) * 100).toFixed(2)),
        lastUpdate: new Date().toISOString()
      };
      
      this.mockDataCache.set(symbol.toUpperCase(), updatedData);
      return updatedData;
    }

    // Generate initial mock data for new symbols
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    
    const mockData: StockData = {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: Number((basePrice + change).toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(((change / basePrice) * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor((basePrice + change) * (Math.random() * 1000000000 + 100000000)),
      high52Week: Number((basePrice + Math.abs(change) + Math.random() * 50).toFixed(2)),
      low52Week: Number((basePrice - Math.abs(change) - Math.random() * 50).toFixed(2)),
      lastUpdate: new Date().toISOString(),
      isRealData: false
    };

    this.mockDataCache.set(symbol.toUpperCase(), mockData);
    return mockData;
  }

  private getCompanyName(symbol: string): string {
    const companies: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'NVDA': 'NVIDIA Corporation'
    };
    return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Company`;
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = this.getCacheKey(symbol);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    if (!this.apiKey) {
      return this.generateMockData(symbol);
    }

    // Get the quote data
    const quoteUrl = `${this.baseUrl}/quote/${symbol}?apikey=${this.apiKey}`;
    const quoteData = await this.makeRequest(quoteUrl);
    
    if (!quoteData || !Array.isArray(quoteData) || quoteData.length === 0) {
      console.warn(`No quote data received for ${symbol}, using mock data`);
      return this.generateMockData(symbol);
    }

    const quote = quoteData[0];
    
    // Get company profile for additional data
    const profileUrl = `${this.baseUrl}/profile/${symbol}?apikey=${this.apiKey}`;
    const profileData = await this.makeRequest(profileUrl);
    const profile = profileData && Array.isArray(profileData) ? profileData[0] : null;

    const stockData: StockData = {
      symbol: quote.symbol || symbol.toUpperCase(),
      name: profile?.companyName || quote.name || this.getCompanyName(symbol),
      price: quote.price || 0,
      change: quote.change || 0,
      changePercent: quote.changesPercentage || 0,
      volume: quote.volume || 0,
      marketCap: profile?.mktCap || quote.marketCap || 0,
      high52Week: quote.yearHigh || profile?.range?.split('-')[1] || 0,
      low52Week: quote.yearLow || profile?.range?.split('-')[0] || 0,
      lastUpdate: new Date().toISOString(),
      isRealData: true
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: stockData,
      timestamp: Date.now()
    });

    return stockData;
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    // Use batch request for better efficiency
    if (!this.apiKey) {
      return Promise.all(symbols.map(symbol => this.getStockData(symbol)));
    }

    const symbolList = symbols.join(',');
    const batchUrl = `${this.baseUrl}/quote/${symbolList}?apikey=${this.apiKey}`;
    const batchData = await this.makeRequest(batchUrl);
    
    if (!batchData || !Array.isArray(batchData)) {
      // Fallback to individual requests
      return Promise.all(symbols.map(symbol => this.getStockData(symbol)));
    }

    return Promise.all(symbols.map(async symbol => {
      const quote = batchData.find(q => q.symbol === symbol.toUpperCase());
      if (!quote) {
        return this.generateMockData(symbol);
      }

      // Get additional profile data
      const profileUrl = `${this.baseUrl}/profile/${symbol}?apikey=${this.apiKey}`;
      const profileData = await this.makeRequest(profileUrl);
      const profile = profileData && Array.isArray(profileData) ? profileData[0] : null;

      return {
        symbol: quote.symbol || symbol.toUpperCase(),
        name: profile?.companyName || quote.name || this.getCompanyName(symbol),
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        volume: quote.volume || 0,
        marketCap: profile?.mktCap || quote.marketCap || 0,
        high52Week: quote.yearHigh || profile?.range?.split('-')[1] || 0,
        low52Week: quote.yearLow || profile?.range?.split('-')[0] || 0,
        lastUpdate: new Date().toISOString(),
        isRealData: true
      };
    }));
  }

  async getMarketSummary(): Promise<MarketSummary> {
    if (!this.apiKey) {
      // Return mock data if no API key
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
        mostActive: stocks.sort((a, b) => b.volume - a.volume).slice(0, 3)
      };
    }

    try {
      // Get market indices
      const indicesUrl = `${this.baseUrl}/quotes/index?apikey=${this.apiKey}`;
      const indicesData = await this.makeRequest(indicesUrl);

      // Get market gainers, losers, and most active
      const [gainersData, losersData, activesData] = await Promise.all([
        this.makeRequest(`${this.baseUrl}/stock_market/gainers?apikey=${this.apiKey}`),
        this.makeRequest(`${this.baseUrl}/stock_market/losers?apikey=${this.apiKey}`),
        this.makeRequest(`${this.baseUrl}/stock_market/actives?apikey=${this.apiKey}`)
      ]);

      // Process indices data
      const indices = indicesData && Array.isArray(indicesData) 
        ? indicesData.slice(0, 3).map((index: any) => ({
            name: index.name || index.symbol,
            value: index.price || 0,
            change: index.change || 0,
            changePercent: index.changesPercentage || 0
          }))
        : [
            { name: 'S&P 500', value: 4445.70, change: 12.45, changePercent: 0.28 },
            { name: 'DOW JONES', value: 34908.05, change: -89.24, changePercent: -0.26 },
            { name: 'NASDAQ', value: 13421.47, change: 52.90, changePercent: 0.40 },
          ];

      // Convert market data to StockData format
      const convertToStockData = (stocks: any[]): StockData[] => {
        return stocks ? stocks.slice(0, 3).map((stock: any) => ({
          symbol: stock.symbol || '',
          name: stock.name || this.getCompanyName(stock.symbol),
          price: stock.price || 0,
          change: stock.change || 0,
          changePercent: stock.changesPercentage || 0,
          volume: stock.volume || 0,
          marketCap: stock.marketCap || 0,
          high52Week: 0,
          low52Week: 0,
          lastUpdate: new Date().toISOString(),
          isRealData: true
        })) : [];
      };

      return {
        indices,
        topGainers: convertToStockData(gainersData),
        topLosers: convertToStockData(losersData),
        mostActive: convertToStockData(activesData)
      };
    } catch (error) {
      console.error('Failed to get market summary:', error);
      // Return mock data as fallback
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
        mostActive: stocks.sort((a, b) => b.volume - a.volume).slice(0, 3)
      };
    }
  }

  // Simulate real-time price updates
  subscribeToRealTimeUpdates(symbols: string[], callback: (data: StockData[]) => void): () => void {
    const interval = setInterval(async () => {
      const updates = await this.getMultipleStocks(symbols);
      callback(updates);
    }, 3600000); // Update every 1 hour to conserve API quota (250 requests/day)

    return () => clearInterval(interval);
  }
}
