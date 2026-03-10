import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export function PriceChart({ data, ticker, currentPrice, change, changePercent }: PriceChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="mb-2">{ticker}</h3>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl">{currentPrice.toLocaleString('ru-RU')} ₽</div>
          <div className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
            {change >= 0 ? '+' : ''}{change.toLocaleString('ru-RU')} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['1Д', '1Н', '1М', '3М', '1Г', 'Все'].map((period) => (
          <button
            key={period}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            {period}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={change >= 0 ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
