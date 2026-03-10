// UI-level models used by React components. These are derived from backend DTOs
// via mapping functions in `mappers.ts`.

export interface Account {
  id: string;
  name: string;
  icon: string; // simple string for now (emoji or initials)
  currency: string;
  balance: number;
  change: number;
  changePercent: number;
}

export interface PortfolioHistoryPoint {
  month: string; // formatted label for the chart x-axis
  value: number;
}

export interface Position {
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
  // Canonical UI category used for grouping in the frontend
  category: 'stocks' | 'funds' | 'bonds' | 'futures' | 'currency' | 'unallocated';
  // Raw backend type string preserved for display / debugging if needed
  type: string;
}

export interface AnalyticsSlice {
  name: string;
  value: number;
  color: string;
}

export interface PortfolioEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  amount?: string;
  iconBg: string;
  icon: string;
}

export interface InstrumentQuote {
  ticker: string;
  instrumentId: string;
  currency: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export interface InstrumentPricePoint {
  date: string;
  price: number;
}

export interface InstrumentSearchResult {
  id: string;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'fund' | 'currency';
  currency: string;
}
