'use client';

import React, { useEffect, useState } from 'react';
import { signalStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { AuditLogEntry } from '@/types';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Layers, Shield, Clock, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await adminApi.getAuditLogs();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLogs(res.data);
          return;
        }
      } catch {
        // Local fallback
      }
      setLogs(signalStore.getAuditLogs());
    };

    fetchLogs();
    const unsubscribe = signalStore.subscribe(() => {
      setLogs(signalStore.getAuditLogs());
    });
    return () => unsubscribe();
  }, []);

  return (
    <RouteGuard mode="ROLE_PROTECTED" allowedRoles={['ADMIN']}>
      <div className="space-y-8 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
        {/* Header */}
        <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Administrator Audit Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            State & Security Audit Logs
          </h1>
          <p className="text-sm text-[#57534E]">
            Immutable telemetry records of formal anchor verifications, state changes, and moderation actions.
          </p>
        </div>

        {/* Double-Bezel Audit Trail Container */}
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
            <div className="p-6 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Audit Trail ({logs.length} entries)
              </span>
              <span className="text-xs font-mono text-[#737373] bg-white px-2.5 py-1 rounded-full border border-[#E7E5E4]">
                LOG: SG-NG-VAULT
              </span>
            </div>

            <div className="divide-y divide-[#F5F5F4] text-xs">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-[#737373]">No audit logs recorded yet.</div>
              ) : (
                logs.map((entry) => (
                  <div key={entry.id} className="p-6 space-y-2 hover:bg-[#FAFAF9] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#0A0A0A]">{entry.action}</span>
                      <span className="text-xs text-[#737373] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#C7862B]" />
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </span>
                    </div>
                    <p className="text-sm text-[#57534E] leading-relaxed">{entry.details}</p>
                    <div className="flex items-center gap-3 text-xs text-[#78716C] pt-1">
                      <span>Actor: <strong className="text-[#0A0A0A]">{entry.actorName}</strong> ({entry.actorRole})</span>
                      <span>&bull;</span>
                      <span>Target: <strong className="text-[#0A0A0A]">{entry.targetId}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
