
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PriceChartProps {
  data: any[];
  onBucketClick: (min: number, max: number) => void;
  activeRange?: { min: number, max: number };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{label} JOURNEY</p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-6">
            <span className="text-[10px] font-bold text-slate-400">AVG RATE</span>
            <span className="text-xs font-black text-white">${data.avg}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-[10px] font-bold text-slate-400">DEALS</span>
            <span className="text-xs font-black text-white">{data.count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, onBucketClick, activeRange }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Duration Price Matrix</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Market averages vs travel time</p>
        </div>
        {activeRange && (
          <div className="flex items-center gap-2 text-[8px] font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest animate-pulse">
            Active Filter
          </div>
        )}
      </div>
      <div className="h-40 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(e) => {
              if (e && e.activePayload) {
                const payload = e.activePayload[0].payload;
                onBucketClick(payload.minMinutes, payload.maxMinutes);
              }
            }}
          >
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} 
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="avg" 
              stroke="#6366f1" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorAvg)" 
              activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
