'use client';

import React from 'react';
import { RouteStatus, SafetyReport } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getStatusTheme, getSourceBadgeInfo } from '@/lib/utils';
import { ShieldCheck, Eye, MessageSquare, AlertCircle, Clock } from 'lucide-react';

interface RouteDetailModalProps {
  route: RouteStatus | null;
  reports: SafetyReport[];
  isOpen: boolean;
  onClose: () => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  reports,
  isOpen,
  onClose,
}) => {
  if (!route) return null;

  const theme = getStatusTheme(route.status);
  const relevantReports = reports.filter(
    (rep) => rep.location.toLowerCase().includes(route.name.toLowerCase()) || route.name.toLowerCase().includes(rep.location.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Route Verification: ${route.name}`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between p-3.5 bg-black/50 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${theme.dot}`} />
            <span className="font-semibold text-sm text-white">{theme.label}</span>
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
            {route.confidenceScore}% Confidence
          </Badge>
        </div>

        {/* Narrative Summary */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-xs text-zinc-200 leading-relaxed">
          <h4 className="font-semibold text-zinc-400 uppercase text-[11px] mb-1">
            Consensus Summary
          </h4>
          <p>{route.summary}</p>
        </div>

        {/* Evidence Feed */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
            <span>Linked Signals & Ingested Reports ({relevantReports.length})</span>
            <span className="font-normal text-zinc-500 lowercase">sorted by latest</span>
          </h4>

          {relevantReports.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded border border-zinc-800">
              No recent field reports specifically matching this corridor name.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {relevantReports.map((report) => {
                const sourceBadge = getSourceBadgeInfo(report.sourceType, report.isFirsthand);
                return (
                  <div
                    key={report.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${sourceBadge.classes}`}>
                        {sourceBadge.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {report.submittedAt}
                      </span>
                    </div>

                    <p className="text-zinc-200 font-medium text-xs">
                      &quot;{report.rawText}&quot;
                    </p>

                    <div className="pt-1 text-[11px] text-zinc-400 border-t border-zinc-900 flex items-center justify-between">
                      <span>AI Rationale: {report.reasoning}</span>
                      <span className="font-mono text-zinc-300">
                        {report.confidenceScore}% conf
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 min-h-[44px]"
          >
            Close Route Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
