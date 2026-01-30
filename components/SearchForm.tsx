
import React, { useState, useEffect, useRef } from 'react';
import { SearchCriteria, LocationSuggestion } from '../types';
import { STORAGE_KEY } from '../constants';
import { searchLocations } from '../services/amadeusService';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading: boolean;
}

const LocationInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (iata: string, displayName: string) => void;
  required?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ label, placeholder, value, onChange, required, isFirst, isLast }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectedRef = useRef(false);

  useEffect(() => {
    if (value && !query) {
      setQuery(value);
      isSelectedRef.current = true;
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSelectedRef.current) {
      isSelectedRef.current = false;
      return;
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocations(query);
      setSuggestions(res);
      setIsSearching(false);
      setShowDropdown(res.length > 0);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: LocationSuggestion) => {
    const display = `${loc.address.cityName} (${loc.iataCode})`;
    isSelectedRef.current = true;
    setQuery(display);
    setSuggestions([]);
    setShowDropdown(false);
    onChange(loc.iataCode, display);
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative h-full">
        <input
          required={required}
          type="text"
          placeholder={placeholder}
          className={`w-full h-11 px-4 bg-white dark:bg-slate-900/40 border-none focus:ring-2 focus:ring-accent/40 outline-none transition-all font-semibold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 ${isFirst ? 'md:rounded-l-xl' : ''} ${isLast ? 'md:rounded-r-xl' : ''}`}
          value={query}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onChange={(e) => {
            isSelectedRef.current = false;
            setQuery(e.target.value);
          }}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-3 h-3 border-2 border-accent border-t-transparent rounded-full"></div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-[300] left-0 md:left-auto right-0 md:right-auto md:min-w-[320px] w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {suggestions.map((loc) => (
              <button
                key={`${loc.iataCode}-${loc.name}`}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors flex items-center justify-between group"
              >
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {loc.address.cityName}, {loc.address.countryName}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                    {loc.name}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] font-black text-slate-500 dark:text-slate-400">
                  {loc.iataCode}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    origin: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: 1,
    isRoundTrip: false
  });
  const [displayNames, setDisplayNames] = useState({ origin: '', destination: '' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCriteria(parsed);
        setDisplayNames({ origin: parsed.origin, destination: parsed.destination });
      } catch (e) {}
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
  };

  return (
    <div className="glass-panel rounded-2xl p-2 shadow-sm space-y-2 relative">
      <div className="flex flex-wrap items-center gap-2 px-2 pb-1 border-b border-slate-100 dark:border-white/5">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button 
            type="button"
            onClick={() => setCriteria({...criteria, isRoundTrip: false, returnDate: ''})}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${!criteria.isRoundTrip ? 'bg-white dark:bg-slate-700 text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            One-way
          </button>
          <button 
            type="button"
            onClick={() => setCriteria({...criteria, isRoundTrip: true})}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${criteria.isRoundTrip ? 'bg-white dark:bg-slate-700 text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
          >
            Round-trip
          </button>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block"></div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <select 
            className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-4"
            value={criteria.passengers} 
            onChange={(e) => setCriteria({...criteria, passengers: parseInt(e.target.value)})}
          >
            {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900">{n} Pax</option>)}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-2">
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-px bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 relative z-20">
          <LocationInput 
            label="Origin" 
            placeholder="From where?" 
            value={displayNames.origin} 
            isFirst
            onChange={(iata, d) => { 
              setCriteria({...criteria, origin: iata}); 
              setDisplayNames(p => ({...p, origin: d})); 
            }} 
            required 
          />
          
          <div className="flex items-center justify-center px-2 py-1 md:py-0 z-10">
            <svg className="w-4 h-4 text-slate-400 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>

          <LocationInput 
            label="Destination" 
            placeholder="To where?" 
            value={displayNames.destination} 
            onChange={(iata, d) => { 
              setCriteria({...criteria, destination: iata}); 
              setDisplayNames(p => ({...p, destination: d})); 
            }} 
            required 
          />

          <div className="flex-[0.7] flex items-center bg-white dark:bg-slate-900/40 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 relative">
            <div className="relative w-full h-full flex items-center px-4">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <input 
                required 
                type="date" 
                className="bg-transparent h-11 w-full outline-none font-bold text-xs text-slate-700 dark:text-white" 
                value={criteria.departureDate} 
                onChange={(e) => setCriteria({...criteria, departureDate: e.target.value})} 
              />
            </div>
          </div>

          {criteria.isRoundTrip && (
            <div className="flex-[0.7] flex items-center bg-white dark:bg-slate-900/40 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 relative md:rounded-r-xl">
              <div className="relative w-full h-full flex items-center px-4">
                <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <input 
                  required={criteria.isRoundTrip} 
                  type="date" 
                  min={criteria.departureDate} 
                  className="bg-transparent h-11 w-full outline-none font-bold text-xs text-slate-700 dark:text-white" 
                  value={criteria.returnDate} 
                  onChange={(e) => setCriteria({...criteria, returnDate: e.target.value})} 
                />
              </div>
            </div>
          )}
        </div>

        <button 
          disabled={isLoading} 
          type="submit" 
          className="h-11 px-8 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-accent/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap z-20"
        >
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span>Search Flights</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
