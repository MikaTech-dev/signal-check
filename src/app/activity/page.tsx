'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signalStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { Attestation, IncidentReport } from '@/types';
import { RouteGuard } from '@/components/auth/RouteGuard';
import {
  Clock,
  Eye,
  ShieldAlert,
  MessageSquareQuote,
  FileText,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export default function ActivityPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'ATTESTATIONS'>('REPORTS');

  const currentUser = user || signalStore.getCurrentUser();

  const loadData = () => {
    const allReports = signalStore.getReports().filter((r) => r.userId === currentUser.id);
    const allAttestations = signalStore.getAttestations().filter((a) => a.userId === currentUser.id);
    setReports(allReports);
    setAttestations(allAttestations);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = signalStore.subscribe(() => loadData());
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 pb-2 border-b border-[#E7E5E4]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>Personal Evidence Log</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
              My Activity
            </h1>
            <p className="text-sm text-[#57534E]">
              Logged submissions and firsthand attestations as <span className="font-bold text-[#0A0A0A]">{currentUser.name}</span>.
            </p>
          </div>

          <Link
            href="/report"
            className="group px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] flex items-center gap-2.5 transition-all min-h-[44px] active:scale-[0.98] self-start sm:self-auto"
          >
            <span>Log Report</span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'REPORTS'
                ? 'bg-[#0A0A0A] text-white shadow-sm'
                : 'bg-white border border-[#D6D3D1] text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
            }`}
          >
            Reports ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab('ATTESTATIONS')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'ATTESTATIONS'
                ? 'bg-[#0A0A0A] text-white shadow-sm'
                : 'bg-white border border-[#D6D3D1] text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
            }`}
          >
            Attestations ({attestations.length})
          </button>
        </div>

        {/* Reports Feed */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
                <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-12 text-center space-y-4">
                  <FileText className="w-10 h-10 text-[#A8A29E] mx-auto" />
                  <h3 className="text-xl font-bold text-[#0A0A0A]">No crisis reports logged</h3>
                  <p className="text-sm text-[#737373] max-w-sm mx-auto">
                    You have not submitted any transit disruption observations yet.
                  </p>
                  <Link
                    href="/report"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-full bg-[#0A0A0A] text-white hover:bg-[#262626] transition-transform active:scale-[0.98]"
                  >
                    <span>Submit your first report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              reports.map((report) => (
                <article
                  key={report.id}
                  className="bg-white border border-[#E7E5E4] rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
                      {report.incidentType.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#737373] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-full">
                      Audit Score: {report.triageAudit.completenessScore}/100
                    </span>
                  </div>

                  <p className="text-base text-[#171717] bg-[#FAFAF9] p-5 rounded-2xl border border-[#F5F5F4] leading-relaxed">
                    {report.rawText}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#737373] pt-2 border-t border-[#F5F5F4] gap-2">
                    <span className="font-medium text-[#0A0A0A]">Location: {report.locationLabel}</span>
                    {report.incidentId && (
                      <Link
                        href={`/nearby?incident=${report.incidentId}`}
                        className="font-bold text-[#0A0A0A] hover:text-[#C7862B] flex items-center gap-1 group"
                      >
                        <span>Linked Incident #{report.incidentId}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Attestations Feed */}
        {activeTab === 'ATTESTATIONS' && (
          <div className="space-y-4">
            {attestations.length === 0 ? (
              <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
                <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-12 text-center space-y-4">
                  <Eye className="w-10 h-10 text-[#A8A29E] mx-auto" />
                  <h3 className="text-xl font-bold text-[#0A0A0A]">No structured attestations</h3>
                  <p className="text-sm text-[#737373] max-w-sm mx-auto">
                    You have not added firsthand sightings or contradictions to active incidents yet.
                  </p>
                  <Link
                    href="/nearby"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-full bg-[#0A0A0A] text-white hover:bg-[#262626] transition-transform active:scale-[0.98]"
                  >
                    <span>Browse nearby incidents</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              attestations.map((att) => (
                <article
                  key={att.id}
                  className="bg-white border border-[#E7E5E4] rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {att.type === 'FIRSTHAND_WITNESS' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0A] text-white">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Firsthand Witness</span>
                        </span>
                      )}
                      {att.type === 'ACTIVE_CONTRADICTION' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#991B1B]" />
                          <span>Active Contradiction</span>
                        </span>
                      )}
                      {att.type === 'HEARSAY_TRACKING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                          <span>Hearsay Log</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#737373]">{att.observedAt}</span>
                  </div>

                  <p className="text-base text-[#171717] bg-[#FAFAF9] p-5 rounded-2xl border border-[#F5F5F4] leading-relaxed">
                    {att.observation}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#737373] pt-2 border-t border-[#F5F5F4]">
                    <span className="font-medium text-[#0A0A0A]">Observed at: {att.locationObserved}</span>
                    <Link
                      href={`/nearby?incident=${att.incidentId}`}
                      className="font-bold text-[#0A0A0A] hover:text-[#C7862B] flex items-center gap-1 group"
                    >
                      <span>View Incident #{att.incidentId}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
  );
}
