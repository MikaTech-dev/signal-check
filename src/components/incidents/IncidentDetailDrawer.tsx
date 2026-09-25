'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Incident } from '@/types';
import { calculateHaversineDistance, formatDistanceBand, maskCoordinates } from '@/lib/haversine';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { AttestationForm } from './AttestationForm';
import { BroadcastModal } from './BroadcastModal';
import {
  X,
  MapPin,
  Clock,
  Eye,
  ShieldAlert,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Plus,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident;
  onClose: () => void;
  onUpdate: () => void;
}

export function IncidentDetailDrawer({
  incident,
  onClose,
  onUpdate,
}: IncidentDetailDrawerProps) {
  const [showAttestationForm, setShowAttestationForm] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAnchorConfirmDialog, setShowAnchorConfirmDialog] = useState(false);
  const [anchorNotes, setAnchorNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveReason, setResolveReason] = useState('');

  const currentUser = signalStore.getCurrentUser();
  const userCoords = signalStore.getUserCoordinates();
  const incCoords = incident.coordinates || {
    latitude: incident.latitude || 0,
    longitude: incident.longitude || 0,
  };
  const distanceKm = typeof incident.distanceKm === 'number'
    ? incident.distanceKm
    : calculateHaversineDistance(userCoords, incCoords);
  const distanceBand = formatDistanceBand(distanceKm, incident.approximateArea || incident.locationLabel);
  const maskedCoords = maskCoordinates(incCoords);

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

  const handleAttestationComplete = () => {
    setShowAttestationForm(false);
    onUpdate();
  };

  const handleAnchorConfirm = async () => {
    if (!anchorNotes.trim()) {
      toast.error('Please enter on-site verification notes.');
      return;
    }

    try {
      await incidentsApi.confirm(incident.id, anchorNotes.trim());
    } catch {
      // Local store fallback
    }

    signalStore.confirmIncidentAsAnchor(incident.id, anchorNotes.trim());
    setShowAnchorConfirmDialog(false);
    toast.success('Incident formally confirmed by anchor', {
      description: '5 km perimeter alert broadcast triggered.',
    });
    onUpdate();
  };

  const handleResolve = async () => {
    if (!resolveReason.trim()) {
      toast.error('Please state the resolution reason.');
      return;
    }

    try {
      await incidentsApi.resolve(incident.id, resolveReason.trim());
    } catch {
      // Local store fallback
    }

    signalStore.resolveIncident(incident.id, resolveReason.trim());
    setShowResolveDialog(false);
    toast.success('Incident marked resolved', {
      description: 'Incident archived from active crisis perimeter.',
    });
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E7E5E4] rounded-t-xl sm:rounded-xl max-w-2xl w-full max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0A0A0A] text-[#FAFAF9]">
              {incident.incidentType.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-semibold text-[#737373]">{distanceBand}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4] min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-[#0A0A0A]">
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Heads up:</strong> These are community reports. They do not confirm the incident is real or any route safe.
            </p>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A] leading-snug mb-2">
              {incident.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C7862B]" />
                <span className="font-semibold text-[#171717]">{incident.locationLabel}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Reported {timeElapsedMinutes} mins ago</span>
              </span>
              <span className="text-[11px] text-[#78716C] bg-[#F5F5F4] px-2 py-0.5 rounded">
                Masked Coords: {maskedCoords.latitude.toFixed(2)}, {maskedCoords.longitude.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                Verification State
              </span>
              <span className="text-xs font-mono font-bold text-[#0A0A0A] px-2 py-0.5 rounded bg-white border border-[#D6D3D1]">
                {incident.state}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1 text-[#0A0A0A] font-bold text-sm">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{incident.firsthandCount}</span>
                </div>
                <div className="text-[10px] text-[#737373] mt-0.5">Firsthand Sightings</div>
              </div>

              <div className="p-2 rounded bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1 text-[#991B1B] font-bold text-sm">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{incident.contradictionCount}</span>
                </div>
                <div className="text-[10px] text-[#737373] mt-0.5">Contradictions</div>
              </div>

              <div className="p-2 rounded bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1 text-[#57534E] font-bold text-sm">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  <span>{incident.hearsayCount}</span>
                </div>
                <div className="text-[10px] text-[#737373] mt-0.5">Hearsay Volume</div>
              </div>
            </div>

            {incident.confirmedByAnchor && (
              <div className="mt-2 p-2.5 rounded bg-white border border-[#171717] text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#0A0A0A] mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
                  <span>Confirmed by Anchor: {incident.confirmedByAnchor.anchorName}</span>
                </div>
                <p className="text-[11px] text-[#44403C]">
                  {incident.confirmedByAnchor.anchorTitle} &bull; {incident.confirmedByAnchor.notes}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Ground reports
            </h3>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#171717] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                <span>Supporting Observations ({incident.supportingFacts.length})</span>
              </div>
              {incident.supportingFacts.length === 0 ? (
                <p className="text-xs text-[#737373] italic pl-3">No supporting statements logged yet.</p>
              ) : (
                <div className="space-y-1 pl-3">
                  {incident.supportingFacts.map((fact, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#FAFAF9] border border-[#F5F5F4] text-xs leading-relaxed">
                      {fact}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {incident.contradictingFacts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-semibold text-[#991B1B] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                  <span>Active Contradictions ({incident.contradictingFacts.length})</span>
                </div>
                <div className="space-y-1 pl-3">
                  {incident.contradictingFacts.map((fact, idx) => (
                    <div key={idx} className="p-2 rounded bg-rose-50/50 border border-rose-200 text-xs text-rose-950 leading-relaxed">
                      {fact}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {incident.missingDetails.length > 0 && (
            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
              <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#C7862B]" />
                <span>Critical Missing Information Needed:</span>
              </h4>
              <ul className="text-xs text-[#57534E] space-y-1 pl-4 list-disc">
                {incident.missingDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-[#0A0A0A] text-[#FAFAF9] space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C7862B]" />
              <h4 className="text-xs font-bold tracking-tight text-[#FAFAF9]">
                How to verify this safely
              </h4>
            </div>
            <p className="text-[11px] text-[#A8A29E] leading-relaxed">
              Low-risk checks. Do not travel toward unconfirmed locations.
            </p>
            <div className="space-y-1.5 pt-1">
              {incident.suggestedVerificationChecks.map((check, idx) => (
                <div key={idx} className="text-xs text-[#E7E5E4] flex items-start gap-2 bg-[#171717] p-2 rounded">
                  <span className="text-[#C7862B] font-bold">{idx + 1}.</span>
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {showAttestationForm ? (
            <AttestationForm
              incident={incident}
              onAttestationComplete={handleAttestationComplete}
              onCancel={() => setShowAttestationForm(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setShowAttestationForm(true)}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C7862B]" />
                <span>Add attestation</span>
              </button>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-4 py-2.5 min-h-[44px] rounded border border-[#D6D3D1] bg-white text-[#171717] text-xs font-semibold hover:bg-[#F5F5F4] flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-[#737373]" />
                <span>Broadcast Notice</span>
              </button>
            </div>
          )}

          {(currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR' || currentUser.role === 'ADMIN') && incident.state !== 'CONFIRMED' && incident.state !== 'RESOLVED' && (
            <div className="p-3.5 rounded-lg border border-[#0A0A0A] bg-amber-50/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A]">
                <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                <span>Designated Anchor Actions ({currentUser.name})</span>
              </div>
              <p className="text-[11px] text-[#57534E]">
                As a verified corridor anchor, you can formally confirm or resolve this incident.
              </p>

              {showAnchorConfirmDialog ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={anchorNotes}
                    onChange={(e) => setAnchorNotes(e.target.value)}
                    placeholder="Enter on-site verification notes (e.g., Confirmed with union desk at gate)..."
                    className="w-full text-xs p-2 rounded border border-[#D6D3D1] bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAnchorConfirmDialog(false)}
                      className="text-xs px-3 py-1.5 text-[#737373]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAnchorConfirm}
                      className="px-4 py-2 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold"
                    >
                      Confirm and Broadcast
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnchorConfirmDialog(true)}
                  className="w-full py-2 rounded border border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold min-h-[44px]"
                >
                  Formally Confirm Incident as Anchor
                </button>
              )}
            </div>
          )}

          {(currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN') && incident.state !== 'RESOLVED' && (
            <div className="p-3.5 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
                <Lock className="w-3.5 h-3.5 text-[#737373]" />
                <span>Moderator Incident Resolution</span>
              </div>

              {showResolveDialog ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={resolveReason}
                    onChange={(e) => setResolveReason(e.target.value)}
                    placeholder="Reason for closing (e.g., Roadway cleared by recovery vehicle)..."
                    className="w-full text-xs p-2 rounded border border-[#D6D3D1] bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowResolveDialog(false)}
                      className="text-xs px-3 py-1.5 text-[#737373]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResolve}
                      className="px-3 py-1.5 rounded bg-[#991B1B] text-[#FAFAF9] font-bold"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResolveDialog(true)}
                  className="text-xs text-[#991B1B] hover:underline font-semibold"
                >
                  Mark incident as formally resolved
                </button>
              )}
            </div>
          )}
        </div>

        {showBroadcastModal && (
          <BroadcastModal
            incident={incident}
            onClose={() => setShowBroadcastModal(false)}
          />
        )}
      </div>
    </div>
  );
}
