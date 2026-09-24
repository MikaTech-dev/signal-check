'use client';

import React from 'react';
import { AiAnalysisResult } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getSourceBadgeInfo, getUrgencyBadgeClasses } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, HelpCircle, Sparkles, MapPin, Clock, Plus } from 'lucide-react';

interface AnalysisResultCardProps {
  analysis: AiAnalysisResult;
  rawText: string;
  onCommitToLiveBoard: () => void;
  isCommitted: boolean;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  analysis,
  rawText,
  onCommitToLiveBoard,
  isCommitted,
}) => {
  const sourceInfo = getSourceBadgeInfo(analysis.source_type, analysis.is_firsthand);
  const isHighConfidence = analysis.confidence >= 75;
  const isLowConfidence = analysis.confidence <= 40;

  return (
    <div className="bg-zinc-900 border-2 border-emerald-500/50 rounded-xl p-5 sm:p-6 shadow-xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            DeepSeek Flash Signal Extraction
          </h3>
        </div>
        <Badge
          variant={isHighConfidence ? 'success' : isLowConfidence ? 'warning' : 'info'}
          dot
          className="text-xs"
        >
          {analysis.confidence}% Confidence Rating
        </Badge>
      </div>

      <div className="mt-4 space-y-4">
        {/* Extracted Core Claims */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-black/50 p-3 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block mb-1">Identified Location:</span>
            <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{analysis.location}</span>
            </div>
          </div>

          <div className="bg-black/50 p-3 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block mb-1">Incident Classification:</span>
            <div className="font-semibold text-zinc-100">{analysis.incident_type}</div>
          </div>
        </div>

        {/* Source Credibility Filter Result */}
        <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Source Credibility Breakdown
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded border font-medium ${sourceInfo.classes}`}>
              {sourceInfo.label}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {analysis.reasoning}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-900 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Urgency:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getUrgencyBadgeClasses(analysis.urgency)}`}>
                {analysis.urgency}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {analysis.needs_human_review ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flagged for Patrol Confirmation
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Direct Witness Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant={isCommitted ? 'secondary' : 'primary'}
            size="md"
            onClick={onCommitToLiveBoard}
            disabled={isCommitted}
            leftIcon={isCommitted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
          >
            {isCommitted ? 'Signal Integrated to Live Dashboard' : 'Integrate Signal to Live Route Status'}
          </Button>
        </div>
      </div>
    </div>
  );
};
