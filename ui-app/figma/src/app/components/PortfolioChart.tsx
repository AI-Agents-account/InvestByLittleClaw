import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { PositionsList } from './PositionsList';

interface PortfolioChartProps {
  data: Array<{ month: string; value: number }>;
  stockPositions: Array<{
    id: string;
    name: string;
    ticker: string;
    icon: string;
    iconBg: string;
    purchasePrice: number;
    currentPrice: number;
    amount: number;
    totalValue: number;
    change: number;
    changePercent: number;
  }>;
  bondsPositions: Array<{
    id: string;
    name: string;
    ticker: string;
    icon: string;
    iconBg: string;
    purchasePrice: number;
    currentPrice: number;
    amount: number;
    totalValue: number;
    change: number;
    changePercent: number;
  }>;
  currencyPositions: Array<{
    id: string;
    name: string;
    ticker: string;
    icon: string;
    iconBg: string;
    purchasePrice: number;
    currentPrice: number;
    amount: number;
    totalValue: number;
    change: number;
    changePercent: number;
  }>;
}

export function PortfolioChart({ data, stockPositions, bondsPositions, currencyPositions }: PortfolioChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      <h3 className="mb-4">Стоимость портфеля ›</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Bar 
            dataKey="value" 
            fill="#5B9FD5" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8">
        <PositionsList title="Акции" positions={stockPositions} />
        <PositionsList title="Фонды" positions={bondsPositions} />
        <PositionsList title="Валюта" positions={currencyPositions} />
      </div>
    </div>
  );
}