'use client';

import React, { useState } from 'react';
import { SafetyReport, SourceType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSourceBadgeInfo, getUrgencyBadgeClasses } from '@/lib/utils';
import { Eye, Radio, MessageSquare, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

interface EvidenceListProps {
  reports: SafetyReport[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ reports }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.incidentType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'FIRSTHAND') return report.isFirsthand && report.sourceType === 'FIRSTHAND_OBSERVATION';
    if (filterType === 'RADIO') return report.sourceType === 'COMMUNITY_RADIO';
    if (filterType === 'HEARSAY') return !report.isFirsthand || report.sourceType === 'UNVERIFIED_WHATSAPP' || report.sourceType === 'HEARSAY_RUMOR';
    return true;
  });

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Community Signal Stream & Evidence Log
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transparent breakdown of every ingested report and its AI source credibility rating.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search corridors or text..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[36px]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-zinc-500 flex items-center gap-1 font-medium">
          <Filter className="w-3 h-3" /> Filter by:
        </span>
        {[
          { id: 'ALL', label: `All Signals (${reports.length})` },
          { id: 'FIRSTHAND', label: 'Firsthand Eyewitnesses' },
          { id: 'RADIO', label: 'Patrol Radio' },
          { id: 'HEARSAY', label: 'Filtered Hearsay & Rumours' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
              filterType === f.id
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Report Cards Feed */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-10 px-4 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
          <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-zinc-300">No signals found matching this filter</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting &quot;All Signals&quot; to view every report.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredReports.map((rep) => {
            const badge = getSourceBadgeInfo(rep.sourceType, rep.isFirsthand);
            return (
              <div
                key={rep.id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 transition-all hover:border-zinc-700 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${badge.classes}`}>
                      {badge.label}
                    </span>
                    <span className="font-semibold text-zinc-200">{rep.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                    <span className="text-zinc-500">Submitted:</span>
                    <span>{rep.submittedAt}</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/60 text-zinc-200 text-sm">
                  &quot;{rep.rawText}&quot;
                </div>

                <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">AI Fact-Check Rationale:</span>
                    <span className="text-zinc-300">{rep.reasoning}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-emerald-400 font-semibold">
                      {rep.confidenceScore}% Confidence
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-medium ${getUrgencyBadgeClasses(rep.urgency)}`}>
                      {rep.urgency} Urgency
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
