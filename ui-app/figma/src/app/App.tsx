import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PortfolioChart } from './components/PortfolioChart';
import { PriceChart } from './components/PriceChart';
import { Analytics } from './components/Analytics';
import { NewsList } from './components/NewsList';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('stocks');

  const accounts = [
    {
      id: 'stocks',
      name: 'Портфель с акциями',
      icon: '📊',
      balance: 4455.2,
      change: 470.13,
      changePercent: 11.8,
    },
    {
      id: 'bonds',
      name: 'Досрочное погашение',
      icon: '💼',
      balance: 105317.82,
      change: 14100.85,
      changePercent: 15.46,
    },
    {
      id: 'other',
      name: 'Облигации',
      icon: '📈',
      balance: 62079.81,
      change: -5183.06,
      changePercent: -7.71,
    },
  ];

  const portfolioData = [
    { month: 'Март', value: 165000 },
    { month: 'Май', value: 168000 },
    { month: 'Июль', value: 170000 },
    { month: 'Сентябрь', value: 167000 },
    { month: 'Ноябрь', value: 169000 },
    { month: 'Янв, 2026', value: 171000 },
    { month: 'Март', value: 171852 },
  ];

  const stockPositions = [
    {
      id: '1',
      name: 'Корпоративный Центр Икс 5',
      ticker: 'Х5',
      icon: 'Х5',
      iconBg: 'bg-green-600 text-white',
      purchasePrice: 1943,
      currentPrice: 2406.5,
      amount: 1,
      totalValue: 2406.5,
      change: 463.5,
      changePercent: 23.85,
    },
    {
      id: '2',
      name: 'Х5 RetailGroup ГДР',
      ticker: 'FIVE',
      icon: 'Х5',
      iconBg: 'bg-green-600 text-white',
      purchasePrice: 0,
      currentPrice: 0,
      amount: 1,
      totalValue: 0,
      change: 0,
      changePercent: 0.0,
    },
  ];

  const bondsPositions = [
    {
      id: '1',
      name: 'Квадратные метры',
      ticker: 'TKVM',
      icon: '🏢',
      iconBg: 'bg-yellow-500 text-white',
      purchasePrice: 4.92,
      currentPrice: 6.55,
      amount: 1,
      totalValue: 6.55,
      change: 1.63,
      changePercent: 33.13,
    },
  ];

  const currencyPositions = [
    {
      id: '1',
      name: 'Российский рубль',
      ticker: 'RUB',
      icon: '🇷🇺',
      iconBg: 'bg-blue-600',
      purchasePrice: 0,
      currentPrice: 0,
      amount: 0,
      totalValue: 2037.15,
      change: 0,
      changePercent: 0,
    },
  ];

  const analyticsData = [
    { name: 'Акции', value: 65000, color: '#5B9FD5' },
    { name: 'Облигации', value: 56000, color: '#B565D8' },
    { name: 'Фонды', value: 50852, color: '#9FD55B' },
  ];

  const newsItems = [
    {
      id: '1',
      title: 'Удержание налога по дивид...',
      description: 'Х5, Портфель с акциями',
      date: '22.01.2026',
      time: '14:18',
      amount: '-48 ₽',
      iconBg: 'bg-blue-100',
      icon: '🏛️',
    },
    {
      id: '2',
      title: 'Выплата дивидендов по акц...',
      description: 'Х5, Портфель с акциями',
      date: '22.01.2026',
      time: '14:18',
      amount: '+368 ₽',
      iconBg: 'bg-green-100',
      icon: '💰',
    },
    {
      id: '3',
      title: 'Удержание налога по ставке 13...',
      description: 'Портфель с акциями',
      date: '1.01.2026',
      time: '4:45',
      amount: '-41 ₽',
      iconBg: 'bg-blue-100',
      icon: '🏛️',
    },
    {
      id: '4',
      title: 'Погашение ОФЗ 26229',
      description: 'SU26229RMFS3, Досрочное пог...',
      date: '13.11.2025',
      time: '14:04',
      amount: '+1 000 ₽',
      iconBg: 'bg-yellow-100',
      icon: '📄',
    },
  ];

  const priceData = [
    { date: '10:00', price: 2450 },
    { date: '11:00', price: 2480 },
    { date: '12:00', price: 2460 },
    { date: '13:00', price: 2520 },
    { date: '14:00', price: 2510 },
    { date: '15:00', price: 2550 },
    { date: '16:00', price: 2530 },
    { date: '17:00', price: 2570 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          
          <PortfolioChart 
            data={portfolioData}
            stockPositions={stockPositions}
            bondsPositions={bondsPositions}
            currencyPositions={currencyPositions}
          />

          <PriceChart
            data={priceData}
            ticker="SBER"
            currentPrice={257.50}
            change={5.30}
            changePercent={2.10}
          />

          <div className="grid grid-cols-2 gap-6 mt-6">
            <Analytics 
              data={analyticsData} 
              totalValue={171852}
            />
            <NewsList items={newsItems} />
          </div>
        </div>
      </div>
    </div>
  );
}