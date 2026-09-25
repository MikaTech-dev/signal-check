'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Incident } from '@/types';
import { generateBroadcastSummary } from '@/lib/deepseek';
import { Copy, Check, X, Share2 } from 'lucide-react';

interface BroadcastModalProps {
  incident: Incident;
  onClose: () => void;
}

export function BroadcastModal({ incident, onClose }: BroadcastModalProps) {
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E7E5E4] rounded-lg max-w-lg w-full p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#C7862B]" />
            <h3 className="text-sm font-bold text-[#0A0A0A] tracking-tight">
              Calm Broadcast Notice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#0A0A0A] p-1 rounded hover:bg-[#F5F5F4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#57534E]">
          Pre-formatted for WhatsApp community groups, local SMS gateways, and radio desks. Explicitly avoids panic-inducing words.
        </p>

        <div className="relative">
          <textarea
            readOnly
            rows={10}
            value={broadcastText}
            className="w-full text-xs font-mono p-3 rounded bg-[#FAFAF9] border border-[#E7E5E4] text-[#171717] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F5F5F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded text-xs font-medium text-[#737373] hover:bg-[#F5F5F4]"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] flex items-center gap-1.5 min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C7862B]" />
                <span>Copy WhatsApp Notice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
