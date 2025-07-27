// Test direct API call
const API_KEY = 'DFX2NZQKYN9NH7Y3';
const symbol = 'AAPL';

async function testAPI() {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    console.log('Testing API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data['Global Quote']) {
      console.log('✅ API is working! Stock price:', data['Global Quote']['05. price']);
    } else {
      console.log('❌ API returned unexpected format:', data);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

// Test the API
testAPI();
