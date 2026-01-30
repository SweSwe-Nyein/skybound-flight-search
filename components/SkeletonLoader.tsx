
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 space-y-4 shadow-sm">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl shimmer"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 rounded shimmer"></div>
                <div className="w-20 h-3 rounded shimmer"></div>
              </div>
            </div>
            <div className="w-24 h-8 rounded-lg shimmer"></div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="w-1/4 h-6 rounded shimmer"></div>
            <div className="w-1/3 h-2 rounded shimmer"></div>
            <div className="w-1/4 h-6 rounded shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
