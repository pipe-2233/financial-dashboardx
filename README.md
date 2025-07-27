# 📈 Financial Analysis Dashboard

Un dashboard moderno para análisis financiero en tiempo real con visualización de datos del mercado de valores, seguimiento de portfolio y análisis técnico.

## ✨ Características

### 🚀 Funcionalidades Principales
- **Monitoreo en Tiempo Real**: Seguimiento de precios de acciones con actualizaciones automáticas
- **Gráficos Interactivos**: Visualización de datos históricos con múltiples períodos de tiempo
- **Resumen del Mercado**: Indices principales, ganadores, perdedores y más activos
- **Watchlist Personalizada**: Agrega y elimina acciones de tu lista de seguimiento
- **Estadísticas de Portfolio**: Valor total, cambios, ganadores vs perdedores
- **Diseño Responsive**: Optimizado para desktop y dispositivos móviles

### 🛠 Tecnologías Utilizadas
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Gráficos**: Chart.js + react-chartjs-2
- **Iconos**: Lucide React
- **Estado**: React Hooks + Custom Hooks
- **API**: Servicio simulado (listo para APIs reales)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Linting con ESLint
```

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx    # Componente principal
│   ├── StockCard.tsx    # Tarjeta de acción individual
│   ├── StockChart.tsx   # Componente de gráficos
│   ├── MarketSummary.tsx # Resumen del mercado
│   ├── PortfolioStats.tsx # Estadísticas del portfolio
│   └── LoadingSpinner.tsx # Componentes de carga
├── hooks/              # Custom hooks
│   └── useFinancialData.ts # Hook para datos financieros
├── services/           # Servicios y lógica de negocio
│   └── FinancialService.ts # Servicio de datos financieros
├── types/              # Definiciones de TypeScript
│   └── financial.ts    # Tipos para datos financieros
└── index.css          # Estilos globales y Tailwind
```

## 🔧 Configuración API

El proyecto usa **Financial Modeling Prep API** para obtener datos financieros reales.

### Configuración de API Key

1. Obtén tu API key gratuita en [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)
2. Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```
3. Agrega tu API key al archivo `.env`:
```bash
VITE_FMP_API_KEY=tu_api_key_aqui
```

### Características de la API
- **250 requests/día** en el plan gratuito
- Datos de **40,000+ acciones** mundiales
- Información financiera en tiempo real
- Múltiples endpoints: quotes, company profiles, market data

### APIs Alternativas
- **Alpha Vantage**: 25 requests/día (limitado)
- **Yahoo Finance**: Datos en tiempo real
- **IEX Cloud**: API confiable para datos del mercado
- **Finnhub**: API completa con noticias y análisis

## 🎨 Personalización

### Colores del Tema
```css
/* En tailwind.config.js */
colors: {
  primary: '#3b82f6',    # Azul principal
  success: '#10b981',    # Verde para ganancias
  danger: '#ef4444',     # Rojo para pérdidas
  warning: '#f59e0b',    # Amarillo para alertas
}
```

## 📱 Características Responsive

El dashboard está optimizado para:
- **Desktop**: Grid completo con sidebar
- **Tablet**: Layout adaptativo
- **Mobile**: Stack vertical con navegación táctil

## 🔄 Actualizaciones en Tiempo Real

El sistema simula actualizaciones en tiempo real cada 5 segundos. Para implementar WebSockets reales:

```typescript
// Ejemplo con Socket.io
const socket = io('ws://api-servidor.com');
socket.on('stock-update', (data) => {
  updateStockPrices(data);
});
```

## 📈 Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Portfolio tracking con P&L real
- [ ] Alertas personalizables
- [ ] Análisis técnico avanzado
- [ ] Noticias financieras integradas
- [ ] Exportación de datos
- [ ] Modo oscuro/claro
- [ ] PWA (Progressive Web App)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
