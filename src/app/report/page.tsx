'use client';

import React from 'react';
import { MultiStepReportForm } from '@/components/reports/MultiStepReportForm';
import { PlusCircle, ShieldCheck } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle className="w-5 h-5 text-[#C7862B]" />
          <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight">
            Log Community Crisis Telemetry
          </h1>
        </div>
        <p className="text-xs text-[#57534E]">
          Submit firsthand sightings, viral message forwards, or local hazard alerts for mathematical triage and radius alert evaluation.
        </p>
      </div>

      <MultiStepReportForm />
    </div>
  );
}
