import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RoadStatusType, SourceType, UrgencyLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timeString: string): string {
  if (!timeString) return 'Just now';
  return timeString;
}

export function getStatusTheme(status: RoadStatusType) {
  switch (status) {
    case 'SAFE':
      return {
        badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
        cardBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        label: 'Safe to Travel',
        textColor: 'text-emerald-400',
      };
    case 'CAUTION':
      return {
        badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
        cardBorder: 'border-amber-500/30 hover:border-amber-500/60',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        label: 'Proceed with Caution',
        textColor: 'text-amber-400',
      };
    case 'DANGER':
      return {
        badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
        cardBorder: 'border-rose-500/40 hover:border-rose-500/70',
        dot: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
        label: 'High Risk / Avoid',
        textColor: 'text-rose-400',
      };
    case 'UNKNOWN':
    default:
      return {
        badgeBg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
        cardBorder: 'border-zinc-800 hover:border-zinc-700',
        dot: 'bg-zinc-400',
        label: 'Unconfirmed Status',
        textColor: 'text-zinc-400',
      };
  }
}

export function getSourceBadgeInfo(sourceType: SourceType, isFirsthand: boolean) {
  if (isFirsthand || sourceType === 'FIRSTHAND_OBSERVATION') {
    return {
      label: 'Direct Firsthand Witness',
      classes: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30',
      icon: 'eye',
    };
  }
  if (sourceType === 'COMMUNITY_RADIO') {
    return {
      label: 'Local Radio Broadcast',
      classes: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/30',
      icon: 'radio',
    };
  }
  if (sourceType === 'UNVERIFIED_WHATSAPP') {
    return {
      label: 'WhatsApp Forward (Unverified)',
      classes: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
      icon: 'message',
    };
  }
  return {
    label: 'Hearsay or Rumor',
    classes: 'bg-orange-950/70 text-orange-300 border-orange-500/30',
    icon: 'alert',
  };
}

export function getUrgencyBadgeClasses(urgency: UrgencyLevel) {
  switch (urgency) {
    case 'CRITICAL':
      return 'bg-rose-900/60 text-rose-200 border-rose-600/40';
    case 'HIGH':
      return 'bg-orange-900/60 text-orange-200 border-orange-600/40';
    case 'MEDIUM':
      return 'bg-amber-900/60 text-amber-200 border-amber-600/40';
    case 'LOW':
    default:
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
}
