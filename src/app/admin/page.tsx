'use client';

import React, { useEffect, useState } from 'react';
import { signalStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { AuditLogEntry } from '@/types';
import { Layers, Shield, Clock } from 'lucide-react';

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
    <div className="space-y-5 max-w-3xl mx-auto text-[#0A0A0A]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-[#C7862B]" />
          <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
            System Administration & State Audit Logs
          </h1>
        </div>
        <p className="text-xs text-[#57534E]">
          Immutable record of formal anchor verifications, state changes, and moderation actions.
        </p>
      </div>

      <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
            Audit Trail ({logs.length} entries)
          </span>
          <span className="text-[11px] text-[#737373]">System Log ID: SG-NG-AUDIT</span>
        </div>

        <div className="divide-y divide-[#F5F5F4] text-xs">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-[#737373]">No audit logs recorded yet.</div>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0A0A0A]">{entry.action}</span>
                  <span className="text-[11px] text-[#737373] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </span>
                </div>
                <p className="text-[#57534E] leading-relaxed">{entry.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#78716C] pt-0.5">
                  <span>Actor: {entry.actorName} ({entry.actorRole})</span>
                  <span>&bull;</span>
                  <span>Target: {entry.targetId}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
