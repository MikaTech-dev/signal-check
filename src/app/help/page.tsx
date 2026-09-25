'use client';

import React from 'react';

export default function HelpPage() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto text-[#0A0A0A]">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-[#0A0A0A] tracking-tight mb-1">
          How verification works
        </h1>
        <p className="text-xs text-[#57534E]">
          How SignalNG handles community uncertainty, structured attestations, and 5 km radius alerts.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          1. Why no AI declares a route safe
        </h3>
        <p className="text-xs text-[#57534E] leading-relaxed">
          SignalNG refuses to tell you a route is safe because ground conditions can shift in minutes. Instead, the platform organizes incoming reports, tracks how many sources are firsthand, flags active contradictions, and alerts residents within 5 km with clear uncertainty labels.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          2. Incident status glossary
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded bg-[#FAFAF9] border border-[#F5F5F4]">
            <span className="font-bold text-[#0A0A0A] block mb-0.5">UNVERIFIED</span>
            <span className="text-[#57534E]">
              Single report submitted. Checked for completeness and shown in local feeds only. No broad alert sent.
            </span>
          </div>

          <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200">
            <span className="font-bold text-amber-950 block mb-0.5">CORROBORATED</span>
            <span className="text-amber-900">
              Two or more independent firsthand sightings with no active contradictions. Triggers a 5 km alert labeled "Community Report (Unconfirmed)."
            </span>
          </div>

          <div className="p-2.5 rounded bg-rose-50/60 border border-rose-200">
            <span className="font-bold text-rose-950 block mb-0.5">CONFLICTING</span>
            <span className="text-rose-900">
              Firsthand sightings and active contradictions disagree. Both sides remain visible in the incident timeline.
            </span>
          </div>

          <div className="p-2.5 rounded bg-stone-100 border border-stone-300">
            <span className="font-bold text-stone-900 block mb-0.5">CONFIRMED</span>
            <span className="text-stone-800">
              Formally verified on site by a designated stationary anchor: a transport union chair, market warden, or community coordinator with a fixed physical post.
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#FAFAF9] border border-[#E7E5E4]">
            <span className="font-bold text-[#737373] block mb-0.5">STALE</span>
            <span className="text-[#737373]">
              Reports expire after 45 to 90 minutes. If no fresh firsthand sightings arrive before the timer runs out, the status downgrades to Stale to prevent old alerts from lingering.
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          3. Why structured attestations replace voting
        </h3>
        <p className="text-xs text-[#57534E] leading-relaxed">
          During transit disruptions, panic causes people to upvote rumors they only heard secondhand. SignalNG replaces voting with three explicit actions:
        </p>
        <ul className="text-xs text-[#57534E] space-y-1 pl-4 list-disc">
          <li><strong>Firsthand witness:</strong> You are at the location right now and observing conditions directly.</li>
          <li><strong>Active contradiction:</strong> You passed the exact spot recently and conditions were normal.</li>
          <li><strong>Hearsay log:</strong> You received this via a forwarding chain. Logged but not counted as firsthand corroboration.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
          4. Location privacy
        </h3>
        <p className="text-xs text-[#57534E] leading-relaxed">
          Your exact GPS coordinates are never shown in public feeds. The system uses them internally to calculate distance and cluster nearby incidents, then rounds the coordinates to two decimal places (roughly 1 km area) before sharing them with other users.
        </p>
      </div>
    </div>
  );
}
