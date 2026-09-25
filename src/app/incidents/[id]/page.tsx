'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { Incident } from '@/types';
import { IncidentDetailDrawer } from '@/components/incidents/IncidentDetailDrawer';
import { ArrowLeft, Radio } from 'lucide-react';

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchIncident() {
      try {
        const res = await incidentsApi.getById(resolvedParams.id);
        if (res.success && res.data) {
          setIncident(res.data);
          signalStore.updateIncident(res.data);
          setLoaded(true);
          return;
        }
      } catch {
        // Fall back to local store
      }
      const found = signalStore.getIncidentById(resolvedParams.id);
      if (found) setIncident(found);
      setLoaded(true);
    }
    fetchIncident();
  }, [resolvedParams.id]);

  if (!loaded) {
    return (
      <div className="min-h-[50dvh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
        <p className="text-xs font-semibold text-[#737373] tracking-wide uppercase">
          Loading crisis telemetry...
        </p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-md mx-auto my-16 p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-10 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#0A0A0A]">Incident Not Found</h2>
          <p className="text-sm text-[#737373]">
            Incident #{resolvedParams.id} may have expired or been resolved.
          </p>
          <div className="pt-2">
            <Link
              href="/nearby"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Nearby Feeds</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <IncidentDetailDrawer
        incident={incident}
        onClose={() => router.push('/nearby')}
        onUpdate={async () => {
          try {
            const res = await incidentsApi.getById(resolvedParams.id);
            if (res.success && res.data) {
              setIncident(res.data);
              signalStore.updateIncident(res.data);
              return;
            }
          } catch {
            // Fall back
          }
          const updated = signalStore.getIncidentById(resolvedParams.id);
          if (updated) setIncident(updated);
        }}
      />
    </div>
  );
}
