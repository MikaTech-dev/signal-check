'use client';

import React from 'react';
import { MultiStepReportForm } from '@/components/reports/MultiStepReportForm';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { PlusCircle } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-16 text-[#0A0A0A]">
      <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
          <PlusCircle className="w-3.5 h-3.5 text-[#C7862B]" />
          <span>Community Intake Flow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
          Report an Incident
        </h1>
        <p className="text-sm text-[#57534E]">
          Submit firsthand sightings, message forwards, or local hazard alerts to warn residents within 5 km.
        </p>
      </div>

      <MultiStepReportForm />
    </div>
  );
}
