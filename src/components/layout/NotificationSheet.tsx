'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { NotificationItem } from '@/types';
import { signalStore } from '@/lib/store';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  X,
} from 'lucide-react';

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationItem[];
  onSelectNotification?: (incidentId: string) => void;
}

export function NotificationSheet({
  open,
  onOpenChange,
  notifications,
  onSelectNotification,
}: NotificationSheetProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) signalStore.markNotificationAsRead(n.id);
    });
  };

  const handleItemClick = (n: NotificationItem) => {
    signalStore.markNotificationAsRead(n.id);
    onOpenChange(false);
    if (onSelectNotification) {
      onSelectNotification(n.incidentId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md bg-[#FAFAF9] border-l border-[#E7E5E4] p-0 flex flex-col text-[#0A0A0A] shadow-2xl z-50"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E7E5E4] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#C7862B]" />
              </div>
              <SheetTitle className="text-lg font-bold tracking-tight text-[#0A0A0A]">
                Perimeter Alerts
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#991B1B] text-white">
                  {unreadCount} new
                </span>
              )}
              <SheetClose className="w-8 h-8 rounded-full border border-[#E7E5E4] flex items-center justify-center hover:bg-[#FAFAF9] text-[#737373] hover:text-[#0A0A0A] transition-colors">
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#57534E]">
            <SheetDescription className="text-xs text-[#57534E]">
              Corroborated transit and safety alerts within 5 km
            </SheetDescription>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#0A0A0A] hover:text-[#C7862B] flex items-center gap-1 transition-colors shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#0A0A0A]">All Clear in Perimeter</h4>
              <p className="text-xs text-[#737373] max-w-xs leading-relaxed">
                No active corroborated alerts within your 5 km corridor radius.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <article
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-xs ${
                  n.read
                    ? 'bg-white border-[#E7E5E4] hover:border-[#0A0A0A]'
                    : 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#C7862B] shrink-0" />
                    )}
                    <span className="font-bold text-sm text-[#0A0A0A] tracking-tight group-hover:text-[#C7862B] transition-colors">
                      {n.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E7E5E4] text-[#57534E] shrink-0">
                    {n.distanceBand}
                  </span>
                </div>

                <p className="text-xs text-[#44403C] leading-relaxed mb-3">
                  {n.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#737373] pt-2 border-t border-black/5">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-[#C7862B] shrink-0" />
                    <span className="truncate">{n.locationLabel}</span>
                  </span>
                  <span className="font-bold text-[#0A0A0A] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-[#C7862B]" />
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E5E4] bg-white text-center">
          <Link
            href="/nearby"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
          >
            <Radio className="w-3.5 h-3.5 text-[#C7862B]" />
            <span>Open Full Radar Feed</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
