'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Incident } from '@/types';
import { generateBroadcastSummary } from '@/lib/deepseek';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Copy, Check, Share2, X } from 'lucide-react';

interface BroadcastModalProps {
  incident: Incident;
  open?: boolean;
  onClose: () => void;
}

export function BroadcastModal({ incident, open = true, onClose }: BroadcastModalProps) {
  const [copied, setCopied] = useState(false);

  const facts = [
    ...incident.supportingFacts.slice(0, 3),
    ...incident.contradictingFacts.map((c) => `Contradiction: ${c}`),
  ];

  const broadcastText = generateBroadcastSummary(
    incident.title,
    incident.state,
    incident.locationLabel,
    'Last 30 minutes',
    facts
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(broadcastText);
    setCopied(true);
    toast.success('Broadcast template copied to clipboard', {
      description: 'Ready to paste into WhatsApp groups or SMS dispatch.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-full p-0 bg-transparent border-none shadow-none ring-0 overflow-hidden"
      >
        <div className="p-2 rounded-[2.5rem] bg-black/5 border border-black/5 shadow-2xl">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4]">
              <DialogHeader className="flex flex-row items-center gap-2.5 p-0 space-y-0 text-left">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[#C7862B] shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-[#0A0A0A] tracking-tight">
                    Calm Broadcast Template
                  </DialogTitle>
                </div>
              </DialogHeader>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-[#E7E5E4] text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A] flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <DialogDescription className="text-xs text-[#57534E] leading-relaxed">
              Pre-formatted for WhatsApp community groups and local radio desks. Written in calm, factual language to avoid panic amplification.
            </DialogDescription>

            <div className="relative">
              <textarea
                readOnly
                rows={9}
                value={broadcastText}
                className="w-full text-xs font-mono p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-[#171717] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F5F5F4]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#0A0A0A]"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98] flex items-center gap-2 min-h-[44px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#C7862B]" />
                    <span>Copy WhatsApp Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
