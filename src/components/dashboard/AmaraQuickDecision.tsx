'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Navigation, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { RouteStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface AmaraQuickDecisionProps {
  routes: RouteStatus[];
  onSelectRouteForReport: (routeId: string) => void;
}

export const AmaraQuickDecision: React.FC<AmaraQuickDecisionProps> = ({
  routes,
  onSelectRouteForReport,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-north-gate');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handleToggleAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const text = `Road advisory for ${currentRoute.name}. Current status is ${currentRoute.status}. ${currentRoute.summary}. Verified with ${currentRoute.confidenceScore} percent confidence.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Audio narration is not supported on this browser.');
    }
  };

  const isSafe = currentRoute.status === 'SAFE';
  const isCaution = currentRoute.status === 'CAUTION';
  const isDanger = currentRoute.status === 'DANGER';

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded border border-emerald-500/30">
              Immediate Safety Check
            </span>
            <span className="text-xs text-zinc-400">Time: 6:40 PM Market Close</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Should Amara leave the market now?
          </h2>
          <p className="text-sm text-zinc-300 mt-1">
            Verified ground consensus filtered from raw WhatsApp groups and radio channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <label htmlFor="route-select" className="text-xs text-zinc-400 sr-only">
            Select Destination Route
          </label>
          <select
            id="route-select"
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="bg-zinc-800 text-zinc-100 border border-zinc-700 text-sm rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[44px]"
          >
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name} ({route.status})
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="md"
            onClick={handleToggleAudio}
            leftIcon={isPlayingAudio ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            aria-label={isPlayingAudio ? 'Stop audio advisory' : 'Listen to spoken audio advisory'}
          >
            {isPlayingAudio ? 'Stop Audio' : 'Spoken Advisory'}
          </Button>
        </div>
      </div>

      {/* Decision Banner */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div
          className={`lg:col-span-8 p-5 sm:p-6 rounded-xl border flex flex-col justify-between ${
            isSafe
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
              : isCaution
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                {isSafe && <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />}
                {isCaution && <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />}
                {isDanger && <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {isSafe
                      ? 'YES. Road home is safe to travel right now.'
                      : isCaution
                      ? 'CAUTION. Hold departure or verify with local patrol.'
                      : 'DO NOT DEPART. Confirmed hazard on this corridor.'}
                  </h3>
                  <p className="text-xs text-zinc-300 font-mono">
                    Target Route: {currentRoute.name}
                  </p>
                </div>
              </div>

              <Badge
                variant={isSafe ? 'success' : isCaution ? 'warning' : 'danger'}
                dot
                className="text-xs font-semibold px-3 py-1.5"
              >
                {currentRoute.status} ({currentRoute.confidenceScore}% Confidence)
              </Badge>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed mt-2 bg-black/40 p-3.5 rounded-lg border border-zinc-800/80">
              {currentRoute.summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
            <div className="flex items-center gap-4">
              <span>
                Verified Firsthand: <strong className="text-emerald-400">{currentRoute.firsthandCount} reports</strong>
              </span>
              <span>
                Filtered Hearsay: <strong className="text-amber-400">{currentRoute.hearsayCount} unconfirmed</strong>
              </span>
            </div>
            <span className="text-zinc-400">{currentRoute.lastUpdated}</span>
          </div>
        </div>

        {/* Evidence & Action Sidebar */}
        <div className="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              Active Route Highlights
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              {currentRoute.activeIncidents.map((inc, i) => (
                <li key={i} className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => onSelectRouteForReport(currentRoute.id)}
              className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium rounded-lg transition-colors border border-zinc-700 min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Submit Sighting for this Road</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
