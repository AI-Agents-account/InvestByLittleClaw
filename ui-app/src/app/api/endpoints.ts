import { fetchJson } from './http';
import type {
  AccountsResponseDto,
  PortfolioHistoryResponseDto,
  PositionsResponseDto,
  PortfolioResponseDto,
  AllocationResponseDto,
  EventsResponseDto,
  InstrumentSearchResponseDto,
  InstrumentQuoteDto,
  InstrumentPricesResponseDto,
} from './types';

export async function getAccounts() {
  // The backend may return either an array of accounts or an object with
  // `{ accounts: AccountDto[]; total?: ... }`. Normalize to
  // `AccountsResponseDto` so the rest of the UI can rely on a stable shape.
  return fetchJson<unknown>('/api/accounts')
    .then((raw) => {
      let accounts: AccountsResponseDto['accounts'] = [];
      let total: AccountsResponseDto['total'] | undefined;

      try {
        if (Array.isArray(raw)) {
          // Newer backend shape: plain array of accounts
          accounts = raw as AccountsResponseDto['accounts'];
        } else if (raw && typeof raw === 'object') {
          const obj = raw as Partial<AccountsResponseDto> & Record<string, unknown>;
          if (Array.isArray(obj.accounts)) {
            accounts = obj.accounts as AccountsResponseDto['accounts'];
            if (obj.total && typeof obj.total === 'object') {
              total = obj.total as AccountsResponseDto['total'];
            }
          } else {
            // Unexpected object shape
            // eslint-disable-next-line no-console
            console.warn('[api:getAccounts] Unexpected object shape, falling back to empty list', obj);
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn('[api:getAccounts] Unexpected response type', typeof raw, raw);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api:getAccounts] Failed to normalize response', err, raw);
        accounts = [];
        total = undefined;
      }

      return { accounts, total } satisfies AccountsResponseDto;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[api:getAccounts] Request failed', err);
      return { accounts: [], total: undefined } as AccountsResponseDto;
    });
}

export interface GetPortfolioHistoryParams {
  from?: string;
  to?: string;
  /**
   * Logical interval requested by the UI. The backend currently expects
   * values like `1min`, `5min`, `15min`, `1hour`, `1day`.
   *
   * For historical reasons some callers still use aliases like `1D` or
   * `1h` — these are normalised before the request is sent so that the
   * backend never receives unsupported values such as `1D`.
   */
  interval?: string; // e.g. '1day'
}

function normaliseInterval(interval?: string): string | undefined {
  if (!interval) return interval;

  switch (interval) {
    case '1D':
    case '1d':
      return '1day';
    case '1H':
    case '1h':
      return '1hour';
    default:
      return interval;
  }
}

export async function getPortfolioHistory(
  accountId: string,
  params: GetPortfolioHistoryParams = {},
) {
  const search = new URLSearchParams({
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.interval ? { interval: normaliseInterval(params.interval) ?? '' } : {}),
  });

  const query = search.toString();
  const path = `/api/accounts/${encodeURIComponent(accountId)}/portfolio/history${
    query ? `?${query}` : ''
  }`;

  return fetchJson<PortfolioHistoryResponseDto>(path);
}

export interface GetPositionsParams {
  q?: string;
  groupBy?: string; // e.g. 'assetClass'
}

export async function getPositions(accountId: string, params: GetPositionsParams = {}) {
  // The original UI called `/api/accounts/{id}/positions`. The current backend
  // exposes consolidated portfolio data via `/api/portfolio?account_id={id}`.
  // Here we call the new endpoint and adapt its shape back to
  // `PositionsResponseDto` for the rest of the app.
  const search = new URLSearchParams({ account_id: accountId });
  const path = `/api/portfolio?${search.toString()}`;

  return fetchJson<PortfolioResponseDto | PositionsResponseDto | unknown>(path)
    .then((raw) => {
      try {
        // If backend already returns the expected PositionsResponseDto shape,
        // just pass it through.
        if (
          raw &&
          typeof raw === 'object' &&
          'positions' in (raw as any) &&
          Array.isArray((raw as any).positions)
        ) {
          const obj = raw as PositionsResponseDto & Partial<PortfolioResponseDto>;
          return {
            accountId: obj.accountId ?? accountId,
            currency: obj.currency ?? 'RUB',
            positions: obj.positions ?? [],
          } satisfies PositionsResponseDto;
        }

        // Otherwise, treat it as PortfolioResponseDto and normalize.
        const portfolio = raw as PortfolioResponseDto;
        const positionsArray = Array.isArray(portfolio.positions)
          ? portfolio.positions
          : [];

        if (!Array.isArray(portfolio.positions)) {
          // eslint-disable-next-line no-console
          console.warn('[api:getPositions] portfolio.positions is not an array, using empty list', raw);
        }

        return {
          accountId: portfolio.accountId ?? accountId,
          currency: portfolio.currency ?? 'RUB',
          positions: positionsArray,
        } satisfies PositionsResponseDto;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api:getPositions] Failed to normalize response', err, raw);
        return {
          accountId,
          currency: 'RUB',
          positions: [],
        } satisfies PositionsResponseDto;
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[api:getPositions] Request failed', err);
      return {
        accountId,
        currency: 'RUB',
        positions: [],
      } as PositionsResponseDto;
    });
}

export async function getPortfolio(accountId: string) {
  const path = `/api/portfolio?account_id=${encodeURIComponent(accountId)}`;
  return fetchJson<PortfolioResponseDto>(path);
}

export type AllocationDimension = 'assetClass' | 'company' | 'sector' | 'currency';

export async function getAllocation(accountId: string, dimension: AllocationDimension = 'assetClass') {
  const search = new URLSearchParams({ dimension });
  const path = `/api/accounts/${encodeURIComponent(accountId)}/allocation?${search.toString()}`;
  return fetchJson<AllocationResponseDto>(path);
}

export interface GetEventsParams {
  from?: string;
  to?: string;
  limit?: number;
  type?: string;
}

export async function getEvents(accountId: string, params: GetEventsParams = {}) {
  const search = new URLSearchParams({
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.limit ? { limit: String(params.limit) } : {}),
    ...(params.type ? { type: params.type } : {}),
  });

  const query = search.toString();
  const path = `/api/accounts/${encodeURIComponent(accountId)}/events${
    query ? `?${query}` : ''
  }`;

  return fetchJson<EventsResponseDto>(path);
}

export async function searchInstruments(q: string) {
  const search = new URLSearchParams({ q });
  const path = `/api/instruments/search?${search.toString()}`;

  return fetchJson<unknown>(path)
    .then((raw) => {
      try {
        const normalize = (item: any): InstrumentSearchResponseDto['results'][number] | null => {
          if (!item || typeof item !== 'object') return null;

          const id = (item as any).UID ?? (item as any).uid ?? (item as any).id;
          const ticker = (item as any).Ticker ?? (item as any).ticker;
          const name = (item as any).Name ?? (item as any).name;
          const type = (item as any).Type ?? (item as any).type;
          const currency = (item as any).Currency ?? (item as any).currency;

          if (!ticker && !id && !name) {
            return null;
          }

          return {
            id: String(id ?? ''),
            ticker: String(ticker ?? ''),
            name: String(name ?? ''),
            // Fallback to 'stock' if type is missing or unknown
            type: (typeof type === 'string' && ['stock', 'bond', 'fund', 'currency'].includes(type))
              ? (type as any)
              : 'stock',
            currency: String(currency ?? ''),
          };
        };

        let results: InstrumentSearchResponseDto['results'] = [];

        if (Array.isArray((raw as any)?.results)) {
          // Shape: { results: [...] }
          results = ((raw as any).results as any[])
            .map(normalize)
            .filter((x): x is InstrumentSearchResponseDto['results'][number] => Boolean(x));
        } else if (Array.isArray(raw)) {
          // Shape: [{ ... }]
          results = (raw as any[])
            .map(normalize)
            .filter((x): x is InstrumentSearchResponseDto['results'][number] => Boolean(x));
        } else if (raw && typeof raw === 'object') {
          // Shape: single object with UID/FIGI/Ticker/Name/Type/Currency
          const single = normalize(raw as any);
          results = single ? [single] : [];
        } else {
          // eslint-disable-next-line no-console
          console.warn('[api:searchInstruments] Unexpected response type', typeof raw, raw);
        }

        return { results } satisfies InstrumentSearchResponseDto;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api:searchInstruments] Failed to normalize response', err, raw);
        return { results: [] } as InstrumentSearchResponseDto;
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[api:searchInstruments] Request failed', err);
      return { results: [] } as InstrumentSearchResponseDto;
    });
}

export interface GetInstrumentQuoteParams {
  by?: 'ticker' | 'uid';
}

export async function getInstrumentQuote(
  id: string,
  params: GetInstrumentQuoteParams = {},
) {
  const search = new URLSearchParams({
    ...(params.by ? { by: params.by } : {}),
  });
  const query = search.toString();
  const path = `/api/markets/instruments/${encodeURIComponent(id)}/quote${
    query ? `?${query}` : ''
  }`;

  return fetchJson<InstrumentQuoteDto>(path);
}

export interface GetInstrumentPricesParams {
  from?: string;
  to?: string;
  /**
   * Logical interval requested by the UI. The backend currently expects
   * values like `1min`, `5min`, `15min`, `1hour`, `1day`.
   *
   * Aliases such as `1D` or `1h` are normalised to backend-supported
   * values before the request is sent.
   */
  interval?: string; // e.g. '1day', '1hour'
}

export async function getInstrumentPrices(
  id: string,
  params: GetInstrumentPricesParams = {},
) {
  const search = new URLSearchParams({
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.interval ? { interval: normaliseInterval(params.interval) ?? '' } : {}),
  });
  const query = search.toString();
  const path = `/api/markets/instruments/${encodeURIComponent(id)}/prices${
    query ? `?${query}` : ''
  }`;

  return fetchJson<InstrumentPricesResponseDto>(path);
}
