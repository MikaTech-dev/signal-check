'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ShieldCheck, MapPin, Eye, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
      {/* Header */}
      <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#C7862B]" />
          <span>Epistemic Architecture Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
          How Verification Works
        </h1>
        <p className="text-sm text-[#57534E]">
          How SignalNG handles community uncertainty, structured attestations, and 5 km radius alerts.
        </p>
      </div>

      {/* 1. Stance */}
      <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">01 / Epistemic Stance</span>
          <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
            Why no AI declares a route safe
          </h2>
          <p className="text-base text-[#57534E] leading-relaxed">
            SignalNG refuses to tell you a route is safe because ground conditions can shift in minutes. Instead, the platform organizes incoming reports, tracks how many sources are firsthand, flags active contradictions, and alerts residents within 5 km with clear uncertainty labels.
          </p>
        </div>
      </div>

      {/* 2. Glossary */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">02 / Timeline Mechanics</span>
          <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight mt-1">
            Deterministic 4-Stage State Machine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAFAF9] border border-[#D6D3D1] text-[#0A0A0A]">
              UNVERIFIED
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Single report submitted. Audited by LLM for completeness and displayed in local feeds only. No broad alerts sent.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
              CORROBORATED (UNCONFIRMED)
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Two or more independent firsthand sightings with no active contradictions. Triggers a structured 5 km perimeter alert.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300">
              CONFLICTING
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Firsthand sightings and active contradictions disagree. Both observations remain visible in the incident discrepancy matrix.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
              CONFIRMED
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Formally verified on site by designated stationary anchors (transport union chairs, market wardens) with known physical posts.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Attestation Engine */}
      <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">03 / Attestation Engine</span>
          <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
            Why structured attestations replace upvotes
          </h2>
          <p className="text-base text-[#57534E] leading-relaxed">
            During transit disruptions, panic causes people to upvote rumors they only heard secondhand. Reddit-style voting is replaced with three explicit evidentiary actions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-1">
              <span className="font-bold text-sm text-[#0A0A0A] block">Firsthand Witness</span>
              <span className="text-xs text-[#737373]">
                Direct physical observation at the spot right now.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-1">
              <span className="font-bold text-sm text-[#991B1B] block">Active Contradiction</span>
              <span className="text-xs text-[#737373]">
                Passed location recently; normal conditions observed.
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-1">
              <span className="font-bold text-sm text-[#57534E] block">Hearsay Log</span>
              <span className="text-xs text-[#737373]">
                Received via third-party forward. Tracked, not corroborated.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Action */}
      <div className="pt-4 flex justify-center">
        <Link
          href="/nearby"
          className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0A0A0A] text-white text-sm font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
        >
          <span>Open Nearby Radar</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

    </div>
  );
}
