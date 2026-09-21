import React from 'react';
import { CheckCircle2, Zap, Languages } from 'lucide-react';

export const TrustIndicators: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 pt-3 text-xs text-slate-600 font-medium">
      <div className="flex items-center space-x-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>No signup required</span>
      </div>
      <div className="flex items-center space-x-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
        <Zap className="w-4 h-4 text-amber-500" />
        <span>Fast analysis</span>
      </div>
      <div className="flex items-center space-x-1.5 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
        <Languages className="w-4 h-4 text-blue-600" />
        <span>Supports 12+ Indian languages</span>
      </div>
    </div>
  );
};
