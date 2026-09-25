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
      setSubmitError('Please provide your observational statement.');
      toast.error('Observational statement is required.');
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
            toast.warning('Contradiction attestation recorded', {
              description: `Incident state updated to ${nextState}.`,
            });
          } else if (attestationType === 'FIRSTHAND_WITNESS') {
            toast.success('Firsthand witness statement recorded', {
              description: `Current state: ${nextState}.`,
            });
          } else {
            toast.info('Hearsay telemetry logged', {
              description: 'Tracks rumor volume without inflating corroboration count.',
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
        toast.warning('Contradiction attestation recorded', {
          description: `Incident state recalculated to ${result.updatedIncident.state}.`,
        });
      } else if (attestationType === 'FIRSTHAND_WITNESS') {
        toast.success('Firsthand witness statement recorded', {
          description: `Current state: ${result.updatedIncident.state}.`,
        });
      } else {
        toast.info('Hearsay telemetry logged', {
          description: 'Tracks rumor volume without inflating corroboration count.',
        });
      }

      onAttestationComplete(result.stateChanged);
    } catch {
      setIsSubmitting(false);
      setSubmitError('Failed to record attestation. Please try again.');
      toast.error('Failed to submit attestation.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E7E5E4] rounded-lg p-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-[#0A0A0A] tracking-tight">
            Log Structured Attestation
          </h4>
          <span className="text-[11px] text-[#737373]">No upvotes: Evidentiary only</span>
        </div>
        <p className="text-xs text-[#57534E]">
          Select the option that strictly matches your evidentiary basis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setAttestationType('FIRSTHAND_WITNESS')}
          className={`p-2.5 rounded-md border text-left transition-all min-h-[44px] ${
            attestationType === 'FIRSTHAND_WITNESS'
              ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9]'
              : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Firsthand Witness</span>
          </div>
          <p className="text-[10px] opacity-85 leading-tight">
            I am on the ground and observe this directly.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setAttestationType('ACTIVE_CONTRADICTION')}
          className={`p-2.5 rounded-md border text-left transition-all min-h-[44px] ${
            attestationType === 'ACTIVE_CONTRADICTION'
              ? 'border-[#991B1B] bg-[#991B1B] text-[#FAFAF9]'
              : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Contradiction</span>
          </div>
          <p className="text-[10px] opacity-85 leading-tight">
            I passed this spot recently and conditions are normal.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setAttestationType('HEARSAY_TRACKING')}
          className={`p-2.5 rounded-md border text-left transition-all min-h-[44px] ${
            attestationType === 'HEARSAY_TRACKING'
              ? 'border-[#44403C] bg-[#44403C] text-[#FAFAF9]'
              : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#171717] hover:bg-[#F5F5F4]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Hearsay Tracking</span>
          </div>
          <p className="text-[10px] opacity-85 leading-tight">
            Received via third party or forwarding chain.
          </p>
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#171717] mb-1">
          {attestationType === 'FIRSTHAND_WITNESS'
            ? 'What did you personally observe on scene?'
            : attestationType === 'ACTIVE_CONTRADICTION'
            ? 'What directly contradicts the reported claim?'
            : 'What was stated in the third-party report?'}
        </label>
        <textarea
          rows={3}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder={
            attestationType === 'FIRSTHAND_WITNESS'
              ? 'e.g., I just drove past the junction on my motorcycle. Fire service is on scene, traffic diverted to single lane.'
              : attestationType === 'ACTIVE_CONTRADICTION'
              ? 'e.g., I rode past Flyover Pillar 4 at 6:30 PM. Road is completely clear, shops are open normally, no gathering.'
              : 'e.g., Received message in family WhatsApp group claiming obstruction near bridge.'
          }
          className="w-full text-xs p-2.5 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
        />
      </div>

      {attestationType === 'FIRSTHAND_WITNESS' && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isStillActive"
            checked={isStillActive}
            onChange={(e) => setIsStillActive(e.target.checked)}
            className="w-4 h-4 rounded border-[#D6D3D1] text-[#0A0A0A] focus:ring-[#0A0A0A]"
          />
          <label htmlFor="isStillActive" className="text-xs text-[#292524] cursor-pointer">
            This condition is still active at the time of this submission.
          </label>
        </div>
      )}

      {attestationType === 'ACTIVE_CONTRADICTION' && (
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Specific details differing from report:
          </label>
          <input
            type="text"
            value={contradictionDetails}
            onChange={(e) => setContradictionDetails(e.target.value)}
            placeholder="e.g., Traffic moving freely at 40 km/h, vendors selling normally."
            className="w-full text-xs p-2 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A]"
          />
        </div>
      )}

      {attestationType === 'HEARSAY_TRACKING' && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">
              Source description (WhatsApp group, neighbour, verbal rumor):
            </label>
            <input
              type="text"
              value={hearsaySource}
              onChange={(e) => setHearsaySource(e.target.value)}
              placeholder="e.g., WhatsApp church group forward"
              className="w-full text-xs p-2 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A]"
            />
          </div>
          <div className="p-2.5 rounded bg-[#F5F5F4] border border-[#E7E5E4] text-[11px] text-[#57534E] flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#737373] shrink-0 mt-0.5" />
            <span>
              Hearsay submissions track rumor volume without counting toward independent firsthand corroboration.
            </span>
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-xs text-[#991B1B] font-semibold">{submitError}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F5F5F4]">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded text-xs font-medium text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform min-h-[44px] flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-[#C7862B]" />
          <span>{isSubmitting ? 'Recording...' : 'Submit Attestation'}</span>
        </button>
      </div>
    </form>
  );
}
