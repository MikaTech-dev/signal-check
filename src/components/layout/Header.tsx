'use client';

import React from 'react';
import { ShieldCheck, Radio, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  reportCount: number;
  unverifiedRumorCount: number;
  onOpenQuickReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  reportCount,
  unverifiedRumorCount,
  onOpenQuickReport,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                SafeRoute Signal
              </h1>
              <Badge variant="success" dot>
                Live Filter Active
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Real-time road verification for market vendors and transit safety
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-medium text-amber-300">6:40 PM</span>
            <span className="text-zinc-500 hidden md:inline">| Market Closing Window</span>
          </div>

          <button
            type="button"
            onClick={onOpenQuickReport}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px] transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Test New Field Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
