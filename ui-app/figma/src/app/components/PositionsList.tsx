import { ChevronDown } from 'lucide-react';

interface Position {
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

interface PositionsListProps {
  title: string;
  positions: Position[];
}

export function PositionsList({ title, positions }: PositionsListProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3>{title}</h3>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Свернуть
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm text-gray-600 font-normal">
                <div className="flex items-center gap-1">
                  Название
                  <ChevronDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-right py-3 px-2 text-sm text-gray-600 font-normal">Цена</th>
              <th className="text-right py-3 px-2 text-sm text-gray-600 font-normal">Стоимость</th>
              <th className="text-right py-3 px-2 text-sm text-gray-600 font-normal">За все время</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${position.iconBg}`}>
                      <span className="text-lg">{position.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm mb-0.5">{position.name}</div>
                      <div className="text-xs text-gray-500">{position.ticker}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="text-sm">
                    {position.purchasePrice.toLocaleString('ru-RU')} ₽ → {position.currentPrice.toLocaleString('ru-RU')} ₽
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="text-sm mb-0.5">{position.totalValue.toLocaleString('ru-RU')} ₽</div>
                  <div className="text-xs text-gray-500">{position.amount} шт.</div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className={`text-sm mb-0.5 ${position.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.change >= 0 ? '+' : ''}{position.change.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className={`text-xs ${position.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.changePercent.toFixed(2)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
