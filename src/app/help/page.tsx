'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ShieldCheck, MapPin, Eye, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-16 text-[#0A0A0A]">
      {/* Header */}
      <div className="space-y-2 pt-4 pb-2 border-b border-[#E7E5E4]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#C7862B]" />
          <span>Community Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A]">
          How Verification Works
        </h1>
        <p className="text-sm sm:text-base text-[#57534E]">
          How SignalNG checks incident reports, prevents rumor panic, and alerts residents within 5 km.
        </p>
      </div>

      {/* 1. Why we never declare a route safe */}
      <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
            01 / Safety Principle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight">
            Why we never promise a road is safe
          </h2>
          <p className="text-base text-[#57534E] leading-relaxed">
            Road conditions change in minutes. An obstruction, a fuel spill, or a crowd can form right after someone drives by. If an app tells commuters that a route is safe, people drop their guard and can drive straight into danger.
          </p>
          <p className="text-base text-[#57534E] leading-relaxed">
            SignalNG never makes safety guarantees. Instead, we show you what eyewitnesses are reporting right now, highlight any disagreements, and let you decide what is best for your journey.
          </p>
        </div>
      </div>

      {/* 2. Verification Stages */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
            02 / Verification Stages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight mt-1">
            How reports move from unverified to confirmed
          </h2>
          <p className="text-sm text-[#57534E] mt-1">
            Every post moves through clear stages so you know exactly how reliable an update is.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAFAF9] border border-[#D6D3D1] text-[#0A0A0A]">
              UNVERIFIED
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A]">Single Incident Report</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              A report has just been submitted. It is checked for clear details (landmark and timestamp) and shown on local feeds with a caution note. No broad alerts are sent yet.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
              CORROBORATED
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A]">Two or More Eyewitnesses</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              At least two independent people on the scene confirm the report, with no conflicting accounts. This triggers an alert to residents within 5 km labeled as Community Report.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300">
              CONFLICTING
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A]">Conflicting Eyewitness Accounts</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Sightings disagree. For example, one person reported a blockage while another passed by 10 minutes later and found the road clear. Both reports remain visible side by side.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5E4] space-y-2 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
              CONFIRMED
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A]">Local Anchor Verification</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Formally verified on site by a designated stationary anchor with a known post (such as a transport union chair at a bus park or a market safety warden).
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-xs text-[#57534E] space-y-1">
          <strong className="text-[#0A0A0A] block text-sm">Automatic Expiration:</strong>
          <p className="leading-relaxed">
            Reports carry an automatic expiration window of 45 to 90 minutes. Without fresh eyewitness accounts to confirm the situation is still active, reports degrade to Stale so outdated warnings never clutter your feed.
          </p>
        </div>
      </div>

      {/* 3. Eyewitness confirmations instead of likes */}
      <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-xs">
        <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-8 sm:p-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
            03 / Direct Evidence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight">
            Why eyewitness confirmations replace likes and upvotes
          </h2>
          <p className="text-base text-[#57534E] leading-relaxed">
            During transit disruptions, panic leads people to like or forward warnings they only heard secondhand. That creates false alarms. SignalNG eliminates upvoting and replaces it with three direct actions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-2">
              <span className="font-bold text-sm text-[#0A0A0A] block">Eyewitness on Scene</span>
              <p className="text-xs text-[#57534E] leading-relaxed">
                "I am physically at this location right now and observe this directly."
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-2">
              <span className="font-bold text-sm text-[#991B1B] block">Road is Clear</span>
              <p className="text-xs text-[#57534E] leading-relaxed">
                "I passed this exact spot within the last 15 minutes and conditions are normal."
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-2">
              <span className="font-bold text-sm text-[#57534E] block">Heard from Others</span>
              <p className="text-xs text-[#57534E] leading-relaxed">
                "I received this via a forward or third party." Tracked to measure rumor spread, not to verify.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Privacy & 5 km Perimeter */}
      <div className="p-8 rounded-[2rem] bg-white border border-[#E7E5E4] space-y-4 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C7862B]">
          04 / Location Privacy
        </span>
        <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
          How your location stays private
        </h2>
        <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
          Your exact GPS coordinates are used only to calculate your distance from incidents and deliver 5 km perimeter notifications. They are never published in feeds or visible to other users. Public feeds display only rounded landmark descriptions or broad neighborhood labels.
        </p>
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
