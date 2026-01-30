
import React from 'react';
import { FilterState } from '../types';
import { AIRLINE_NAMES } from '../constants';

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableAirlines: string[];
  maxPossiblePrice: number;
  onClear: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, setFilters, availableAirlines, maxPossiblePrice, onClear }) => {
  const toggleStop = (stop: number) => {
    const newStops = filters.stops.includes(stop) ? filters.stops.filter(s => s !== stop) : [...filters.stops, stop];
    setFilters({ ...filters, stops: newStops });
  };

  const toggleAirline = (code: string) => {
    const newAirlines = filters.airlines.includes(code) ? filters.airlines.filter(a => a !== code) : [...filters.airlines, code];
    setFilters({ ...filters, airlines: newAirlines });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
        <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Filters</h3>
        <button onClick={onClear} className="text-[9px] font-bold text-accent hover:underline uppercase tracking-tight">Clear All</button>
      </div>

      <div className="space-y-4">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Complexity</h4>
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2].map(stop => (
            <button 
              key={stop}
              onClick={() => toggleStop(stop)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${filters.stops.includes(stop) ? 'bg-accent border-accent text-white shadow-sm shadow-accent/20' : 'bg-slate-100 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
            >
              {stop === 0 ? 'Direct' : stop === 1 ? '1 Stop' : '2+ Stops'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget</h4>
          <span className="text-[10px] font-black text-accent">${filters.maxPrice}</span>
        </div>
        <input 
          type="range" min="100" max={maxPossiblePrice} step="10" value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Carriers</h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          {availableAirlines.map(code => (
            <button 
              key={code}
              onClick={() => toggleAirline(code)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all group ${filters.airlines.includes(code) ? 'bg-accent/5 dark:bg-accent/10 text-accent' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${filters.airlines.includes(code) ? 'bg-accent border-accent' : 'border-slate-300 dark:border-slate-700'}`}>
                {filters.airlines.includes(code) && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-[10px] font-bold truncate">{AIRLINE_NAMES[code] || code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarFilters;
