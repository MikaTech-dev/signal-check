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
  AlertTriangle,
} from 'lucide-react';
import { heuristicTriageAudit } from '@/lib/deepseek';
import { calculateHaversineDistance, formatDistanceBand } from '@/lib/haversine';
import { IncidentType, ReportSourceType } from '@/types';

export default function LandingPage() {
  const presets = [
    {
      title: 'Fuel Tanker Spill (Eyewitness)',
      text: 'Just drove past Lugbe Market Northbound exit at 6:32 PM on my bike. Fuel tanker broke down spilling diesel across right lane. Market wardens are waving vehicles left.',
      type: 'HAZARD_SPILL' as IncidentType,
      source: 'FIRSTHAND' as ReportSourceType,
      landmark: 'Lugbe Market Northbound Exit',
      coords: { latitude: 8.9845, longitude: 7.3789 },
      firsthandCount: 3,
      contradictionCount: 0,
      state: 'Corroborated by eyewitnesses',
      ttlMinutes: 48,
    },
    {
      title: 'WhatsApp Rumor Chain',
      text: 'FORWARDED AS RECEIVED: URGENT TO ALL LUGBE PARENTS!! Bad boys are gathering with weapons near Eastern flyover! Stay inside everyone panic!!',
      type: 'ROAD_OBSTRUCTION' as IncidentType,
      source: 'HEARSAY' as ReportSourceType,
      landmark: 'Airport Road Eastern Flyover',
      coords: { latitude: 8.9912, longitude: 7.3821 },
      firsthandCount: 0,
      contradictionCount: 2,
      state: 'Flagged as forwarded rumor',
      ttlMinutes: 15,
    },
    {
      title: 'Rider Clearance Report',
      text: 'I passed Flyover Pillar 4 at 6:30 PM. Road is completely clear. Hawkers are selling bread and water normally, vehicles flowing at 40 km/h.',
      type: 'ROAD_OBSTRUCTION' as IncidentType,
      source: 'FIRSTHAND' as ReportSourceType,
      landmark: 'Airport Road Flyover Pillar 4',
      coords: { latitude: 8.9905, longitude: 7.3814 },
      firsthandCount: 2,
      contradictionCount: 1,
      state: 'Conflicting sightings reported',
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
      question: 'What is the difference between an Eyewitness and Hearsay?',
      answer:
        'An Eyewitness is physically at the location right now and reporting what they see directly. Hearsay is a message received from someone else, usually forwarded through a messaging group. Hearsay is logged to track rumor volume but does not count toward corroboration of an incident.',
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
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-20 pb-28 flex flex-col justify-center min-h-[calc(100dvh-120px)]">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-[#0A0A0A] leading-[1.05]">
            Real-time road and community safety alerts.
          </h1>
          
          <p className="text-lg md:text-2xl text-[#57534E] leading-relaxed max-w-2xl">
            Verify road hazards, transit disruptions, and neighborhood incidents within 5 km of where you are. Real eyewitness sightings, zero panic forwards.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-6">
            <Link
              href="/nearby"
              className="group inline-flex items-center gap-4 rounded-full bg-[#0A0A0A] pl-8 pr-2.5 py-2.5 text-white hover:bg-[#262626] transition-all active:scale-[0.98]"
            >
              <span className="font-bold text-base md:text-lg">View Nearby Incidents</span>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:scale-105">
                <Radio className="w-5 h-5" />
              </div>
            </Link>

            <Link
              href="/report"
              className="group inline-flex items-center gap-3 rounded-full border border-[#D6D3D1] bg-transparent px-8 py-4 text-[#0A0A0A] hover:border-[#0A0A0A] transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 text-[#737373] group-hover:text-[#0A0A0A] transition-colors" />
              <span className="font-bold text-base md:text-lg">Report an Incident</span>
            </Link>
          </div>

          <div className="pt-12 flex flex-wrap items-center gap-8 text-sm font-semibold text-[#737373]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>5 km alert radius</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>Direct eyewitness confirmations</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
              <span>Location privacy protected</span>
            </span>
          </div>
        </div>
      </section>

      {/* Live Preview: How Reports Get Checked */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-12 py-32 border-t border-[#E7E5E4]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
                Interactive Preview
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0A0A0A] mt-2">
                See how incident reports get verified
              </h2>
              <p className="text-lg text-[#57534E] mt-4 leading-relaxed max-w-sm">
                Watch how incoming messages are checked for concrete details, separated from forwarded rumor chains, and verified by people on the scene.
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
            {/* Double-Bezel Card */}
            <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5">
              <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 md:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] space-y-8">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-[#737373] font-semibold border-b border-[#F5F5F4] pb-4">
                    <span className="uppercase tracking-widest text-xs">Submitted Message</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] text-xs text-[#0A0A0A]">
                      {activePreset.source === 'FIRSTHAND' ? 'Eyewitness Report' : 'Forwarded Message'}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full text-lg p-0 border-none bg-transparent text-[#0A0A0A] focus:outline-none focus:ring-0 leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-[#F5F5F4] font-semibold">
                    <span className="text-[#737373]">Nearest Landmark:</span>
                    <span className="text-[#0A0A0A] truncate pl-4">{activePreset.landmark}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 font-semibold">
                    <span className="text-[#737373]">Distance from You:</span>
                    <span className="text-[#0A0A0A] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C7862B]" />
                      <span>{distanceKm.toFixed(1)} km ({distanceBand})</span>
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#F5F5F4] space-y-6">
                  <div className="flex items-center justify-between text-sm text-[#737373] font-semibold">
                    <span className="uppercase tracking-widest text-xs">Automated Detail Check</span>
                    <span className="text-[#0A0A0A] font-bold">
                      {triageAudit.completenessScore >= 70 ? 'High Detail' : 'Needs More Detail'}
                    </span>
                  </div>

                  <div className="space-y-4 text-base font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Forwarded Chain:</span>
                      <span className={triageAudit.duplicateChainDetected ? 'text-[#991B1B]' : 'text-[#15803D]'}>
                        {triageAudit.duplicateChainDetected ? 'Flagged as forwarded rumor' : 'Clean direct account'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Current Status:</span>
                      <span className="text-[#0A0A0A]">{activePreset.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Eyewitness Accounts:</span>
                      <span className="text-[#0A0A0A]">
                        {activePreset.firsthandCount} confirmed on scene / {activePreset.contradictionCount} road clear reports
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FAFAF9] space-y-2 border border-[#E7E5E4]">
                    <span className="font-bold text-[#0A0A0A] block text-sm">
                      Recommended Verification Check:
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

      {/* 4 Pillars Section */}
      <section id="verification" className="max-w-7xl mx-auto px-6 lg:px-12 py-32 border-t border-[#E7E5E4]">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
            Our Standards
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0A0A0A] mt-2">
            How SignalNG keeps updates accurate
          </h2>
          <p className="text-lg text-[#57534E] mt-4 leading-relaxed">
            Four clear principles that protect residents from panic, false alarms, and unverified viral messages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6">
          <div className="md:col-span-7 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">01</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Hyper-local 5 km alerts</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              No irrelevant city-wide notifications. You only receive alerts for incidents within 5 km of where you are. Your exact coordinates stay private and are never shared in public feeds.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">02</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Detail checks on every post</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              Every submission must include clear landmarks and times. Vague warnings and copy-pasted panic forwards are caught before they spread.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">03</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Eyewitness confirmations instead of likes</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              People on the scene confirm what is actually happening. If someone drives past and sees normal traffic, their report is shown side by side.
            </p>
          </div>

          <div className="md:col-span-7 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[2rem] p-10 md:p-14 space-y-4">
            <span className="text-sm font-bold tracking-widest uppercase text-[#C7862B]">04</span>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">Automatic expiration</h3>
            <p className="text-base text-[#57534E] leading-relaxed">
              Reports expire after 45 to 90 minutes unless someone on the ground confirms the issue is still active, so old warnings never linger on your radar.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Principle Section */}
      <section id="our-standard" className="px-4 py-8 md:py-24">
        <div className="max-w-7xl mx-auto bg-[#050505] rounded-[3rem] p-10 md:p-24 text-[#FAFAF9] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8 max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-sm font-bold uppercase tracking-widest border border-white/5">
              <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
              <span>Our Safety Principle</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.05]">
              Why we never promise a road is safe.
            </h2>
            
            <p className="text-lg md:text-xl text-[#D6D3D1] leading-relaxed">
              In tense transit situations, a false 'all clear' can send commuters directly into danger. Road conditions change quickly. SignalNG does not guess or declare areas safe. We show what people on the ground are seeing right now, point out conflicting reports, and let you make an informed decision for your journey.
            </p>

            <div className="pt-6">
              <Link
                href="/nearby"
                className="group inline-flex items-center gap-4 rounded-full bg-white pl-8 pr-2.5 py-2.5 text-[#0A0A0A] hover:bg-[#FAFAF9] transition-all active:scale-[0.98]"
              >
                <span className="font-bold text-base">Open nearby radar</span>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:scale-105">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
          
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
          <Link href="/nearby" className="hover:text-[#0A0A0A] transition-colors">Nearby Radar</Link>
          <Link href="/report" className="hover:text-[#0A0A0A] transition-colors">Submit Report</Link>
          <Link href="/activity" className="hover:text-[#0A0A0A] transition-colors">Activity Stream</Link>
          <Link href="/help" className="hover:text-[#0A0A0A] transition-colors">Verification Guide</Link>
          <Link href="/profile" className="hover:text-[#0A0A0A] transition-colors">Account Profile</Link>
        </div>
      </footer>
    </div>
  );
}
