
import React from 'react';
import { NormalizedFlight, FlightLeg } from '../types';

interface FlightCardProps {
  flight: NormalizedFlight;
  isCheapest: boolean;
  isFastest: boolean;
  isBestValue: boolean;
  isCompared: boolean;
  onToggleCompare: () => void;
  disableCompare: boolean;
}

const LegCompact: React.FC<{ leg: FlightLeg, isReturn?: boolean }> = ({ leg, isReturn }) => {
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-4 py-3 group/leg">
      <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-100 dark:border-white/5">
        <img 
          src={`https://www.gstatic.com/flights/airline_logos/70px/${leg.airlineCode}.png`} 
          alt={leg.airlineCode} 
          className="max-h-full object-contain transition-all"
        />
      </div>
      
      <div className="flex-1 flex items-center justify-between gap-3">
        <div className="text-left w-14">
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{formatTime(leg.departureTime)}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{leg.origin}</p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1.5 w-full">
            <div className="h-[1.5px] flex-1 bg-slate-200 dark:bg-slate-700 relative rounded-full">
               {leg.stops > 0 && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-500"></div>
               )}
            </div>
            <svg className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5L10,18L8,19.5L8,21L11.5,20L15,21L15,19.5L13,18L13,13.5L21,16Z" /></svg>
          </div>
          <span className="text-[9px] font-bold text-slate-400 mt-1">{leg.stops === 0 ? 'Direct' : `${leg.stops} stop`}</span>
        </div>

        <div className="text-right w-14">
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{formatTime(leg.arrivalTime)}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{leg.destination}</p>
        </div>
      </div>
      
      <div className="hidden sm:block w-20 text-right">
        <p className="text-[10px] font-bold text-slate-500">{leg.duration}</p>
        <p className="text-[9px] text-slate-400">{formatDate(leg.departureTime)}</p>
      </div>
    </div>
  );
};

const FlightCard: React.FC<FlightCardProps> = ({ flight, isCheapest, isFastest, isBestValue, isCompared, onToggleCompare, disableCompare }) => {
  return (
    <div className={`relative flex flex-col lg:flex-row glass-panel rounded-xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${isCompared ? 'border-accent ring-1 ring-accent/20' : 'border-transparent hover:border-slate-100 dark:hover:border-slate-800'}`}>
      
      <div className="flex-1 px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="mt-2 flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={isCompared} 
              onChange={onToggleCompare} 
              disabled={!isCompared && disableCompare}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-accent focus:ring-accent cursor-pointer"
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Compare</span>
          </div>
          <div className="flex gap-1">
            {isBestValue && <div className="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-fuchsia-500/10">Best</div>}
            {isFastest && <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-emerald-500/10">Fast</div>}
            {isCheapest && <div className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-accent/10">Cheap</div>}
          </div>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-white/5">
          <LegCompact leg={flight.outbound} />
          {flight.returnLeg && <LegCompact leg={flight.returnLeg} isReturn />}
        </div>
      </div>

      <div className="lg:w-40 bg-slate-50/50 dark:bg-slate-900/40 p-4 flex lg:flex-col items-center justify-between lg:justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5">
        <div className="text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Total Fare</p>
          <div className="flex items-baseline gap-1 justify-center">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">${flight.price}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">{flight.currency}</span>
          </div>
        </div>
        <button className="w-full lg:w-auto lg:px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-black uppercase tracking-wider transition-all hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white active:scale-95 shadow-sm">
          Select
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
