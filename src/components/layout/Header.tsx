'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Radio, Clock, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  reportCount: number;
  unverifiedRumorCount: number;
  onOpenQuickReport: () => void;
  showBackToLanding?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  reportCount,
  unverifiedRumorCount,
  onOpenQuickReport,
  showBackToLanding = true,
}) => {
  return (
    <header className="border-b border-zinc-200/80 bg-white/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showBackToLanding && (
            <Link
              href="/"
              className="p-2 text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4] rounded-lg transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Back to landing page"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <Image
            src="/signal.png"
            alt="SignalNG"
            width={28}
            height={28}
            className="object-contain"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A]">
                SignalNG
              </span>
              <Badge variant="amber" dot>
                Live Triage Filter
              </Badge>
            </div>
            <p className="text-xs text-[#57534E]">
              Hyper-local crisis triage for uncertain regional corridors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-[#171717] bg-[#FAFAF9] border border-[#E7E5E4] px-3 py-2 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[#C7862B]" />
            <span className="font-mono font-bold text-[#0A0A0A]">6:40 PM</span>
            <span className="text-[#737373] hidden md:inline">| Market Closing Window</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenQuickReport}
            leftIcon={<Radio className="w-3.5 h-3.5" />}
          >
            Upload Field Report
          </Button>
        </div>
      </div>
    </header>
  );
};
