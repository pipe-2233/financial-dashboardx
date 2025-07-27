# 🔄 Migración de API: Alpha Vantage → Financial Modeling Prep

## 📊 Resumen de la Migración

Hemos migrado de **Alpha Vantage** a **Financial Modeling Prep (FMP)** para obtener mejores límites de rate y más datos financieros.

## 🚫 Problemas con Alpha Vantage

- **Rate Limit Muy Bajo**: Solo 25 requests/día
- **Datos Limitados**: No incluía market cap ni otros datos importantes
- **Restricciones Severas**: No viable para uso en desarrollo/demo

## ✅ Beneficios de Financial Modeling Prep

| Característica | Alpha Vantage | Financial Modeling Prep |
|---|---|---|
| **Requests/día** | 25 | 250 (10x más) |
| **Acciones Disponibles** | Limitado | 40,000+ |
| **Market Cap** | ❌ | ✅ |
| **Batch Requests** | ❌ | ✅ |
| **Company Profiles** | ❌ | ✅ |
| **Market Data** | Básico | Completo |

## 🔧 Cambios Técnicos Realizados

### 1. Nuevo Servicio API
```typescript
// Antes: AlphaVantageService.ts
// Ahora: FinancialModelingPrepService.ts
```

### 2. Endpoints Utilizados
- **Quote Data**: `/api/v3/quote/{symbol}`
- **Company Profile**: `/api/v3/profile/{symbol}`
- **Market Gainers**: `/api/v3/stock_market/gainers`
- **Market Losers**: `/api/v3/stock_market/losers`
- **Most Active**: `/api/v3/stock_market/actives`
- **Market Indices**: `/api/v3/quotes/index`

### 3. Variable de Entorno
```bash
# Antes
VITE_ALPHA_VANTAGE_API_KEY=your_key

# Ahora
VITE_FMP_API_KEY=your_key
```

## 📈 Mejoras en la Funcionalidad

### Datos Mejorados
- **Market Cap Real**: Valores reales de capitalización de mercado
- **Company Names**: Nombres completos de empresas desde perfiles
- **Batch Processing**: Múltiples acciones en una sola request
- **Market Summary**: Datos reales de gainers, losers y most active

### Rate Limiting Mejorado
- **Cache**: 5 minutos para evitar requests innecesarios
- **Fallback**: Mock data cuando no hay API key o se exceden límites
- **Indicadores**: `isRealData` flag para distinguir datos reales vs simulados

## 🎯 Configuración para Desarrollo

### 1. Obtener API Key
1. Ve a [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)
2. Registrate para obtener API key gratuita
3. 250 requests/día sin tarjeta de crédito

### 2. Configurar Variables de Entorno
```bash
# Crea archivo .env
cp .env.example .env

# Agrega tu API key
VITE_FMP_API_KEY=tu_api_key_aqui
```

### 3. GitHub Secrets (para deployment)
```bash
# En GitHub repo settings > Secrets and variables > Actions
FMP_API_KEY=tu_api_key_aqui
```

## 🚀 Próximos Pasos

### Funcionalidades Avanzadas Disponibles
- **Technical Indicators**: RSI, MACD, SMA, EMA
- **Historical Data**: Precios históricos con intervalos
- **Earnings Data**: Calendario de earnings
- **News Integration**: Noticias específicas por stock
- **Real-time WebSocket**: Actualizaciones en tiempo real

### Endpoints Adicionales
```typescript
// Technical Indicators
/api/v3/technical_indicator/5min/{symbol}?type=rsi&period=14

// Historical Data
/api/v3/historical-price-full/{symbol}

// Earnings Calendar
/api/v3/earning_calendar

// Stock News
/api/v3/stock_news?tickers=AAPL,MSFT
```

## 🔍 Monitoreo y Debugging

### Logs en Consola
- ✅ `Financial Modeling Prep API key found`
- ⚠️ `Financial Modeling Prep API key not found. Using mock data.`
- ❌ `Financial Modeling Prep API error or no data`

### Verificación de Rate Limits
- Monitor: requests realizados vs límite diario
- Cache: reduce requests duplicados
- Fallback: mock data cuando se exceden límites

## 📞 Soporte

- **Documentación**: [FMP API Docs](https://site.financialmodelingprep.com/developer/docs)
- **Rate Limits**: 250 requests/día (plan gratuito)
- **Upgrade**: Planes pagos para mayor volumen
