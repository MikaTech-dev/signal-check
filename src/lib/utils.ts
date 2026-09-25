import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IncidentState, IncidentType, ReportSourceType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timeString: string): string {
  if (!timeString) return 'Just now';
  try {
    const date = new Date(timeString);
    const diffMins = Math.round((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours}h ago`;
  } catch {
    return timeString;
  }
}

export function getStateBadgeTheme(state: IncidentState) {
  switch (state) {
    case 'CONFIRMED':
      return {
        badgeBg: 'bg-[#171717] border-[#0A0A0A] text-[#FAFAF9]',
        label: 'VERIFIED BY ANCHOR',
        textColor: 'text-[#171717]',
      };
    case 'CORROBORATED':
      return {
        badgeBg: 'bg-amber-100 border-amber-300 text-amber-950',
        label: 'COMMUNITY REPORT (UNCONFIRMED)',
        textColor: 'text-amber-900',
      };
    case 'CONFLICTING':
      return {
        badgeBg: 'bg-rose-100 border-rose-300 text-rose-950',
        label: 'CONFLICTING OBSERVATIONS',
        textColor: 'text-rose-900',
      };
    case 'STALE':
      return {
        badgeBg: 'bg-stone-100 border-stone-300 text-stone-700',
        label: 'STALE (AWAITING REAFFIRMATION)',
        textColor: 'text-stone-700',
      };
    case 'RESOLVED':
      return {
        badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-950',
        label: 'RESOLVED',
        textColor: 'text-emerald-900',
      };
    case 'UNVERIFIED':
    default:
      return {
        badgeBg: 'bg-[#F5F5F4] border-[#D6D3D1] text-[#44403C]',
        label: 'UNVERIFIED OBSERVATION',
        textColor: 'text-[#44403C]',
      };
  }
}
