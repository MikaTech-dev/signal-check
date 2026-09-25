'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signalStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { IncidentReport } from '@/types';
import { SlidersHorizontal, ShieldAlert, CheckCircle2, Ban } from 'lucide-react';

export default function ModeratorPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const currentUser = signalStore.getCurrentUser();

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
    <div className="space-y-5 max-w-3xl mx-auto text-[#0A0A0A]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-5 h-5 text-[#C7862B]" />
          <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
            Moderation & Viral Quarantine Queue
          </h1>
        </div>
        <p className="text-xs text-[#57534E]">
          DeepSeek Flash duplicate chain audits, panic detection, and raw telemetry inspection.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          <span>Quarantined Viral Chains & Hysteria Submissions ({quarantinedReports.length})</span>
        </h3>

        {quarantinedReports.length === 0 ? (
          <div className="p-6 text-center bg-white border border-[#E7E5E4] rounded-lg text-xs text-[#737373]">
            No quarantined reports in queue.
          </div>
        ) : (
          quarantinedReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-lg bg-white border border-rose-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#991B1B]">
                  {report.incidentType.replace(/_/g, ' ')} &bull; Viral Match {report.triageAudit.duplicateChainConfidence}%
                </span>
                <span className="text-[11px] font-mono text-[#737373]">
                  Exact Private GPS: {report.coordinates.latitude.toFixed(4)}, {report.coordinates.longitude.toFixed(4)}
                </span>
              </div>

              <p className="text-[#171717] bg-rose-50/40 p-2.5 rounded border border-rose-100 leading-relaxed font-mono">
                {report.rawText}
              </p>

              <p className="text-[11px] text-[#991B1B] font-semibold">
                Reason: {report.triageAudit.quarantineReason || report.triageAudit.triageNotes}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F5F5F4]">
                <button
                  onClick={() => handleApprove(report.id)}
                  className="px-3 py-1.5 rounded border border-[#D6D3D1] hover:bg-[#F5F5F4] text-xs font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Release Quarantine & Approve</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
          Pending Telemetry Submissions ({pendingReports.length})
        </h3>

        {pendingReports.length === 0 ? (
          <div className="p-6 text-center bg-white border border-[#E7E5E4] rounded-lg text-xs text-[#737373]">
            All submitted reports audited.
          </div>
        ) : (
          pendingReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-lg bg-white border border-[#E7E5E4] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-bold">
                <span>{report.incidentType.replace(/_/g, ' ')}</span>
                <span className="font-mono text-[#737373]">
                  Completeness: {report.triageAudit.completenessScore}/100
                </span>
              </div>

              <p className="text-[#171717] bg-[#FAFAF9] p-2.5 rounded border border-[#F5F5F4] leading-relaxed">
                {report.rawText}
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => handleQuarantine(report.id)}
                  className="px-3 py-1.5 rounded border border-rose-200 text-[#991B1B] hover:bg-rose-50 text-xs font-bold flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Quarantine</span>
                </button>
                <button
                  onClick={() => handleApprove(report.id)}
                  className="px-3 py-1.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold"
                >
                  Approve Telemetry
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
