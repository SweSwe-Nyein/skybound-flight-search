
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import SearchForm from './components/SearchForm';
import FlightCard from './components/FlightCard';
import SidebarFilters from './components/SidebarFilters';
import PriceChart from './components/PriceChart';
import SkeletonLoader from './components/SkeletonLoader';
import ComparisonModal from './components/ComparisonModal';
import { 
  NormalizedFlight, 
  SearchCriteria, 
  FilterState, 
  SortOption 
} from './types';
import { fetchFlightOffers } from './services/amadeusService';
import { normalizeFlightOffers, filterFlights, sortFlights, getChartData } from './utils/flightUtils';
import { INITIAL_FILTERS } from './constants';

const ITEMS_PER_PAGE = 8;
const FETCH_LIMIT = 100; 

const App: React.FC = () => {
  const [flights, setFlights] = useState<NormalizedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.PRICE_ASC);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [comparedFlightIds, setComparedFlightIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skybound_theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('skybound_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('skybound_theme', 'light');
    }
  }, [isDark]);

  const performSearch = useCallback(async (searchCriteria: SearchCriteria, currentFilters: FilterState) => {
    setIsLoading(true);
    setError(null);
    setComparedFlightIds([]);
    try {
      const results = await fetchFlightOffers(searchCriteria, currentFilters, FETCH_LIMIT);
      if (results.length === 0) {
        setError('Zero results found. Try routes like JFK-LHR or CDG-JFK.');
        setFlights([]);
      } else {
        setFlights(normalizeFlightOffers(results));
      }
    } catch (err: any) {
      setError(err.message || 'The search engine encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (newCriteria: SearchCriteria) => {
    setCriteria(newCriteria);
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    performSearch(newCriteria, INITIAL_FILTERS);
  };

  useEffect(() => {
    if (!criteria) return;
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); 
      performSearch(criteria, filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters.stops, filters.airlines, criteria, performSearch]);

  const processedFlights = useMemo(() => {
    const filtered = filterFlights(flights, filters);
    return sortFlights(filtered, sortBy);
  }, [flights, filters, sortBy]);

  const totalPages = useMemo(() => Math.ceil(processedFlights.length / ITEMS_PER_PAGE), [processedFlights]);

  const displayFlights = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedFlights.slice(start, start + ITEMS_PER_PAGE);
  }, [processedFlights, currentPage]);

  const chartData = useMemo(() => {
    const contextFlights = filterFlights(flights, { ...filters, durationRange: undefined });
    return getChartData(contextFlights);
  }, [flights, filters]);

  const guidance = useMemo(() => {
    if (processedFlights.length === 0) return { cheapestId: null, fastestId: null, bestValueId: null };
    let cheapest = processedFlights[0];
    let fastest = processedFlights[0];
    let bestValue = processedFlights[0];

    processedFlights.forEach(f => {
      if (f.price < cheapest.price) cheapest = f;
      if (f.outbound.durationMinutes < fastest.outbound.durationMinutes) fastest = f;
      const currentScore = f.price * (f.outbound.durationMinutes / 60);
      const bestScore = bestValue.price * (bestValue.outbound.durationMinutes / 60);
      if (currentScore < bestScore) bestValue = f;
    });

    return { cheapestId: cheapest.id, fastestId: fastest.id, bestValueId: bestValue.id };
  }, [processedFlights]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-f8fafc pb-12">
      {/* Header Bar */}
      <nav className="glass-panel sticky top-0 z-50 py-3 px-4 md:px-8 border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter text-slate-900 dark:text-white uppercase">SkyBound</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-accent animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{isLoading ? 'Syncing...' : 'Real-time'}</span>
            </div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {error && (
          <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl flex items-center gap-3 text-rose-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {(flights.length > 0 || isLoading) && (
          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 lg:col-span-3 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="glass-panel rounded-xl p-6 shadow-sm">
                <SidebarFilters 
                  filters={filters}
                  setFilters={setFilters}
                  availableAirlines={Array.from(new Set(flights.flatMap(f => [f.outbound.airlineCode, f.returnLeg?.airlineCode].filter(Boolean) as string[]))).sort()}
                  maxPossiblePrice={flights.length > 0 ? Math.ceil(Math.max(...flights.map(f => f.price))) : 2000}
                  onClear={() => setFilters(INITIAL_FILTERS)}
                />
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9 space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-panel rounded-xl p-1 overflow-hidden shadow-sm">
                <PriceChart 
                  data={chartData} 
                  onBucketClick={(min, max) => setFilters(prev => ({...prev, durationRange: {min, max}}))}
                  activeRange={filters.durationRange}
                />
              </div>

              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">
                  {processedFlights.length} {processedFlights.length === 1 ? 'Option' : 'Options'} Found
                </h3>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sort</span>
                  <select 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    {Object.values(SortOption).map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {isLoading && displayFlights.length === 0 ? <SkeletonLoader /> : (
                  <>
                    <div className="space-y-3">
                      {displayFlights.map((flight, idx) => (
                        <div key={flight.id} className="animate-fade-in" style={{ animationDelay: `${0.03 * idx}s` }}>
                          <FlightCard 
                            flight={flight} 
                            isCheapest={flight.id === guidance.cheapestId}
                            isFastest={flight.id === guidance.fastestId}
                            isBestValue={flight.id === guidance.bestValueId}
                            isCompared={comparedFlightIds.includes(flight.id)}
                            onToggleCompare={() => setComparedFlightIds(prev => prev.includes(flight.id) ? prev.filter(i => i !== flight.id) : [...prev, flight.id])}
                            disableCompare={comparedFlightIds.length >= 2}
                          />
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-10 pb-4">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="flex items-center justify-center w-10 h-10 glass-panel rounded-xl disabled:opacity-20 transition-all hover:bg-accent hover:text-white group"
                          aria-label="Previous page"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        {pageNumbers[0] > 1 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className="w-10 h-10 rounded-xl text-xs font-bold transition-all glass-panel text-slate-500 hover:bg-accent hover:text-white"
                            >
                              1
                            </button>
                            {pageNumbers[0] > 2 && <span className="text-slate-400 px-1">...</span>}
                          </>
                        )}

                        {pageNumbers.map((num) => (
                          <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === num ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'glass-panel text-slate-500 hover:bg-accent hover:text-white'}`}
                          >
                            {num}
                          </button>
                        ))}

                        {pageNumbers[pageNumbers.length - 1] < totalPages && (
                          <>
                            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-slate-400 px-1">...</span>}
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="w-10 h-10 rounded-xl text-xs font-bold transition-all glass-panel text-slate-500 hover:bg-accent hover:text-white"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="flex items-center justify-center w-10 h-10 glass-panel rounded-xl disabled:opacity-20 transition-all hover:bg-accent hover:text-white group"
                          aria-label="Next page"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!flights.length && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
               <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Ready to explore?</h3>
             <p className="text-slate-500 dark:text-slate-400 text-xs text-center max-w-xs px-4">Search major routes globally with real-time analytics and optimized pricing.</p>
          </div>
        )}
      </main>

      {comparedFlightIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-fade-in">
          <div className="glass-panel bg-white/95 dark:bg-slate-900/95 rounded-xl p-3 flex items-center justify-between border border-accent/20 shadow-2xl">
            <div className="flex items-center gap-3 pl-2">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">{comparedFlightIds.length}/2 Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setComparedFlightIds([])} className="px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-rose-500 uppercase transition-colors">Reset</button>
              <button 
                disabled={comparedFlightIds.length < 2}
                onClick={() => setIsComparisonModalOpen(true)}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-30"
              >
                Launch Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {isComparisonModalOpen && <ComparisonModal flights={flights.filter(f => comparedFlightIds.includes(f.id))} onClose={() => setIsComparisonModalOpen(false)} />}
    </div>
  );
};

export default App;
