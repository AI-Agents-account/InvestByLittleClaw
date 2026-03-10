import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  /**
   * Currently selected backend interval (e.g. '1day', '1hour').
   * Used only to highlight the active period button; mapping from
   * UI labels to backend intervals lives in the parent.
   */
  selectedInterval: string;
  onIntervalChange?: (interval: string) => void;
}

const PERIOD_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '1Д', value: '1day' },
  { label: '1Н', value: '1day' },
  { label: '1М', value: '1day' },
  { label: '3М', value: '1day' },
  { label: '1Г', value: '1day' },
  { label: 'Все', value: '1day' },
];

export function PriceChart({ data, ticker, currentPrice, change, changePercent, selectedInterval, onIntervalChange }: PriceChartProps) {
  const safeCurrentPrice = Number.isFinite(currentPrice) ? currentPrice : 0;
  const safeChange = Number.isFinite(change) ? change : 0;
  const safeChangePercent = Number.isFinite(changePercent) ? changePercent : 0;

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="mb-2">{ticker}</h3>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl">{safeCurrentPrice.toLocaleString('ru-RU')} ₽</div>
          <div className={safeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
            {safeChange >= 0 ? '+' : ''}{safeChange.toLocaleString('ru-RU')} ({safeChangePercent >= 0 ? '+' : ''}{safeChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {PERIOD_OPTIONS.map(({ label, value }) => {
          const isActive = value === selectedInterval;
          return (
            <button
              key={value}
              type="button"
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
              }`}
              onClick={() => onIntervalChange?.(value)}
            >
              {label}
            </button>
          );
        })}
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
