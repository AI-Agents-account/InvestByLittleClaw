import { ChevronDown, Plus } from "lucide-react";

interface Account {
  id: string;
  name: string;
  icon: string;
  balance: number;
  change: number;
  changePercent: number;
}

interface SidebarProps {
  accounts: Account[];
  selectedAccount: string;
  onSelectAccount: (id: string) => void;
}

export function Sidebar({ accounts, selectedAccount, onSelectAccount }: SidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <h2 className="mb-6">Счета</h2>
      
      <div className="mb-4">
        <button className="w-full px-3 py-1.5 rounded-lg border border-gray-300 flex items-center justify-center gap-1 text-sm">
          В рублях
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-6">
        <div className="text-3xl mb-1">
          {accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('ru-RU')} ₽
        </div>
        <div className="text-green-600">
          +{accounts.reduce((sum, acc) => sum + acc.change, 0).toLocaleString('ru-RU')} ₽ (
          {(accounts.reduce((sum, acc) => sum + acc.change, 0) / accounts.reduce((sum, acc) => sum + acc.balance - acc.change, 0) * 100).toFixed(2)}%)
        </div>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelectAccount(account.id)}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${
              selectedAccount === account.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-sm">{account.icon}</span>
              </div>
              <div className="text-sm text-gray-600">{account.name}</div>
            </div>
            <div className="text-lg mb-1">{account.balance.toLocaleString('ru-RU')} ₽</div>
            <div className={account.change >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
              {account.change >= 0 ? '+' : ''}{account.change.toLocaleString('ru-RU')} ₽ ({account.changePercent.toFixed(2)}%)
            </div>
          </button>
        ))}
      </div>

      <button className="w-full mt-4 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors">
        <Plus className="w-5 h-5" />
        Открыть новый счет
      </button>
    </div>
  );
}