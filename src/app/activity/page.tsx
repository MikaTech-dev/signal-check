'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signalStore } from '@/lib/store';
import { Attestation, IncidentReport } from '@/types';
import { Clock, Eye, ShieldAlert, MessageSquareQuote, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ActivityPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'ATTESTATIONS'>('REPORTS');

  const currentUser = signalStore.getCurrentUser();

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
    <div className="space-y-4 max-w-3xl mx-auto text-[#0A0A0A]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#C7862B]" />
            <h1 className="text-lg font-bold text-[#0A0A0A] tracking-tight">
              My activity
            </h1>
          </div>
          <p className="text-xs text-[#57534E]">
            Your reports and attestations as {currentUser.name}.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-[#E7E5E4] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`pb-2.5 px-1 border-b-2 transition-colors ${
            activeTab === 'REPORTS'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
          }`}
        >
          Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('ATTESTATIONS')}
          className={`pb-2.5 px-1 border-b-2 transition-colors ${
            activeTab === 'ATTESTATIONS'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#737373] hover:text-[#0A0A0A]'
          }`}
        >
          Attestations ({attestations.length})
        </button>
      </div>

      {/* Reports View */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-lg space-y-2">
              <FileText className="w-8 h-8 text-[#A8A29E] mx-auto" />
              <p className="text-xs text-[#737373]">You have not submitted any crisis reports yet.</p>
              <Link
                href="/report"
                className="inline-block px-3 py-1.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold"
              >
                Log a report
              </Link>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg bg-white border border-[#E7E5E4] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A0A0A]">
                    {report.incidentType.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-[#737373]">
                    Score: {report.triageAudit.completenessScore}/100
                  </span>
                </div>

                <p className="text-[#171717] bg-[#FAFAF9] p-2.5 rounded border border-[#F5F5F4] leading-relaxed">
                  {report.rawText}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#737373] pt-1">
                  <span>Location: {report.locationLabel}</span>
                  {report.incidentId && (
                    <Link
                      href={`/nearby?incident=${report.incidentId}`}
                      className="font-bold text-[#0A0A0A] underline hover:text-[#C7862B] flex items-center gap-1"
                    >
                      <span>Linked Incident #{report.incidentId}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Attestations View */}
      {activeTab === 'ATTESTATIONS' && (
        <div className="space-y-3">
          {attestations.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-lg space-y-2">
              <Eye className="w-8 h-8 text-[#A8A29E] mx-auto" />
              <p className="text-xs text-[#737373]">You have not logged any structured attestations yet.</p>
              <Link
                href="/nearby"
                className="inline-block px-3 py-1.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold"
              >
                Explore Nearby Incidents
              </Link>
            </div>
          ) : (
            attestations.map((att) => (
              <div
                key={att.id}
                className="p-4 rounded-lg bg-white border border-[#E7E5E4] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    {att.type === 'FIRSTHAND_WITNESS' && <Eye className="w-3.5 h-3.5 text-[#0A0A0A]" />}
                    {att.type === 'ACTIVE_CONTRADICTION' && <ShieldAlert className="w-3.5 h-3.5 text-[#991B1B]" />}
                    {att.type === 'HEARSAY_TRACKING' && <MessageSquareQuote className="w-3.5 h-3.5 text-[#57534E]" />}
                    <span>{att.type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-[11px] text-[#737373]">{att.observedAt}</span>
                </div>

                <p className="text-[#171717] bg-[#FAFAF9] p-2.5 rounded border border-[#F5F5F4] leading-relaxed">
                  {att.observation}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#737373] pt-1">
                  <span>Location: {att.locationObserved}</span>
                  <Link
                    href={`/nearby?incident=${att.incidentId}`}
                    className="font-bold text-[#0A0A0A] underline hover:text-[#C7862B] flex items-center gap-1"
                  >
                    <span>View Incident #{att.incidentId}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
