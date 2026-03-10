import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { PortfolioChart } from './components/PortfolioChart';
import { PriceChart } from './components/PriceChart';
import { Analytics } from './components/Analytics';
import { NewsList } from './components/NewsList';
import type {
  Account,
  PortfolioHistoryPoint,
  Position,
  AnalyticsSlice,
  PortfolioEvent,
  InstrumentPricePoint,
  InstrumentQuote,
} from './models';
import {
  getAccounts,
  getPortfolioHistory,
  getPositions,
  getAllocation,
  getEvents,
  getInstrumentQuote,
  getInstrumentPrices,
  searchInstruments,
} from './api/endpoints';
import {
  mapAccountDto,
  mapPortfolioHistoryDto,
  splitPositionsByType,
  mapAllocationDto,
  mapEventDto,
  mapInstrumentPricesDto,
  mapInstrumentQuoteDto,
} from './mappers';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioHistoryPoint[]>([]);
  const [stockPositions, setStockPositions] = useState<Position[]>([]);
  const [bondsPositions, setBondsPositions] = useState<Position[]>([]);
  const [fundsPositions, setFundsPositions] = useState<Position[]>([]);
  const [futuresPositions, setFuturesPositions] = useState<Position[]>([]);
  const [currencyPositions, setCurrencyPositions] = useState<Position[]>([]);
  const [unallocatedPositions, setUnallocatedPositions] = useState<Position[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSlice[]>([]);
  const [totalAnalyticsValue, setTotalAnalyticsValue] = useState<number>(0);
  const [newsItems, setNewsItems] = useState<PortfolioEvent[]>([]);

  const [priceData, setPriceData] = useState<InstrumentPricePoint[]>([]);
  const [instrumentQuote, setInstrumentQuote] = useState<InstrumentQuote | null>(null);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [priceInterval, setPriceInterval] = useState<string>('1day');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load accounts on initial mount
  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getAccounts();
        const backendAccounts = Array.isArray(data?.accounts) ? data.accounts : [];
        if (!Array.isArray(data?.accounts)) {
          // eslint-disable-next-line no-console
          console.warn('[App] getAccounts() returned unexpected shape, using empty list', data);
        }

        const mapped = backendAccounts.map(mapAccountDto);
        setAccounts(mapped);
        if (!selectedAccount && mapped.length > 0) {
          setSelectedAccount(mapped[0].id);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load accounts', error);
      }
    }

    loadAccounts();
  }, [selectedAccount]);

  // Load account-specific data whenever selected account or search query changes
  useEffect(() => {
    if (!selectedAccount) return;

    async function loadAccountData() {
      setIsLoading(true);
      try {
        const [historyDto, positionsDto, allocationDto, eventsDto] = await Promise.all([
          getPortfolioHistory(selectedAccount, { interval: '1day' }),
          getPositions(selectedAccount, { q: searchQuery || undefined, groupBy: 'assetClass' }),
          getAllocation(selectedAccount, 'assetClass'),
          getEvents(selectedAccount, { limit: 10 }),
        ]);

        setPortfolioData(mapPortfolioHistoryDto(historyDto));

        const {
          stockPositions,
          bondsPositions,
          fundsPositions,
          futuresPositions,
          currencyPositions,
          unallocatedPositions,
        } = splitPositionsByType(positionsDto);
        setStockPositions(stockPositions);
        setBondsPositions(bondsPositions);
        setFundsPositions(fundsPositions);
        setFuturesPositions(futuresPositions);
        setCurrencyPositions(currencyPositions);
        setUnallocatedPositions(unallocatedPositions);

        setAnalyticsData(mapAllocationDto(allocationDto));
        setTotalAnalyticsValue(
          allocationDto && typeof allocationDto.totalValue === 'number'
            ? allocationDto.totalValue
            : 0,
        );

        setNewsItems(eventsDto.events.map(mapEventDto));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load account data', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccountData();
  }, [selectedAccount, searchQuery]);

  // Ensure we always have a sensible default instrument selection for the
  // currently selected account based on the loaded positions.
  useEffect(() => {
    const allPositions: Position[] = [
      ...stockPositions,
      ...bondsPositions,
      ...fundsPositions,
      ...futuresPositions,
      ...currencyPositions,
      ...unallocatedPositions,
    ];

    if (allPositions.length === 0) {
      setSelectedInstrumentId(null);
      return;
    }

    if (!selectedInstrumentId || !allPositions.some((p) => p.id === selectedInstrumentId)) {
      setSelectedInstrumentId(allPositions[0].id);
    }
  }, [
    stockPositions,
    bondsPositions,
    fundsPositions,
    futuresPositions,
    currencyPositions,
    unallocatedPositions,
    selectedAccount,
    selectedInstrumentId,
  ]);

  // Load price chart and quote for the currently selected instrument.
  useEffect(() => {
    if (!selectedInstrumentId) {
      setInstrumentQuote(null);
      setPriceData([]);
      return;
    }

    async function loadMarketData() {
      try {
        const [quoteDto, pricesDto] = await Promise.all([
          getInstrumentQuote(selectedInstrumentId),
          getInstrumentPrices(selectedInstrumentId, { interval: priceInterval }),
        ]);

        if (quoteDto) {
          setInstrumentQuote(mapInstrumentQuoteDto(quoteDto));
        } else {
          // eslint-disable-next-line no-console
          console.warn('[App] Empty quote DTO received', quoteDto);
        }

        if (pricesDto) {
          setPriceData(mapInstrumentPricesDto(pricesDto));
        } else {
          // eslint-disable-next-line no-console
          console.warn('[App] Empty prices DTO received', pricesDto);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load market data', error);
      }
    }

    loadMarketData();
  }, [selectedInstrumentId, priceInterval]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        accounts={accounts}
        selectedAccount={selectedAccount ?? ''}
        onSelectAccount={setSelectedAccount}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <PortfolioChart
            data={portfolioData}
            stockPositions={stockPositions}
            bondsPositions={bondsPositions}
            fundsPositions={fundsPositions}
            futuresPositions={futuresPositions}
            currencyPositions={currencyPositions}
            unallocatedPositions={unallocatedPositions}
            onSelectPosition={(position) => setSelectedInstrumentId(position.id)}
          />

          <PriceChart
            data={priceData}
            ticker={instrumentQuote?.ticker ?? '—'}
            currentPrice={instrumentQuote?.currentPrice ?? 0}
            change={instrumentQuote?.change ?? 0}
            changePercent={instrumentQuote?.changePercent ?? 0}
            selectedInterval={priceInterval}
            onIntervalChange={setPriceInterval}
          />

          <div className="grid grid-cols-2 gap-6 mt-6">
            <Analytics
              data={analyticsData}
              totalValue={totalAnalyticsValue}
            />
            <NewsList items={newsItems} />
          </div>

          {isLoading && (
            <div className="mt-4 text-sm text-gray-500">Загрузка данных...</div>
          )}
        </div>
      </div>
    </div>
  );
}
