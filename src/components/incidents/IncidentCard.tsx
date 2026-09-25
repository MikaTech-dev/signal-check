'use client';

import React from 'react';
import { Incident, IncidentState } from '@/types';
import { calculateHaversineDistance, formatDistanceBand } from '@/lib/haversine';
import { signalStore } from '@/lib/store';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Eye,
  MessageSquareQuote,
  ArrowUpRight,
} from 'lucide-react';

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
  const distanceKm =
    typeof incident.distanceKm === 'number'
      ? incident.distanceKm
      : calculateHaversineDistance(userCoords, incCoords);
  const distanceBand = formatDistanceBand(
    distanceKm,
    incident.approximateArea || incident.locationLabel
  );

  const reportTime = incident.firstReportedAt || incident.createdAt || new Date().toISOString();
  const expireTime = incident.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const timeElapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - new Date(reportTime).getTime()) / (1000 * 60))
  );

  const ttlRemainingMinutes = Math.max(
    0,
    Math.round((new Date(expireTime).getTime() - Date.now()) / (1000 * 60))
  );

  const getStateBadgeStyle = (state: IncidentState) => {
    switch (state) {
      case 'CONFIRMED':
        return {
          bg: 'bg-[#0A0A0A]',
          text: 'text-[#FAFAF9]',
          border: 'border-[#0A0A0A]',
          label: 'ANCHOR VERIFIED',
          icon: CheckCircle2,
        };
      case 'CORROBORATED':
        return {
          bg: 'bg-amber-100/80',
          text: 'text-amber-950',
          border: 'border-amber-300',
          label: 'COMMUNITY REPORT (UNCONFIRMED)',
          icon: AlertCircle,
        };
      case 'CONFLICTING':
        return {
          bg: 'bg-rose-100/80',
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
          label: 'STALE (EXPIRED)',
          icon: Clock,
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-100/80',
          text: 'text-emerald-950',
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
          label: 'UNVERIFIED SIGHTING',
          icon: Eye,
        };
    }
  };

  const badge = getStateBadgeStyle(incident.state);
  const BadgeIcon = badge.icon;

  return (
    <article
      onClick={onClick}
      className="group relative bg-white border border-[#E7E5E4] hover:border-[#0A0A0A] rounded-[2rem] p-6 sm:p-8 cursor-pointer transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B68]">
          <span className="flex items-center gap-1 bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>{distanceBand}</span>
          </span>
          <span className="text-[11px] text-[#A8A29E]">
            {distanceKm.toFixed(1)} km
          </span>
        </div>
      </div>

      {/* Incident Title & Arrow */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-bold text-xl sm:text-2xl text-[#0A0A0A] tracking-tight leading-snug group-hover:text-[#C7862B] transition-colors">
          {incident.title}
        </h3>
        <div className="w-8 h-8 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] flex items-center justify-center shrink-0 group-hover:bg-[#0A0A0A] group-hover:border-[#0A0A0A] group-hover:text-white transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Location */}
      <p className="text-sm text-[#57534E] mb-3 flex items-center gap-1.5 font-medium">
        <span className="text-[#737373]">Location:</span>
        <span className="text-[#0A0A0A]">{incident.locationLabel}</span>
      </p>

      {/* Synthesis Summary (only rendered if text exists) */}
      {incident.synthesisSummary && (
        <p className="text-sm text-[#292524] bg-[#FAFAF9] border border-[#F5F5F4] p-4 rounded-2xl mb-4 leading-relaxed">
          {incident.synthesisSummary}
        </p>
      )}

      {/* Discrepancy Matrix Row */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#737373] pt-4 border-t border-[#F5F5F4] gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-semibold">
          {incident.firsthandCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#0A0A0A] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
              <Eye className="w-3.5 h-3.5 text-[#C7862B]" />
              <span>{incident.firsthandCount} Eyewitness{incident.firsthandCount > 1 ? 'es' : ''}</span>
            </span>
          )}

          {incident.contradictionCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#991B1B] bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{incident.contradictionCount} Road Clear</span>
            </span>
          )}

          {incident.hearsayCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#57534E] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#78716C]" />
              <span>{incident.hearsayCount} Hearsay</span>
            </span>
          )}

          {incident.firsthandCount === 0 && incident.contradictionCount === 0 && incident.hearsayCount === 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#737373] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-1 rounded-lg font-medium">
              <Eye className="w-3.5 h-3.5 text-[#A8A29E]" />
              <span>Awaiting ground observations</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-[#737373]">
          <span>{timeElapsedMinutes}m ago</span>
          {incident.state !== 'RESOLVED' && incident.state !== 'STALE' && (
            <span className="bg-[#F5F5F4] text-[#737373] px-2 py-0.5 rounded-full font-mono">
              expires in {ttlRemainingMinutes}m
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
