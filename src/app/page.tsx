'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Radio,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { heuristicTriageAudit } from '@/lib/deepseek';
import { calculateHaversineDistance, formatDistanceBand } from '@/lib/haversine';
import { IncidentType, ReportSourceType } from '@/types';

export default function LandingPage() {
  const presets = [
    {
      title: 'Firsthand Tanker Spill',
      text: 'Just drove past Lugbe Market Northbound exit at 6:32 PM on my bike. Fuel tanker broke down spilling diesel across right lane. Market wardens are waving vehicles left.',
      type: 'HAZARD_SPILL' as IncidentType,
      source: 'FIRSTHAND' as ReportSourceType,
      landmark: 'Lugbe Market Northbound Exit',
      coords: { latitude: 8.9845, longitude: 7.3789 },
      firsthandCount: 3,
      contradictionCount: 0,
      state: 'CORROBORATED (UNCONFIRMED)',
      ttlMinutes: 48,
    },
    {
      title: 'Viral WhatsApp Rumor',
      text: 'FORWARDED AS RECEIVED: URGENT TO ALL LUGBE PARENTS!! Bad boys are gathering with weapons near Eastern flyover! Stay inside everyone panic!!',
      type: 'ROAD_OBSTRUCTION' as IncidentType,
      source: 'HEARSAY' as ReportSourceType,
      landmark: 'Airport Road Eastern Flyover',
      coords: { latitude: 8.9912, longitude: 7.3821 },
      firsthandCount: 0,
      contradictionCount: 2,
      state: 'REFUTED & QUARANTINED',
      ttlMinutes: 15,
    },
    {
      title: 'Rider Contradiction',
      text: 'I passed Flyover Pillar 4 at 6:30 PM. Road is 100% peaceful. Hawkers are selling bread and water normally, vehicles flowing at 40 km/h.',
      type: 'ROAD_OBSTRUCTION' as IncidentType,
      source: 'FIRSTHAND' as ReportSourceType,
      landmark: 'Airport Road Flyover Pillar 4',
      coords: { latitude: 8.9905, longitude: 7.3814 },
      firsthandCount: 2,
      contradictionCount: 1,
      state: 'CONFLICTING OBSERVATIONS',
      ttlMinutes: 35,
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const activePreset = presets[selectedPresetIndex];

  const [sampleText, setSampleText] = useState(activePreset.text);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // User simulated reference coordinates (Lugbe Central Hub)
  const userCoords = { latitude: 8.9806, longitude: 7.3762 };
  const distanceKm = calculateHaversineDistance(userCoords, activePreset.coords);
  const distanceBand = formatDistanceBand(distanceKm, 'Lugbe Commercial Corridor');
  const triageAudit = heuristicTriageAudit(sampleText, activePreset.type, activePreset.landmark);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setSampleText(presets[index].text);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'Why does SignalNG refuse to say a route is safe?',
      answer:
        'Telling someone a route is safe when conditions might have changed in the last ten minutes can put them in danger. SignalNG instead shows what people are actually reporting, how many are firsthand, and whether anyone has contradicted the report. Residents make their own call with that picture in front of them.',
    },
    {
      question: 'How does the 5 km alert radius protect my location?',
      answer:
        'Your exact GPS coordinates are used only to calculate your distance from an incident. They are never stored in public feeds. Other users only see a rounded landmark label or coordinates rounded to two decimal places, which covers roughly a 1 km area.',
    },
    {
      question: 'What is the difference between a Firsthand Witness and Hearsay?',
      answer:
        'A Firsthand Witness is physically at the location right now and reporting what they see directly. Hearsay is a message received from someone else, usually forwarded through a messaging group. Hearsay is logged to track rumor volume but does not count toward corroboration of an incident.',
    },
    {
      question: 'Who can formally confirm an incident?',
      answer:
        'Only designated community anchors can issue a formal confirmation: transport union chairs with a fixed park desk, market wardens, or civic safety coordinators. Because their posts are stationary and known, their observation carries more weight than an anonymous report.',
    },
    {
      question: 'What happens after a report has not been updated in a while?',
      answer:
        'Every report carries a timer of 45 to 90 minutes. If no fresh firsthand sightings arrive before it runs out, the report automatically downgrades to Stale. This stops old warnings from staying visible long after the situation has passed.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
      {/* 1. Clean Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/90 backdrop-blur-sm border-b border-[#E7E5E4] px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/signal.png"
              alt="SignalNG Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#0A0A0A] group-hover:text-[#C7862B] transition-colors">
                SignalNG
              </span>
              <span className="text-[10px] text-[#737373] tracking-wide uppercase font-medium">
                Crisis Triage Engine
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#57534E]">
            <a href="#live-triage" className="hover:text-[#0A0A0A] transition-colors">
              Live Triage
            </a>
            <a href="#architecture" className="hover:text-[#0A0A0A] transition-colors">
              How It Works
            </a>
            <a href="#anchors" className="hover:text-[#0A0A0A] transition-colors">
              Anchors
            </a>
            <a href="#epistemic-stance" className="hover:text-[#0A0A0A] transition-colors">
              Our Approach
            </a>
            <a href="#faq" className="hover:text-[#0A0A0A] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/nearby"
              className="px-3.5 py-1.5 rounded-md bg-[#0A0A0A] text-[#FAFAF9] text-xs font-semibold hover:bg-[#262626] active:scale-[0.98] transition-all min-h-[36px] flex items-center gap-1.5"
            >
              <span>Launch Radar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C7862B]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] leading-[1.12]">
            Hyper-local crisis triage engine.
          </h1>

          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed">
            Filtering community chatter, verifying transit disruptions, and alerting residents within 5 km without rumor panic.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/nearby"
              className="px-5 py-2.5 rounded-md bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-all min-h-[42px] flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#C7862B]" />
              <span>Explore Nearby Feeds</span>
            </Link>

            <Link
              href="/report"
              className="px-5 py-2.5 rounded-md bg-white border border-[#D6D3D1] text-[#0A0A0A] text-xs font-bold hover:bg-[#F5F5F4] transition-colors min-h-[42px] flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#737373]" />
              <span>Submit a Report</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[#737373]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>5 km alert radius</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>No AI truth declarations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>Location privacy</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Triage Console (Clean Minimalist Shadcn Style) */}
      <section id="live-triage" className="max-w-5xl mx-auto px-4 sm:px-8 py-12 border-t border-[#E7E5E4]">
        <div className="mb-6 max-w-xl">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A]">
            Live triage console
          </h2>
          <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
            Test how raw community chatter is checked for specific details, scanned for forwarded copy-paste chains, and placed on a 5 km radius map.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[34px] ${
                selectedPresetIndex === idx
                  ? 'bg-[#0A0A0A] text-[#FAFAF9]'
                  : 'bg-white border border-[#E7E5E4] text-[#171717] hover:bg-[#F5F5F4]'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Clean 2-Column Triage Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Input */}
          <div className="bg-white border border-[#E7E5E4] rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Raw Incident Chatter
              </span>
              <span>Source: {activePreset.source}</span>
            </div>

            <textarea
              rows={4}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-[#D6D3D1] bg-[#FAFAF9] text-[#0A0A0A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F5F5F4]">
              <span className="text-[#737373]">Landmark:</span>
              <span className="font-semibold text-[#0A0A0A] truncate max-w-[220px]">
                {activePreset.landmark}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373]">Calculated Distance:</span>
              <span className="font-semibold text-[#0A0A0A] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C7862B]" />
                <span>{distanceKm.toFixed(1)} km ({distanceBand})</span>
              </span>
            </div>
          </div>

          {/* Right Column: Structured Triage Assessment */}
          <div className="bg-white border border-[#E7E5E4] rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#737373]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                DeepSeek Flash Audit
              </span>
              <span className="font-bold text-[#0A0A0A]">
                Score: {triageAudit.completenessScore}/100
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F5F5F4]">
                <span className="text-[#737373]">Forwarded Chain:</span>
                <span className={triageAudit.duplicateChainDetected ? 'text-[#991B1B] font-bold' : 'text-[#15803D] font-semibold'}>
                  {triageAudit.duplicateChainDetected ? 'Detected (Quarantined)' : 'Clean'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#F5F5F4]">
                <span className="text-[#737373]">Determined State:</span>
                <span className="font-semibold text-[#0A0A0A]">
                  {activePreset.state}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#F5F5F4]">
                <span className="text-[#737373]">Attestations:</span>
                <span className="text-[#0A0A0A]">
                  {activePreset.firsthandCount} firsthand / {activePreset.contradictionCount} contradictions
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#FAFAF9] border border-[#E7E5E4] space-y-1 text-xs">
              <span className="font-semibold text-[#0A0A0A] block text-[11px]">
                Verification Coach Check:
              </span>
              <p className="text-[11px] text-[#57534E] leading-relaxed">
                {triageAudit.suggestedVerificationChecks[0]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Architecture (Clean 4-Point Section) */}
      <section id="architecture" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E7E5E4]">
        <div className="mb-10 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]">
            How verification works
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
            Four decisions that separate SignalNG from generic rumor groups: no heavy mapping libraries, no upvote loops, no chatbots, no AI truth claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#C7862B]">01</span>
            <h3 className="text-sm font-bold text-[#0A0A0A]">Zero GIS Bloat & 5 km Radius Mechanics</h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              No heavy PostGIS spatial dependencies. The backend applies pure mathematical Haversine formulas directly on coordinates for 1.5 km incident clustering and 5 km verified notification perimeters. Private exact coordinates are masked to 2 decimals in public feeds.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#C7862B]">02</span>
            <h3 className="text-sm font-bold text-[#0A0A0A]">DeepSeek Flash Triage Auditor</h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Strictly barred from declaring truth or safety. Constrained to actionable completeness audits, viral copy-paste chain identification, and safe verification coaching without moving civilians toward danger.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#C7862B]">03</span>
            <h3 className="text-sm font-bold text-[#0A0A0A]">Structured Attestation Engine</h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Replaces upvoting with three explicit evidentiary actions: Firsthand Witness, Active Contradiction, and Hearsay Volume Tracking. Stops viral rumors from self-amplifying during anxiety peaks.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#C7862B]">04</span>
            <h3 className="text-sm font-bold text-[#0A0A0A]">4-stage incident timeline</h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Unverified, Corroborated, Confirmed, Stale. Reports expire after 45 to 90 minutes unless fresh firsthand sightings arrive to reaffirm them.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Stationary Anchor Network */}
      <section id="anchors" className="max-w-5xl mx-auto px-4 sm:px-8 py-12 border-t border-[#E7E5E4]">
        <div className="max-w-xl mb-6">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A]">
            Stationary Anchor Network
          </h2>
          <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
            Stationary Anchors are verified community figures with fixed physical posts who provide grounded verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <span className="px-3 py-1.5 rounded bg-white border border-[#E7E5E4] text-xs font-medium text-[#171717]">
            NURTW Airport Road Union Desk
          </span>
          <span className="px-3 py-1.5 rounded bg-white border border-[#E7E5E4] text-xs font-medium text-[#171717]">
            Lugbe Market Wardens Council
          </span>
          <span className="px-3 py-1.5 rounded bg-white border border-[#E7E5E4] text-xs font-medium text-[#171717]">
            Wuse II Commercial Dispatch
          </span>
          <span className="px-3 py-1.5 rounded bg-white border border-[#E7E5E4] text-xs font-medium text-[#171717]">
            Garki Emergency Transit Desk
          </span>
          <span className="px-3 py-1.5 rounded bg-white border border-[#E7E5E4] text-xs font-medium text-[#171717]">
            Lokogoma Community Watch
          </span>
        </div>
      </section>

      {/* 6. Approach manifesto */}
      <section id="epistemic-stance" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E7E5E4]">
        <div className="bg-[#0A0A0A] text-[#FAFAF9] rounded-lg p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C7862B] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Our Approach</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAFAF9]">
            Why we refuse to call anything safe.
          </h2>

          <p className="text-xs sm:text-sm text-[#D6D3D1] leading-relaxed max-w-2xl">
            In tense transit situations, a false "all clear" can send people into danger. No AI can see around a corner or watch a road in real time. SignalNG organizes what community members are actually reporting, tracks how many of those reports are firsthand, highlights disagreements between observers, and only lets designated community anchors issue a formal confirmation.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/nearby"
              className="px-4 py-2 rounded bg-[#FAFAF9] text-[#0A0A0A] text-xs font-bold hover:bg-white transition-colors min-h-[38px] flex items-center gap-1.5"
            >
              <span>Open nearby incidents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/help"
              className="px-4 py-2 rounded border border-[#44403C] text-[#FAFAF9] text-xs font-medium hover:bg-[#171717] transition-colors min-h-[38px] flex items-center gap-1.5"
            >
              <span>How it works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-8 py-16 border-t border-[#E7E5E4]">
        <div className="mb-8 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]">
            Frequently asked questions
          </h2>
          <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
            Common questions on how verification works, who confirms incidents, and how your location is protected.
          </p>
        </div>

        <div className="space-y-2 max-w-3xl">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded border border-[#E7E5E4] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-[#0A0A0A] flex items-center justify-between gap-4 hover:bg-[#FAFAF9] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#737373] shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[#0A0A0A]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 text-xs text-[#57534E] leading-relaxed border-t border-[#F5F5F4]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Clean Editorial Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-8 py-10 text-xs text-[#737373] border-t border-[#E7E5E4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image
            src="/signal.png"
            alt="SignalNG"
            width={20}
            height={20}
            className="object-contain"
          />
          <div>
            <span className="font-semibold text-[#0A0A0A]">SignalNG</span>
            <span className="text-[#737373] ml-2 text-[11px]">
              Hyper-local crisis triage engine.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#57534E]">
          <Link href="/nearby" className="hover:text-[#0A0A0A] font-medium">
            Nearby Feeds
          </Link>
          <Link href="/report" className="hover:text-[#0A0A0A] font-medium">
            Submit Report
          </Link>
          <Link href="/activity" className="hover:text-[#0A0A0A] font-medium">
            Activity Stream
          </Link>
          <Link href="/profile" className="hover:text-[#0A0A0A] font-medium">
            Role Simulator
          </Link>
          <Link href="/help" className="hover:text-[#0A0A0A] font-medium">
            How It Works
          </Link>
        </div>
      </footer>
    </div>
  );
}
