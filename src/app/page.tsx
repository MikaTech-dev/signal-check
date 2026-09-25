'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Radio,
  PlusCircle,
  ShieldCheck,
  MapPin,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
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
    <div className="min-h-[100dvh] bg-[#FAFAF9] text-[#0A0A0A] font-sans antialiased selection:bg-[#C7862B]/20 selection:text-[#0A0A0A]">
      {/* Fluid Island Nav */}
      <div className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none">
        <header className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto bg-[#FAFAF9]/80 backdrop-blur-xl border border-black/5 rounded-full px-6 py-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/signal.png"
              alt="SignalNG"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="font-bold text-base tracking-tight group-hover:text-[#C7862B] transition-colors">
              SignalNG
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#57534E]">
            <a href="#live-triage" className="hover:text-[#0A0A0A] transition-colors">Console</a>
            <a href="#architecture" className="hover:text-[#0A0A0A] transition-colors">Architecture</a>
            <a href="#epistemic-stance" className="hover:text-[#0A0A0A] transition-colors">Stance</a>
          </nav>

          <Link
            href="/nearby"
            className="group flex items-center gap-2 rounded-full bg-[#0A0A0A] pl-5 pr-1.5 py-1.5 text-white hover:bg-[#262626] transition-all active:scale-[0.98]"
          >
            <span className="text-sm font-bold">Radar</span>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:scale-105">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </header>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-48 pb-32 flex flex-col justify-center min-h-[100dvh]">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#0A0A0A] leading-[1.05]">
            Hyper-local crisis triage engine.
          </h1>
          
          <p className="text-lg md:text-2xl text-[#57534E] leading-relaxed max-w-2xl">
            Filtering community chatter, verifying transit disruptions, and alerting residents within 5 km without rumor panic.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-6">
            <Link
              href="/nearby"
              className="group inline-flex items-center gap-4 rounded-full bg-[#0A0A0A] pl-8 pr-2.5 py-2.5 text-white hover:bg-[#262626] transition-all active:scale-[0.98]"
            >
              <span className="font-bold text-base md:text-lg">Explore Nearby Feeds</span>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:scale-105">
                <Radio className="w-5 h-5" />
              </div>
            </Link>

            <Link
              href="/report"
              className="group inline-flex items-center gap-3 rounded-full border border-[#D6D3D1] bg-transparent px-8 py-4 text-[#0A0A0A] hover:border-[#0A0A0A] transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-[#737373] group-hover:text-[#0A0A0A] transition-colors" />
              <span className="font-bold text-base md:text-lg">Submit a Report</span>
            </Link>
          </div>

          <div className="pt-12 flex flex-wrap items-center gap-8 text-sm font-semibold text-[#737373]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>5 km alert radius</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>No AI truth declarations</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>Location privacy</span>
            </span>
          </div>
        </div>
      </section>

      {/* Editorial Split: Live Triage Console */}
      <section id="live-triage" className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0A0A0A]">
                Live triage console
              </h2>
              <p className="text-lg text-[#57534E] mt-4 leading-relaxed max-w-sm">
                Test how raw community chatter is checked for specific details, scanned for forwarded chains, and placed on a 5 km radius map.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              {presets.map((preset, idx) => {
                const isActive = selectedPresetIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    className={`block w-full text-left px-6 py-4 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#0A0A0A] text-white shadow-lg scale-100'
                        : 'bg-transparent text-[#737373] hover:bg-black/5 hover:text-[#0A0A0A] scale-95 origin-left'
                    }`}
                  >
                    <span className="font-bold text-lg">{preset.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Double-Bezel Architecture */}
            <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
              <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] space-y-8">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-[#737373] font-semibold border-b border-[#F5F5F4] pb-4">
                    <span className="uppercase tracking-widest text-xs">Raw Chatter</span>
                    <span>Source: {activePreset.source}</span>
                  </div>
                  <textarea
                    rows={4}
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full text-lg p-0 border-none bg-transparent text-[#0A0A0A] focus:outline-none focus:ring-0 leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-[#F5F5F4] font-semibold">
                    <span className="text-[#737373]">Landmark:</span>
                    <span className="text-[#0A0A0A] truncate pl-4">{activePreset.landmark}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 font-semibold">
                    <span className="text-[#737373]">Calculated Distance:</span>
                    <span className="text-[#0A0A0A] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C7862B]" />
                      <span>{distanceKm.toFixed(1)} km ({distanceBand})</span>
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#F5F5F4] space-y-6">
                  <div className="flex items-center justify-between text-sm text-[#737373] font-semibold">
                    <span className="uppercase tracking-widest text-xs">DeepSeek Flash Audit</span>
                    <span className="text-[#0A0A0A]">Score: {triageAudit.completenessScore}/100</span>
                  </div>

                  <div className="space-y-4 text-base font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Forwarded Chain:</span>
                      <span className={triageAudit.duplicateChainDetected ? 'text-[#991B1B]' : 'text-[#15803D]'}>
                        {triageAudit.duplicateChainDetected ? 'Detected (Quarantined)' : 'Clean'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Determined State:</span>
                      <span className="text-[#0A0A0A]">{activePreset.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Attestations:</span>
                      <span className="text-[#0A0A0A]">
                        {activePreset.firsthandCount} firsthand / {activePreset.contradictionCount} refutations
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FAFAF9] space-y-2 border border-[#E7E5E4]">
                    <span className="font-bold text-[#0A0A0A] block text-sm">
                      Verification Coach Check:
                    </span>
                    <p className="text-sm text-[#57534E] leading-relaxed">
                      {triageAudit.suggestedVerificationChecks[0]}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetrical Bento: Architecture */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0A0A0A]">
            How verification works
          </h2>
          <p className="text-lg text-[#57534E] mt-4 leading-relaxed">
            Four decisions that separate SignalNG from generic rumor groups: no heavy mapping libraries, no upvote loops, no chatbots, no AI truth claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6">
          <div className="md:col-span-7 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">01</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Zero GIS Bloat & 5 km Radius Mechanics</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              No heavy PostGIS spatial dependencies. The backend applies pure mathematical Haversine formulas directly on coordinates for 1.5 km incident clustering and 5 km verified notification perimeters. Private exact coordinates are masked to 2 decimals in public feeds.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">02</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">DeepSeek Flash Auditor</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              Strictly barred from declaring truth or safety. Constrained to actionable completeness audits, viral copy-paste chain identification, and safe verification coaching.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">03</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Structured Attestation Engine</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              Replaces upvoting with three explicit evidentiary actions: Firsthand Witness, Active Contradiction, and Hearsay Volume Tracking. Stops viral rumors from self-amplifying.
            </p>
          </div>

          <div className="md:col-span-7 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">04</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">4-stage incident timeline</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              Unverified, Corroborated, Confirmed, Stale. Reports expire after 45 to 90 minutes unless fresh firsthand sightings arrive to reaffirm them, preventing phantom crises from lingering.
            </p>
          </div>
        </div>
      </section>

      {/* Z-Axis / Dark Block: Epistemic Stance */}
      <section id="epistemic-stance" className="px-4 py-8 md:py-24">
        <div className="max-w-7xl mx-auto bg-[#050505] rounded-[3rem] p-10 md:p-24 text-[#FAFAF9] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-sm font-bold uppercase tracking-widest border border-white/5">
              <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
              <span>Our Approach</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.05]">
              Why we refuse to call anything safe.
            </h2>
            
            <p className="text-lg md:text-xl text-[#D6D3D1] leading-relaxed">
              In tense transit situations, a false "all clear" can send people into danger. No AI can see around a corner or watch a road in real time. SignalNG organizes what community members are actually reporting, tracks how many of those reports are firsthand, highlights disagreements, and only lets designated community anchors issue a formal confirmation.
            </p>

            <div className="pt-6">
              <Link
                href="/nearby"
                className="group inline-flex items-center gap-4 rounded-full bg-white pl-8 pr-2.5 py-2.5 text-[#0A0A0A] hover:bg-[#FAFAF9] transition-all active:scale-[0.98]"
              >
                <span className="font-bold text-base">Open nearby incidents</span>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:scale-105">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Subtle glowing mesh in background */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(199,134,43,0.15) 0%, transparent 60%)' }} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 lg:px-12 py-32">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0A0A0A]">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border-b border-[#E7E5E4] overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-8 text-left flex items-center justify-between gap-8 group"
                >
                  <span className="font-bold text-xl md:text-2xl text-[#0A0A0A] group-hover:text-[#C7862B] transition-colors">{faq.question}</span>
                  <div className={`w-10 h-10 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] flex items-center justify-center shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'rotate-180 bg-[#0A0A0A] border-[#0A0A0A] text-white' : 'text-[#0A0A0A]'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'grid-rows-[1fr] pb-8' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-lg text-[#57534E] leading-relaxed max-w-2xl">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-[#E7E5E4] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Image
            src="/signal.png"
            alt="SignalNG"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-bold text-lg tracking-tight text-[#0A0A0A]">SignalNG</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-[#57534E]">
          <Link href="/nearby" className="hover:text-[#0A0A0A] transition-colors">Nearby Feeds</Link>
          <Link href="/report" className="hover:text-[#0A0A0A] transition-colors">Submit Report</Link>
          <Link href="/activity" className="hover:text-[#0A0A0A] transition-colors">Activity Stream</Link>
          <Link href="/profile" className="hover:text-[#0A0A0A] transition-colors">Role Simulator</Link>
        </div>
      </footer>
    </div>
  );
}
