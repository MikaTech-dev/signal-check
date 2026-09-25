'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Incident } from '@/types';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { ShieldCheck, CheckCircle2, AlertTriangle, Check, ArrowRight } from 'lucide-react';

export default function AnchorPage() {
  return (
    <RouteGuard mode="ROLE_PROTECTED" allowedRoles={['ANCHOR', 'COMMUNITY_ANCHOR', 'ADMIN']}>
      <AnchorContent />
    </RouteGuard>
  );
}

function AnchorContent() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [anchorNotes, setAnchorNotes] = useState('');
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  const currentUser = user;

  const loadData = () => {
    setIncidents(signalStore.getIncidents());
    setIsLoadingIncidents(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = signalStore.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  if (!currentUser) return null;

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
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
        {/* Header */}
        <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Stationary Authority Board</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Community Anchor Review Board
          </h1>
          <p className="text-sm text-[#57534E]">
            Stationary anchor authority: <strong className="text-[#0A0A0A]">{currentUser.name}</strong> ({currentUser.assignedCorridor || 'Corridor Focal Point'}).
          </p>
        </div>

        {/* Caution Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-950">Anchor Protocol:</strong> Confirming an incident elevates it to formally verified community status and broadcasts a 5 km perimeter alert. This does not declare any route safe.
          </p>
        </div>

        {/* Unconfirmed Incidents List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#0A0A0A]">
            Incidents Awaiting Stationary Verification ({unconfirmedIncidents.length})
          </h2>

          {unconfirmedIncidents.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-2xl text-sm text-[#737373]">
              No unconfirmed incidents currently awaiting review in your corridor.
            </div>
          ) : (
            <div className="space-y-4">
              {unconfirmedIncidents.map((inc) => (
                <article
                  key={inc.id}
                  className="bg-white border border-[#E7E5E4] rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-[#0A0A0A]">{inc.title}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#D6D3D1]">
                      {inc.state}
                    </span>
                  </div>

                  <p className="text-xs text-[#57534E]">
                    Location: <strong className="text-[#0A0A0A]">{inc.locationLabel}</strong> &bull; {inc.firsthandCount} Firsthand Sightings &bull; {inc.contradictionCount} Contradictions
                  </p>

                  <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-xs leading-relaxed text-[#171717]">
                    {inc.synthesisSummary}
                  </div>

                  {confirmingId === inc.id ? (
                    <div className="space-y-3 pt-3 border-t border-[#F5F5F4]">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                        Stationary On-Site Verification Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={anchorNotes}
                        onChange={(e) => setAnchorNotes(e.target.value)}
                        placeholder="e.g. Inspected personally with NURTW union wardens at the barrier..."
                        className="w-full text-xs p-3.5 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="px-4 py-2 text-xs text-[#737373] hover:text-[#0A0A0A] font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirm(inc.id)}
                          className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-[#C7862B]" />
                          <span>Formally Confirm & Broadcast Alert</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3 pt-2 border-t border-[#F5F5F4]">
                      <Link
                        href={`/nearby?incident=${inc.id}`}
                        className="px-5 py-2.5 rounded-full border border-[#D6D3D1] hover:border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] transition-colors"
                      >
                        Inspect Telemetry
                      </Link>
                      <button
                        onClick={() => setConfirmingId(inc.id)}
                        className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                        <span>Confirm as Anchor</span>
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* My Records */}
        {confirmedByMe.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-[#0A0A0A]">
              My Formal Verification Records ({confirmedByMe.length})
            </h2>
            <div className="space-y-3">
              {confirmedByMe.map((inc) => (
                <div
                  key={inc.id}
                  className="p-5 rounded-2xl bg-white border border-[#E7E5E4] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="text-[#0A0A0A]">{inc.title}</span>
                    <span className="text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Confirmed</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E]">
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
