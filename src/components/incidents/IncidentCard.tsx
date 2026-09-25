'use client';

import React from 'react';
import { Incident, IncidentState } from '@/types';
import { calculateHaversineDistance, formatDistanceBand } from '@/lib/haversine';
import { signalStore } from '@/lib/store';
import { AlertCircle, CheckCircle2, Clock, MapPin, ShieldAlert, Eye, MessageSquareQuote } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
}

export function IncidentCard({ incident, onClick }: IncidentCardProps) {
  const userCoords = signalStore.getUserCoordinates();
  const incCoords = incident.coordinates || {
    latitude: incident.latitude || 0,
    longitude: incident.longitude || 0,
  };
  const distanceKm = typeof incident.distanceKm === 'number'
    ? incident.distanceKm
    : calculateHaversineDistance(userCoords, incCoords);
  const distanceBand = formatDistanceBand(distanceKm, incident.approximateArea || incident.locationLabel);

  const reportTime = incident.firstReportedAt || incident.createdAt || new Date().toISOString();
  const expireTime = incident.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Time elapsed calculation
  const timeElapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - new Date(reportTime).getTime()) / (1000 * 60))
  );

  // TTL decay time remaining
  const ttlRemainingMinutes = Math.max(
    0,
    Math.round((new Date(expireTime).getTime() - Date.now()) / (1000 * 60))
  );

  const getStateBadgeStyle = (state: IncidentState) => {
    switch (state) {
      case 'CONFIRMED':
        return {
          bg: 'bg-[#171717]',
          text: 'text-[#FAFAF9]',
          border: 'border-[#0A0A0A]',
          label: 'VERIFIED BY ANCHOR',
          icon: CheckCircle2,
        };
      case 'CORROBORATED':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-950',
          border: 'border-amber-300',
          label: 'COMMUNITY REPORT (UNCONFIRMED)',
          icon: AlertCircle,
        };
      case 'CONFLICTING':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-950',
          border: 'border-rose-300',
          label: 'CONFLICTING OBSERVATIONS',
          icon: ShieldAlert,
        };
      case 'STALE':
        return {
          bg: 'bg-stone-100',
          text: 'text-stone-700',
          border: 'border-stone-300',
          label: 'STALE (AWAITING UPDATE)',
          icon: Clock,
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-900',
          border: 'border-emerald-300',
          label: 'RESOLVED',
          icon: CheckCircle2,
        };
      case 'UNVERIFIED':
      default:
        return {
          bg: 'bg-[#F5F5F4]',
          text: 'text-[#44403C]',
          border: 'border-[#D6D3D1]',
          label: 'UNVERIFIED OBSERVATION',
          icon: Eye,
        };
    }
  };

  const badge = getStateBadgeStyle(incident.state);
  const BadgeIcon = badge.icon;

  return (
    <article
      onClick={onClick}
      className="bg-white border border-[#E7E5E4] hover:border-[#A8A29E] rounded-lg p-4 cursor-pointer transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Top Badge & Distance Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <BadgeIcon className="w-3 h-3" />
          <span>{badge.label}</span>
        </div>

        <div className="text-[11px] font-semibold text-[#6B6B68] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#C7862B]" />
          <span>{distanceBand}</span>
        </div>
      </div>

      {/* Incident Title */}
      <h3 className="font-bold text-base text-[#0A0A0A] tracking-tight leading-snug mb-1.5">
        {incident.title}
      </h3>

      {/* Location Label */}
      <p className="text-xs text-[#57534E] mb-3 flex items-center gap-1">
        <span>Location:</span>
        <span className="font-medium text-[#1C1917]">{incident.locationLabel}</span>
      </p>

      {/* Synthesis or Latest Ground Fact */}
      <p className="text-xs text-[#292524] bg-[#FAFAF9] border border-[#F5F5F4] p-2.5 rounded mb-3 leading-relaxed">
        {incident.synthesisSummary}
      </p>

      {/* Footer Metrics Row */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#737373] pt-2.5 border-t border-[#F5F5F4] gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#1C1917] font-semibold">
            <Eye className="w-3.5 h-3.5 text-[#0A0A0A]" />
            {incident.firsthandCount} Firsthand
          </span>

          {incident.contradictionCount > 0 && (
            <span className="flex items-center gap-1 text-[#991B1B] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              {incident.contradictionCount} Contradiction
            </span>
          )}

          {incident.hearsayCount > 0 && (
            <span className="flex items-center gap-1 text-[#78716C]">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              {incident.hearsayCount} Hearsay
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Reported {timeElapsedMinutes}m ago</span>
          {incident.state !== 'RESOLVED' && incident.state !== 'STALE' && (
            <span className="text-[10px] text-[#78716C] bg-[#F5F5F4] px-1.5 py-0.5 rounded">
              expires in {ttlRemainingMinutes}m
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
