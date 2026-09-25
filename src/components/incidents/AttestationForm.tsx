'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { AttestationType, Incident } from '@/types';
import { signalStore } from '@/lib/store';
import { attestationsApi } from '@/lib/api';
import { Eye, ShieldAlert, MessageSquareQuote, Check, AlertCircle } from 'lucide-react';

interface AttestationFormProps {
  incident: Incident;
  onAttestationComplete: (stateChanged: boolean) => void;
  onCancel: () => void;
}

export function AttestationForm({
  incident,
  onAttestationComplete,
  onCancel,
}: AttestationFormProps) {
  const [attestationType, setAttestationType] = useState<AttestationType>('FIRSTHAND_WITNESS');
  const [observation, setObservation] = useState('');
  const [observedAt, setObservedAt] = useState('Within last 10 minutes');
  const [locationObserved, setLocationObserved] = useState(incident.locationLabel);
  const [isStillActive, setIsStillActive] = useState(true);
  const [contradictionDetails, setContradictionDetails] = useState('');
  const [hearsaySource, setHearsaySource] = useState('');
  const [isForwardedMessage, setIsForwardedMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) {
      setSubmitError('Please describe what you observed.');
      toast.error('Observation details are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 1. Try server API
      try {
        const apiRes = await attestationsApi.submitAttestation(incident.id, {
          action: attestationType,
          comment: observation.trim(),
          locationLabel: locationObserved,
        });

        if (apiRes.success && apiRes.data) {
          setIsSubmitting(false);
          const nextState = apiRes.data.transition?.nextState || apiRes.data.incident?.state || incident.state;
          const stateChanged = nextState !== incident.state;

          if (attestationType === 'ACTIVE_CONTRADICTION') {
            toast.warning('Road reported clear', {
              description: 'Your clearance report was recorded and visible to neighbors.',
            });
          } else if (attestationType === 'FIRSTHAND_WITNESS') {
            toast.success('Eyewitness confirmation recorded', {
              description: 'Thank you for helping keep your community informed.',
            });
          } else {
            toast.info('Forwarded rumor noted', {
              description: 'Tracked to measure rumor spread without inflating confirmed counts.',
            });
          }

          onAttestationComplete(stateChanged);
          return;
        }
      } catch {
        // Fallback to local store
      }

      // 2. Local fallback
      const result = signalStore.submitAttestation({
        incidentId: incident.id,
        type: attestationType,
        observation: observation.trim(),
        observedAt,
        locationObserved,
        isStillActive: attestationType === 'FIRSTHAND_WITNESS' ? isStillActive : undefined,
        contradictionDetails: attestationType === 'ACTIVE_CONTRADICTION' ? contradictionDetails : undefined,
        hearsaySource: attestationType === 'HEARSAY_TRACKING' ? hearsaySource : undefined,
        isForwardedMessage: attestationType === 'HEARSAY_TRACKING' ? isForwardedMessage : undefined,
      });

      setIsSubmitting(false);

      if (attestationType === 'ACTIVE_CONTRADICTION') {
        toast.warning('Road reported clear', {
          description: 'Your report was added alongside the active warning.',
        });
      } else if (attestationType === 'FIRSTHAND_WITNESS') {
        toast.success('Eyewitness confirmation recorded', {
          description: 'Thank you for helping keep your community informed.',
        });
      } else {
        toast.info('Forwarded rumor noted', {
          description: 'Tracked to measure rumor spread without inflating confirmed counts.',
        });
      }

      onAttestationComplete(result.stateChanged);
    } catch {
      setIsSubmitting(false);
      setSubmitError('Failed to record update. Please try again.');
      toast.error('Failed to submit update.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-bold text-[#0A0A0A] tracking-tight">
            Confirm or Update This Incident
          </h4>
          <span className="text-xs font-semibold text-[#737373]">Ground Check</span>
        </div>
        <p className="text-xs text-[#57534E]">
          Select the option that matches what you directly know.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setAttestationType('FIRSTHAND_WITNESS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            attestationType === 'FIRSTHAND_WITNESS'
              ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
              : 'border-[#E7E5E4] bg-white text-[#171717] hover:border-[#0A0A0A]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
            <Eye className="w-4 h-4" />
            <span>I See This Now</span>
          </div>
          <p className={`text-xs leading-relaxed ${attestationType === 'FIRSTHAND_WITNESS' ? 'text-gray-300' : 'text-[#737373]'}`}>
            I am physically here right now observing this directly.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setAttestationType('ACTIVE_CONTRADICTION')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            attestationType === 'ACTIVE_CONTRADICTION'
              ? 'border-[#991B1B] bg-[#991B1B] text-white shadow-md'
              : 'border-[#E7E5E4] bg-white text-[#171717] hover:border-[#0A0A0A]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Road is Clear</span>
          </div>
          <p className={`text-xs leading-relaxed ${attestationType === 'ACTIVE_CONTRADICTION' ? 'text-rose-200' : 'text-[#737373]'}`}>
            I passed this spot recently and conditions are normal.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setAttestationType('HEARSAY_TRACKING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            attestationType === 'HEARSAY_TRACKING'
              ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md'
              : 'border-[#E7E5E4] bg-white text-[#171717] hover:border-[#0A0A0A]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Heard from Others</span>
          </div>
          <p className={`text-xs leading-relaxed ${attestationType === 'HEARSAY_TRACKING' ? 'text-gray-300' : 'text-[#737373]'}`}>
            Received via a group chat forward or neighborhood rumor.
          </p>
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
          {attestationType === 'FIRSTHAND_WITNESS'
            ? 'What did you observe on scene?'
            : attestationType === 'ACTIVE_CONTRADICTION'
            ? 'What did you observe showing conditions are normal?'
            : 'What did the forward or message state?'}
        </label>
        <textarea
          rows={3}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder={
            attestationType === 'FIRSTHAND_WITNESS'
              ? 'e.g., I just drove past the junction on my bike. Wardens waving cars to the left lane.'
              : attestationType === 'ACTIVE_CONTRADICTION'
              ? 'e.g., I rode past Flyover Pillar 4 at 6:30 PM. Road is completely clear, vendors selling normally.'
              : 'e.g., Received message in family WhatsApp group claiming road block near bridge.'
          }
          className="w-full text-sm p-4 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] resize-none leading-relaxed"
        />
      </div>

      {attestationType === 'FIRSTHAND_WITNESS' && (
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="isStillActive"
            checked={isStillActive}
            onChange={(e) => setIsStillActive(e.target.checked)}
            className="w-4 h-4 rounded border-[#D6D3D1] text-[#0A0A0A]"
          />
          <label htmlFor="isStillActive" className="text-xs font-medium text-[#292524] cursor-pointer">
            This condition is still active at the time of this submission.
          </label>
        </div>
      )}

      {attestationType === 'ACTIVE_CONTRADICTION' && (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
            Specific details differing from report:
          </label>
          <input
            type="text"
            value={contradictionDetails}
            onChange={(e) => setContradictionDetails(e.target.value)}
            placeholder="e.g., Traffic moving freely at 40 km/h, shops open."
            className="w-full text-sm p-3.5 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
          />
        </div>
      )}

      {attestationType === 'HEARSAY_TRACKING' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
              Source description (WhatsApp group, neighbour, verbal message):
            </label>
            <input
              type="text"
              value={hearsaySource}
              onChange={(e) => setHearsaySource(e.target.value)}
              placeholder="e.g., WhatsApp community group forward"
              className="w-full text-sm p-3.5 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E7E5E4] text-xs text-[#57534E] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
            <span>
              Forwarded messages help track rumor volume without being counted as confirmed eyewitness reports.
            </span>
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-xs text-[#991B1B] font-semibold">{submitError}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E4]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#0A0A0A]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform min-h-[44px] flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#C7862B]" />
          <span>{isSubmitting ? 'Recording...' : 'Submit Ground Update'}</span>
        </button>
      </div>
    </form>
  );
}
