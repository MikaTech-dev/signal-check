'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { Incident } from '@/types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

export default function AnchorPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [anchorNotes, setAnchorNotes] = useState('');
  const currentUser = signalStore.getCurrentUser();

  const loadData = () => {
    setIncidents(signalStore.getIncidents());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = signalStore.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  const unconfirmedIncidents = incidents.filter(
    (i) => i.state === 'CORROBORATED' || i.state === 'CONFLICTING' || i.state === 'UNVERIFIED'
  );

  const confirmedByMe = incidents.filter(
    (i) => i.confirmedByAnchor?.anchorName === currentUser.name
  );

  const handleConfirm = async (incidentId: string) => {
    if (!anchorNotes.trim()) {
      toast.error('Please enter on-site verification notes.');
      return;
    }

    try {
      await incidentsApi.confirm(incidentId, anchorNotes.trim());
    } catch {
      // Local store fallback
    }

    signalStore.confirmIncidentAsAnchor(incidentId, anchorNotes.trim());
    setConfirmingId(null);
    setAnchorNotes('');
    toast.success('Incident formally confirmed by anchor', {
      description: '5 km perimeter alert broadcast triggered.',
    });
    loadData();
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto text-[#0A0A0A]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#C7862B]" />
            <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
              Community Anchor Review Board
            </h1>
          </div>
          <p className="text-xs text-[#57534E]">
            Stationary anchor authority: {currentUser.name} ({currentUser.assignedCorridor || 'Corridor Focal Point'}).
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Anchor Confirmation Protocol:</strong> Confirming an incident elevates it to formally verified community status and broadcasts a 5 km perimeter alert. This does not establish that any corridor is 100% safe.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
          Incidents Awaiting Stationary Verification ({unconfirmedIncidents.length})
        </h3>

        {unconfirmedIncidents.length === 0 ? (
          <div className="p-6 text-center bg-white border border-[#E7E5E4] rounded-lg text-xs text-[#737373]">
            No unconfirmed incidents currently awaiting review in your corridor.
          </div>
        ) : (
          unconfirmedIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-4 rounded-lg bg-white border border-[#E7E5E4] space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0A0A0A] text-sm">{inc.title}</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#FAFAF9] border border-[#D6D3D1]">
                  {inc.state}
                </span>
              </div>

              <p className="text-[#57534E]">
                Location: <strong className="text-[#171717]">{inc.locationLabel}</strong> &bull; {inc.firsthandCount} Firsthand Sightings &bull; {inc.contradictionCount} Contradictions
              </p>

              <div className="p-2.5 rounded bg-[#FAFAF9] border border-[#F5F5F4] leading-relaxed">
                {inc.synthesisSummary}
              </div>

              {confirmingId === inc.id ? (
                <div className="space-y-2 pt-2 border-t border-[#F5F5F4]">
                  <label className="block font-semibold text-[#171717]">
                    Stationary On-Site Verification Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={anchorNotes}
                    onChange={(e) => setAnchorNotes(e.target.value)}
                    placeholder="e.g., Inspected personally with NURTW union wardens at the barrier..."
                    className="w-full text-xs p-2 rounded border border-[#D6D3D1] bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="px-3 py-1.5 text-xs text-[#737373]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirm(inc.id)}
                      className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#C7862B]" />
                      <span>Formally Confirm & Trigger Alert</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-1">
                  <Link
                    href={`/nearby?incident=${inc.id}`}
                    className="px-3 py-2 rounded border border-[#D6D3D1] hover:bg-[#F5F5F4] text-xs font-medium"
                  >
                    Inspect Telemetry
                  </Link>
                  <button
                    onClick={() => setConfirmingId(inc.id)}
                    className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] min-h-[44px] flex items-center gap-1"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                    <span>Confirm as Anchor</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {confirmedByMe.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
            My Formal Verification Records ({confirmedByMe.length})
          </h3>
          <div className="space-y-2">
            {confirmedByMe.map((inc) => (
              <div
                key={inc.id}
                className="p-3.5 rounded-lg bg-white border border-[#E7E5E4] text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{inc.title}</span>
                  <span className="text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmed</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E]">
                  Notes: {inc.confirmedByAnchor?.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
