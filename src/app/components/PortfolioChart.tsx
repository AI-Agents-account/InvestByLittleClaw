import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { PositionsList } from './PositionsList';

interface PortfolioChartPosition {
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
}

interface PortfolioChartProps {
  data: Array<{ month: string; value: number }>;
  stockPositions: Array<PortfolioChartPosition>;
  bondsPositions: Array<PortfolioChartPosition>;
  fundsPositions: Array<PortfolioChartPosition>;
  futuresPositions: Array<PortfolioChartPosition>;
  currencyPositions: Array<PortfolioChartPosition>;
  unallocatedPositions: Array<PortfolioChartPosition>;
  onSelectPosition?: (position: PortfolioChartPosition) => void;
}

export function PortfolioChart({
  data,
  stockPositions,
  bondsPositions,
  fundsPositions,
  futuresPositions,
  currencyPositions,
  unallocatedPositions,
  onSelectPosition,
}: PortfolioChartProps) {
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

      {(() => {
        const groups = [
          { key: 'stocks', title: 'Акции', positions: stockPositions },
          { key: 'funds', title: 'Фонды', positions: fundsPositions },
          { key: 'bonds', title: 'Облигации', positions: bondsPositions },
          { key: 'futures', title: 'Фьючерсы', positions: futuresPositions },
          { key: 'currency', title: 'Валюта', positions: currencyPositions },
          { key: 'unallocated', title: 'Нераспределенные', positions: unallocatedPositions },
        ].filter((group) => group.positions.length > 0);

        const hasAnyPositions = groups.length > 0;

        if (!hasAnyPositions) {
          // No positions at all – hide the entire positions area (no empty tables/headers)
          return null;
        }

        return (
          <div className="mt-8">
            {groups.map((group) => (
              <PositionsList
                key={group.key}
                title={group.title}
                positions={group.positions}
                onSelectPosition={onSelectPosition}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
