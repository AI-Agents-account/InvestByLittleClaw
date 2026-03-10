interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  amount?: string;
  iconBg: string;
  icon: string;
}

interface NewsListProps {
  items: NewsItem[];
}

export function NewsList({ items }: NewsListProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="mb-4">Последние события ›</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
              <span className="text-lg">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 mb-0.5 line-clamp-1">{item.title}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            <div className="text-right flex-shrink-0">
              {item.amount && (
                <div className={`text-sm mb-0.5 ${
                  item.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.amount}
                </div>
              )}
              <div className="text-xs text-gray-500">{item.date}, {item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
