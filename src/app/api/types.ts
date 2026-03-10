// Backend DTO types matching the HTTP contracts described in the docs

export interface AccountDto {
  id: string;
  name: string;
  currency: string;
  balance: number;
  change: number;
  changePercent: number;
}

export interface AccountsResponseDto {
  accounts: AccountDto[];
  total?: {
    currency: string;
    balance: number;
    change: number;
    changePercent: number;
  };
}

export interface PortfolioHistoryPointDto {
  timestamp: string;
  value: number;
}

export interface PortfolioHistoryResponseDto {
  accountId: string;
  currency: string;
  points: PortfolioHistoryPointDto[];
}

export interface PositionDto {
  id: string;
  instrumentId: string;
  name: string;
  ticker: string;
  // Backend now normalizes position type into canonical UI categories.
  // Keep the union explicit for known values but allow unknown strings
  // for forward compatibility.
  type: 'stocks' | 'funds' | 'bonds' | 'futures' | 'currency' | 'unallocated' | string;
  currency: string;
  quantity: number;
  currentPrice: number;
  purchasePrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
}

export interface PositionsResponseDto {
  accountId: string;
  currency: string;
  positions: PositionDto[];
}

export interface PortfolioResponseDto {
  accountId: string;
  currency: string;
  totalAmount: number;
  positions: PositionDto[];
}

export interface InstrumentQuoteDto {
  ticker: string;
  instrumentId: string;
  currency: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  asOf: string;
}

export interface InstrumentPricePointDto {
  timestamp: string;
  price: number;
}

export interface InstrumentPricesResponseDto {
  ticker: string;
  currency: string;
  points: InstrumentPricePointDto[];
}

export interface AllocationSliceDto {
  name: string;
  value: number;
  sharePercent?: number;
}

export interface AllocationResponseDto {
  accountId: string;
  baseCurrency: string;
  totalValue: number;
  totalPositions: number;
  breakdown: AllocationSliceDto[];
}

export type PortfolioEventTypeDto =
  | 'tax'
  | 'dividend'
  | 'coupon'
  | 'redemption'
  | 'trade'
  | 'cash'
  | 'other';

export interface PortfolioEventDto {
  id: string;
  type: PortfolioEventTypeDto;
  title: string;
  description: string;
  accountId?: string;
  instrumentId?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
}

export interface EventsResponseDto {
  accountId: string;
  events: PortfolioEventDto[];
}

export interface InstrumentSearchResultDto {
  id: string;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'fund' | 'currency';
  currency: string;
}

export interface InstrumentSearchResponseDto {
  results: InstrumentSearchResultDto[];
}
