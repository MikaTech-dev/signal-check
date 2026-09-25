'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signalStore } from '@/lib/store';
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
    const found = signalStore.getIncidentById(resolvedParams.id);
    if (found) setIncident(found);
    setLoaded(true);
  }, [resolvedParams.id]);

  if (!loaded) {
    return (
      <div className="p-8 text-xs text-[#737373] text-center">
        Loading crisis telemetry...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center bg-white border border-[#E7E5E4] rounded-lg space-y-3">
        <h2 className="text-sm font-bold text-[#0A0A0A]">Incident Not Found</h2>
        <p className="text-xs text-[#737373]">
          The incident #{resolvedParams.id} may have expired or been merged.
        </p>
        <Link
          href="/nearby"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Nearby Feeds</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <IncidentDetailDrawer
        incident={incident}
        onClose={() => router.push('/nearby')}
        onUpdate={() => {
          const updated = signalStore.getIncidentById(resolvedParams.id);
          if (updated) setIncident(updated);
        }}
      />
    </div>
  );
}
