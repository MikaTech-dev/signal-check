'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PRESET_SAMPLE_REPORTS } from '@/lib/mockData';
import { AiAnalysisResult } from '@/types';
import { Sparkles, MessageSquare, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { AnalysisResultCard } from './AnalysisResultCard';

interface ReportFormProps {
  onAddReportToLive: (rawText: string, analysis: AiAnalysisResult) => void;
  initialText?: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onAddReportToLive,
  initialText = '',
}) => {
  const [reportText, setReportText] = useState<string>(initialText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reportText.trim()) {
      setError('Please enter a community message or choose a test preset.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsCommitted(false);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: reportText.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI verification failed.');
      }

      setCurrentAnalysis(data.analysis);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to connect to AI signal service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setReportText(presetText);
    setError(null);
    setCurrentAnalysis(null);
    setIsCommitted(false);
  };

  const handleCommit = () => {
    if (currentAnalysis && reportText) {
      onAddReportToLive(reportText, currentAnalysis);
      setIsCommitted(true);
    }
  };

  const handleClear = () => {
    setReportText('');
    setError(null);
    setCurrentAnalysis(null);
    setIsCommitted(false);
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Community Message & Rumour Ingest
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paste unverified WhatsApp forwards, radio chatter, or eyewitness statements to extract verified facts.
            </p>
          </div>
          {reportText && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 min-h-[36px] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Preset Selector Buttons */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            One-Click Test Scenarios (for 120s Loom walkthrough):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {PRESET_SAMPLE_REPORTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.text)}
                className="text-left p-3 rounded-lg bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 text-xs flex flex-col justify-between gap-1.5"
              >
                <div className="font-semibold text-zinc-200">{preset.title}</div>
                <div className="text-[11px] text-zinc-400 leading-snug">{preset.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-5 space-y-4">
          <div>
            <label htmlFor="report-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Raw Community Text / Audio Transcript
            </label>
            <textarea
              id="report-input"
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Example: Just left North Gate on motorcycle at 6:40 PM. Road is open and vigilante post is waving cars through..."
              className="w-full bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-zinc-500 resize-y"
            />
          </div>

          {error && (
            <div
              className="p-3 bg-rose-950/60 border border-rose-600/40 rounded-lg flex items-center gap-2 text-xs text-rose-300"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-xs text-zinc-400">
              Filtered by DeepSeek Flash Engine (Distinguishes Firsthand vs Hearsay)
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Filter & Verify Signal
            </Button>
          </div>
        </form>
      </Card>

      {/* Analysis Output Result */}
      {currentAnalysis && (
        <AnalysisResultCard
          analysis={currentAnalysis}
          rawText={reportText}
          onCommitToLiveBoard={handleCommit}
          isCommitted={isCommitted}
        />
      )}
    </div>
  );
};
