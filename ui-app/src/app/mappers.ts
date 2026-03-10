import type {
  AccountDto,
  PortfolioHistoryResponseDto,
  PositionsResponseDto,
  AllocationResponseDto,
  PortfolioEventDto,
  InstrumentQuoteDto,
  InstrumentPricesResponseDto,
  InstrumentSearchResultDto,
} from './api/types';
import type {
  Account,
  PortfolioHistoryPoint,
  Position,
  AnalyticsSlice,
  PortfolioEvent,
  InstrumentQuote,
  InstrumentPricePoint,
  InstrumentSearchResult,
} from './models';

const DEFAULT_POSITION_ICON_BG = 'bg-gray-700 text-white';

function pickIconFromTicker(ticker: string): string {
  if (!ticker) return '';
  const trimmed = ticker.trim();
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export function mapAccountDto(dto: AccountDto): Account {
  return {
    id: dto.id ?? '',
    name: dto.name ?? '',
    icon: pickIconFromTicker(dto.id ?? ''),
    currency: dto.currency ?? '',
    balance: typeof dto.balance === 'number' ? dto.balance : 0,
    change: typeof dto.change === 'number' ? dto.change : 0,
    changePercent: typeof dto.changePercent === 'number' ? dto.changePercent : 0,
  };
}

export function mapPortfolioHistoryDto(
  dto: PortfolioHistoryResponseDto,
): PortfolioHistoryPoint[] {
  if (!dto || !Array.isArray(dto.points)) {
    // eslint-disable-next-line no-console
    console.warn('[mappers:mapPortfolioHistoryDto] dto.points is not an array, returning empty history', dto);
    return [];
  }

  return dto.points.map((p) => ({
    month: new Date(p.timestamp).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
    }),
    value: typeof p.value === 'number' ? p.value : 0,
  }));
}

type PositionCategory = 'stocks' | 'funds' | 'bonds' | 'futures' | 'currency' | 'unallocated';

const EPSILON = 1e-9;
function isZeroOrNearZero(v: unknown): boolean {
  return typeof v !== 'number' || Number.isNaN(v) || Math.abs(v) < EPSILON;
}

export interface SplitPositionsByTypeResult {
  stockPositions: Position[];
  bondsPositions: Position[];
  fundsPositions: Position[];
  futuresPositions: Position[];
  currencyPositions: Position[];
  // Positions that don't match known types (stock/bond/fund/futures/currency)
  unallocatedPositions: Position[];
}

export function splitPositionsByType(dto: PositionsResponseDto): SplitPositionsByTypeResult {
  const stockPositions: Position[] = [];
  const bondsPositions: Position[] = [];
  const fundsPositions: Position[] = [];
  const futuresPositions: Position[] = [];
  const currencyPositions: Position[] = [];
  const unallocatedPositions: Position[] = [];

  const positions = Array.isArray(dto?.positions) ? dto.positions : [];
  if (!Array.isArray(dto?.positions)) {
    // eslint-disable-next-line no-console
    console.warn('[mappers:splitPositionsByType] dto.positions is not an array, using empty list', dto);
  }

  for (const p of positions) {
    let category: PositionCategory;
    switch (p.type) {
      case 'stocks':
      case 'funds':
      case 'bonds':
      case 'futures':
      case 'currency':
      case 'unallocated':
        category = p.type;
        break;
      default:
        category = 'unallocated';
        break;
    }

    // Filter out "dead" currency rows (e.g. RUB with 0 quantity/value/prices)
    if (
      category === 'currency' &&
      isZeroOrNearZero(p.quantity) &&
      isZeroOrNearZero(p.totalValue) &&
      isZeroOrNearZero(p.purchasePrice) &&
      isZeroOrNearZero(p.currentPrice)
    ) {
      continue;
    }

    const quantity = typeof p.quantity === 'number' ? p.quantity : 0;
    const backendTotalValue = typeof p.totalValue === 'number' ? p.totalValue : 0;

    let normalizedTotalValue = backendTotalValue;

    if (category === 'currency' && !isZeroOrNearZero(quantity)) {
      const qtySign = quantity >= 0 ? 1 : -1;

      if (!isZeroOrNearZero(backendTotalValue)) {
        // Ensure sign(totalValue) == sign(quantity)
        if (Math.sign(backendTotalValue) !== qtySign) {
          normalizedTotalValue = qtySign * Math.abs(backendTotalValue);
        }
      } else {
        // Derive total value if backend didn't provide a sensible one
        const currentPrice = typeof p.currentPrice === 'number' ? p.currentPrice : 0;
        let effectivePrice = currentPrice;

        // For same-currency cash-like positions with 0 price, treat price as 1
        if (isZeroOrNearZero(effectivePrice)) {
          effectivePrice = 1;
        }

        normalizedTotalValue = quantity * effectivePrice;
      }
    }

    const base: Position = {
      id: p.id ?? '',
      name: p.name ?? '',
      ticker: p.ticker ?? '',
      icon: pickIconFromTicker(p.ticker ?? ''),
      iconBg: DEFAULT_POSITION_ICON_BG,
      purchasePrice: typeof p.purchasePrice === 'number' ? p.purchasePrice : 0,
      currentPrice: typeof p.currentPrice === 'number' ? p.currentPrice : 0,
      amount: quantity,
      totalValue: normalizedTotalValue,
      change: typeof p.change === 'number' ? p.change : 0,
      changePercent: typeof p.changePercent === 'number' ? p.changePercent : 0,
      category,
      type: p.type ?? 'unallocated',
    };

    switch (category) {
      case 'currency':
        currencyPositions.push(base);
        break;
      case 'bonds':
        bondsPositions.push(base);
        break;
      case 'funds':
        fundsPositions.push(base);
        break;
      case 'futures':
        futuresPositions.push(base);
        break;
      case 'stocks':
        stockPositions.push(base);
        break;
      case 'unallocated':
      default:
        unallocatedPositions.push(base);
        break;
    }
  }

  return {
    stockPositions,
    bondsPositions,
    fundsPositions,
    futuresPositions,
    currencyPositions,
    unallocatedPositions,
  };
}

export function mapAllocationDto(dto: AllocationResponseDto): AnalyticsSlice[] {
  const palette = ['#5B9FD5', '#B565D8', '#9FD55B', '#FBBF24', '#6EE7B7', '#F97373'];

  if (!dto || !Array.isArray(dto.breakdown)) {
    // eslint-disable-next-line no-console
    console.warn('[mappers:mapAllocationDto] dto.breakdown is not an array, returning empty analytics', dto);
    return [];
  }

  return dto.breakdown.map((slice, index) => ({
    name: slice.name ?? '',
    value: typeof slice.value === 'number' ? slice.value : 0,
    color: palette[index % palette.length],
  }));
}

export function mapEventDto(dto: PortfolioEventDto): PortfolioEvent {
  const date = new Date(dto.timestamp);
  const dateStr = date.toLocaleDateString('ru-RU');
  const timeStr = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let amountStr: string | undefined;
  if (typeof dto.amount === 'number' && dto.currency) {
    const sign = dto.amount >= 0 ? '+' : '';
    const value = Math.abs(dto.amount).toLocaleString('ru-RU');
    const currencySymbol = dto.currency === 'RUB' ? '₽' : dto.currency;
    amountStr = `${sign}${value} ${currencySymbol}`;
  }

  let icon = '📄';
  let iconBg = 'bg-gray-100';
  switch (dto.type) {
    case 'tax':
      icon = '🏛️';
      iconBg = 'bg-blue-100';
      break;
    case 'dividend':
      icon = '💰';
      iconBg = 'bg-green-100';
      break;
    case 'coupon':
      icon = '💵';
      iconBg = 'bg-green-100';
      break;
    case 'redemption':
      icon = '📄';
      iconBg = 'bg-yellow-100';
      break;
    case 'trade':
      icon = '📈';
      iconBg = 'bg-purple-100';
      break;
    case 'cash':
      icon = '💳';
      iconBg = 'bg-blue-100';
      break;
    case 'other':
    default:
      icon = '📄';
      iconBg = 'bg-gray-100';
      break;
  }

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    date: dateStr,
    time: timeStr,
    amount: amountStr,
    icon,
    iconBg,
  };
}

export function mapInstrumentQuoteDto(dto: InstrumentQuoteDto): InstrumentQuote {
  return {
    ticker: dto.ticker ?? '',
    instrumentId: dto.instrumentId ?? '',
    currency: dto.currency ?? '',
    currentPrice: typeof dto.currentPrice === 'number' ? dto.currentPrice : 0,
    change: typeof dto.change === 'number' ? dto.change : 0,
    changePercent: typeof dto.changePercent === 'number' ? dto.changePercent : 0,
  };
}

export function mapInstrumentPricesDto(
  dto: InstrumentPricesResponseDto,
): InstrumentPricePoint[] {
  if (!dto || !Array.isArray(dto.points)) {
    // eslint-disable-next-line no-console
    console.warn('[mappers:mapInstrumentPricesDto] dto.points is not an array, returning empty price series', dto);
    return [];
  }

  return dto.points.map((p) => ({
    date: new Date(p.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: typeof p.price === 'number' ? p.price : 0,
  }));
}

export function mapInstrumentSearchResultDto(
  dto: InstrumentSearchResultDto,
): InstrumentSearchResult {
  return {
    id: dto.id ?? '',
    ticker: dto.ticker ?? '',
    name: dto.name ?? '',
    type: dto.type,
    currency: dto.currency ?? '',
  };
}
