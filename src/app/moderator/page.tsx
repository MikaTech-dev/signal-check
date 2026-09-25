'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { IncidentReport } from '@/types';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { SlidersHorizontal, ShieldAlert, CheckCircle2, Ban, Check } from 'lucide-react';

export default function ModeratorPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);

  const loadData = async () => {
    try {
      const res = await adminApi.getQuarantinedReports();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setReports(res.data);
        return;
      }
    } catch {
      // Local fallback
    }
    setReports(signalStore.getReports());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = signalStore.subscribe(() => loadData());
    return () => unsubscribe();
  }, []);

  const quarantinedReports = reports.filter((r) => r.moderationStatus === 'QUARANTINED');
  const pendingReports = reports.filter((r) => r.moderationStatus === 'PENDING');

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveReport(id);
    } catch {
      // Local store fallback
    }
    signalStore.approveReport(id);
    toast.success('Report approved', {
      description: 'Telemetry merged into active incident analysis.',
    });
    loadData();
  };

  const handleQuarantine = (id: string) => {
    signalStore.quarantineReport(id, 'Flagged by manual moderator inspection.');
    toast.warning('Report quarantined', {
      description: 'Quarantined from unconfirmed corroboration count.',
    });
    loadData();
  };

  return (
    <RouteGuard mode="ROLE_PROTECTED" allowedRoles={['MODERATOR', 'ADMIN']}>
      <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
        {/* Header */}
        <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Moderator Triage Station</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Viral Quarantine & Audit Queue
          </h1>
          <p className="text-sm text-[#57534E]">
            DeepSeek Flash duplicate chain audits, hysteria detection, and raw telemetry inspection.
          </p>
        </div>

        {/* Quarantined Viral Chains */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#991B1B]" />
            <h2 className="text-xl font-bold text-[#0A0A0A]">
              Quarantined Viral Chains ({quarantinedReports.length})
            </h2>
          </div>

          {quarantinedReports.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-2xl text-sm text-[#737373]">
              No viral chains currently quarantined in your queue.
            </div>
          ) : (
            <div className="space-y-4">
              {quarantinedReports.map((report) => (
                <article
                  key={report.id}
                  className="bg-white border border-rose-200 rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300">
                      {report.incidentType.replace(/_/g, ' ')} &bull; Viral Match {report.triageAudit.duplicateChainConfidence}%
                    </span>
                    <span className="text-xs font-mono text-[#737373] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-full">
                      Exact GPS: {report.coordinates.latitude.toFixed(4)}, {report.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>

                  <p className="text-base text-[#171717] bg-rose-50/50 p-5 rounded-2xl border border-rose-100 leading-relaxed font-mono text-sm">
                    {report.rawText}
                  </p>

                  <div className="text-xs font-semibold text-[#991B1B]">
                    Flag Reason: {report.triageAudit.quarantineReason || report.triageAudit.triageNotes}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#F5F5F4]">
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98] flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[#C7862B]" />
                      <span>Release Quarantine & Approve</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Pending Telemetry */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-[#0A0A0A]">
            Pending Telemetry Submissions ({pendingReports.length})
          </h2>

          {pendingReports.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-2xl text-sm text-[#737373]">
              All submitted reports have been reviewed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <article
                  key={report.id}
                  className="bg-white border border-[#E7E5E4] rounded-[2rem] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
                      {report.incidentType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#737373] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-full">
                      Completeness: {report.triageAudit.completenessScore}/100
                    </span>
                  </div>

                  <p className="text-base text-[#171717] bg-[#FAFAF9] p-5 rounded-2xl border border-[#F5F5F4] leading-relaxed">
                    {report.rawText}
                  </p>

                  <div className="flex justify-end gap-3 pt-3 border-t border-[#F5F5F4]">
                    <button
                      onClick={() => handleQuarantine(report.id)}
                      className="px-5 py-2.5 rounded-full border border-rose-200 text-[#991B1B] hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Quarantine</span>
                    </button>
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
                    >
                      Approve Telemetry
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
