import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { HistoricalData } from '../types/financial';
import { FinancialService } from '../services/FinancialService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  symbol: string;
  period?: '1D' | '1W' | '1M' | '3M';
  type?: 'line' | 'bar';
  height?: number;
}

export const StockChart: React.FC<StockChartProps> = ({ 
  symbol, 
  period = '1M', 
  type = 'line',
  height = 300 
}) => {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const financialService = FinancialService.getInstance();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const historicalData = await financialService.getHistoricalData(symbol, selectedPeriod);
        setData(historicalData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, selectedPeriod, financialService]);

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(d => d.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false,
      },
      title: {
        display: true,
        text: `${symbol} Price History (${selectedPeriod})`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `Price: $${value.toFixed(2)}`;
          },
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toFixed(2);
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Period Selector */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{symbol} Chart</h3>
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '3M'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        {type === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block">Open</span>
          <span className="font-medium">${data[0]?.open.toFixed(2) || '0.00'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">High</span>
          <span className="font-medium text-green-600">
            ${Math.max(...data.map(d => d.high)).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Low</span>
          <span className="font-medium text-red-600">
            ${Math.min(...data.map(d => d.low)).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Close</span>
          <span className="font-medium">
            ${data[data.length - 1]?.close.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};
