import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface AnalyticsData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsProps {
  data: AnalyticsData[];
  totalValue: number;
}

export function Analytics({ data, totalValue }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('stocks');

  const tabs = [
    { id: 'stocks', label: 'Активы' },
    { id: 'companies', label: 'Компании' },
    { id: 'sectors', label: 'Отрасли' },
    { id: 'currency', label: 'Валюта' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="mb-4">Аналитика ›</h3>
      
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-yellow-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-center">
          <div className="text-2xl mb-1">{totalValue.toLocaleString('ru-RU')} ₽</div>
          <div className="text-sm text-gray-500">{data.length} актива</div>
        </div>
      </div>
    </div>
  );
}
