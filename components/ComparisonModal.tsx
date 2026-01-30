import React from 'react';
import { NormalizedFlight } from '../types';

interface ComparisonModalProps {
  flights: NormalizedFlight[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ flights, onClose }) => {
  if (flights.length < 2) return null;

  const renderLegInfo = (flight: NormalizedFlight, type: 'outbound' | 'returnLeg') => {
    const leg = flight[type];
    if (!leg) return <div className="text-slate-400 italic py-4">No return flight</div>;

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="space-y-3 py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
        <div className="flex items-center gap-2">
          <img 
            src={`https://www.gstatic.com/flights/airline_logos/70px/${leg.airlineCode}.png`} 
            alt={leg.airlineCode}
            className="w-6 h-6 object-contain"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{leg.airlineName}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{formatTime(leg.departureTime)}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{leg.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-4">
            <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">{leg.duration}</p>
            <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-700 relative">
               <div className="absolute top-[-2px] left-0 w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
               <div className="absolute top-[-2px] right-0 w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">
              {leg.stops === 0 ? 'Direct' : `${leg.stops} stops`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 dark:text-white">{formatTime(leg.arrivalTime)}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{leg.destination}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-white/10 max-h-[90vh]">
        <div className="px-8 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Flight Comparison</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Comparing side-by-side to find your best match</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-white/10 shadow-sm">
            <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 96px)' }}>
          {flights.map((flight, idx) => (
            <div key={flight.id} className={`flex-1 min-w-[320px] p-8 ${idx === 0 ? 'border-r border-slate-100 dark:border-white/5' : ''}`}>
              <div className="mb-8">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block border border-indigo-100 dark:border-indigo-500/20">Option {idx + 1}</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">${flight.price}</p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Total Package Price</p>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Outbound Journey</h4>
                  {renderLegInfo(flight, 'outbound')}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Return Journey</h4>
                  {renderLegInfo(flight, 'returnLeg')}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Duration</p>
                       <p className="text-sm font-black text-slate-800 dark:text-white">{flight.outbound.duration}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Stops</p>
                       <p className="text-sm font-black text-slate-800 dark:text-white">{flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stops`}</p>
                    </div>
                 </div>
                 <button className="mb-7 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 mt-4">
                   Book this route
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
