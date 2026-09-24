'use client';

import React from 'react';
import { RouteStatus } from '@/types';
import { getStatusTheme } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Shield, Eye, MessageSquare, Clock, ArrowRight } from 'lucide-react';

interface RouteCardProps {
  route: RouteStatus;
  onOpenDetails: (route: RouteStatus) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onOpenDetails }) => {
  const theme = getStatusTheme(route.status);

  return (
    <div
      className={`bg-zinc-900/90 border ${theme.cardBorder} rounded-xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-md relative overflow-hidden`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${theme.dot} shrink-0`} />
            <h3 className="text-base font-bold text-white tracking-tight">{route.name}</h3>
          </div>
          <Badge
            variant={
              route.status === 'SAFE'
                ? 'success'
                : route.status === 'CAUTION'
                ? 'warning'
                : 'danger'
            }
            dot
          >
            {route.status}
          </Badge>
        </div>

        <p className="text-xs text-zinc-300 line-clamp-2 mb-4">{route.description}</p>

        {/* Confidence & Evidence Meter */}
        <div className="bg-black/50 p-3 rounded-lg border border-zinc-800/80 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Signal Confidence:</span>
            <span className="font-mono font-semibold text-zinc-200">{route.confidenceScore}%</span>
          </div>

          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                route.confidenceScore >= 80
                  ? 'bg-emerald-500'
                  : route.confidenceScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${route.confidenceScore}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{route.firsthandCount} Firsthand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>{route.hearsayCount} Hearsay</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/60 mb-3">
          {route.summary}
        </p>
      </div>

      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{route.lastUpdated}</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetails(route)}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 min-h-[44px] px-2 focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <span>Examine Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
