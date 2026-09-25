'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Incident } from '@/types';
import { calculateHaversineDistance, formatDistanceBand, maskCoordinates } from '@/lib/haversine';
import { signalStore } from '@/lib/store';
import { incidentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
  ArrowRight,
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
  const { user } = useAuth();
  const [showAttestationForm, setShowAttestationForm] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAnchorConfirmDialog, setShowAnchorConfirmDialog] = useState(false);
  const [anchorNotes, setAnchorNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveReason, setResolveReason] = useState('');

  const currentUser = user;
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E5E4] rounded-t-[2.5rem] sm:rounded-[2.5rem] max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
              {incident.incidentType.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-semibold text-[#737373]">{distanceBand}</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[#E7E5E4] bg-white text-[#737373] hover:text-[#0A0A0A] hover:border-[#0A0A0A] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-[#0A0A0A]">
          
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] leading-snug">
              {incident.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
              <span className="flex items-center gap-1.5 font-semibold text-[#0A0A0A]">
                <MapPin className="w-4 h-4 text-[#C7862B]" />
                <span>{incident.locationLabel}</span>
              </span>
              <span className="text-[#A8A29E]">&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#737373]" />
                <span>Reported {timeElapsedMinutes}m ago</span>
              </span>
              <span className="text-[11px] text-[#737373] bg-[#FAFAF9] border border-[#E7E5E4] px-2.5 py-0.5 rounded-full font-mono">
                Masked Coords: {maskedCoords.latitude.toFixed(2)}, {maskedCoords.longitude.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Verification State & Discrepancy Matrix */}
          <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Verification Status
              </span>
              <span className="text-xs font-bold text-[#0A0A0A] px-3 py-1 rounded-full bg-white border border-[#D6D3D1]">
                {incident.state}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#0A0A0A] font-bold text-base">
                  <Eye className="w-4 h-4" />
                  <span>{incident.firsthandCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Firsthand</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#991B1B] font-bold text-base">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{incident.contradictionCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Contradictions</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#57534E] font-bold text-base">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>{incident.hearsayCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Hearsay Volume</div>
              </div>
            </div>

            {incident.confirmedByAnchor && (
              <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#0A0A0A] text-xs">
                <div className="flex items-center gap-2 font-bold text-[#0A0A0A] mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
                  <span>Confirmed by Anchor: {incident.confirmedByAnchor.anchorName}</span>
                </div>
                <p className="text-[11px] text-[#57534E]">
                  {incident.confirmedByAnchor.anchorTitle} &bull; {incident.confirmedByAnchor.notes}
                </p>
              </div>
            )}
          </div>

          {/* Observations Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Ground Observations Log
            </h3>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                <span>Supporting Sightings ({incident.supportingFacts.length})</span>
              </div>
              {incident.supportingFacts.length === 0 ? (
                <p className="text-xs text-[#737373] italic pl-3.5">No supporting observations logged yet.</p>
              ) : (
                <div className="space-y-1.5 pl-3.5">
                  {incident.supportingFacts.map((fact, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#FAFAF9] border border-[#F5F5F4] text-xs leading-relaxed text-[#171717]">
                      {fact}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {incident.contradictingFacts.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-[#991B1B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#991B1B]" />
                  <span>Active Contradictions ({incident.contradictingFacts.length})</span>
                </div>
                <div className="space-y-1.5 pl-3.5">
                  {incident.contradictingFacts.map((fact, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950 leading-relaxed">
                      {fact}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Critical Missing Details */}
          {incident.missingDetails.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C7862B]" />
                <span>Missing Specific Information Needed:</span>
              </h4>
              <ul className="text-xs text-amber-900 space-y-1 pl-5 list-disc">
                {incident.missingDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Coach */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] text-[#FAFAF9] space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C7862B]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAFAF9]">
                Safe Verification Checks
              </h4>
            </div>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Low-risk verification methods. Do not travel toward active disruptions.
            </p>
            <div className="space-y-2 pt-1">
              {incident.suggestedVerificationChecks.map((check, idx) => (
                <div key={idx} className="text-xs text-[#E7E5E4] flex items-start gap-2 bg-[#171717] p-3 rounded-xl border border-white/5">
                  <span className="text-[#C7862B] font-bold">{idx + 1}.</span>
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions: Attestation & Broadcast */}
          {showAttestationForm ? (
            <AttestationForm
              incident={incident}
              onAttestationComplete={handleAttestationComplete}
              onCancel={() => setShowAttestationForm(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setShowAttestationForm(true)}
                className="group flex-1 min-h-[48px] px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform flex items-center justify-center gap-2.5 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C7862B]" />
                <span>Confirm or Dispute</span>
              </button>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-6 py-3 min-h-[48px] rounded-full border border-[#D6D3D1] bg-white text-[#0A0A0A] text-xs font-bold hover:border-[#0A0A0A] flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#737373]" />
                <span>Broadcast Notice</span>
              </button>
            </div>
          )}

          {/* Anchor Confirmation Panel */}
          {currentUser &&
            (currentUser.role === 'ANCHOR' || currentUser.role === 'COMMUNITY_ANCHOR' || currentUser.role === 'ADMIN') &&
            incident.state !== 'CONFIRMED' &&
            incident.state !== 'RESOLVED' && (
              <div className="p-5 rounded-2xl border border-[#0A0A0A] bg-amber-50/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
                  <ShieldCheck className="w-4 h-4 text-[#C7862B]" />
                  <span>Designated Anchor Action ({currentUser.name})</span>
                </div>
                <p className="text-xs text-[#57534E]">
                  As a stationary corridor anchor, you can formally confirm this observation and trigger a 5 km perimeter alert.
                </p>

                {showAnchorConfirmDialog ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows={2}
                      value={anchorNotes}
                      onChange={(e) => setAnchorNotes(e.target.value)}
                      placeholder="Enter on-site verification notes (e.g. Confirmed with market gate warden)..."
                      className="w-full text-xs p-3 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAnchorConfirmDialog(false)}
                        className="text-xs px-4 py-2 text-[#737373] hover:text-[#0A0A0A] font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAnchorConfirm}
                        className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626]"
                      >
                        Confirm & Broadcast
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnchorConfirmDialog(true)}
                    className="w-full py-3 rounded-full bg-[#0A0A0A] text-white text-xs font-bold min-h-[44px] hover:bg-[#262626] transition-transform active:scale-[0.98]"
                  >
                    Formally Confirm Incident as Anchor
                  </button>
                )}
              </div>
            )}

          {/* Moderator Resolution Panel */}
          {currentUser &&
            (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN') &&
            incident.state !== 'RESOLVED' && (
              <div className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
                  <Lock className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Moderator Resolution</span>
                </div>

              {showResolveDialog ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={resolveReason}
                    onChange={(e) => setResolveReason(e.target.value)}
                    placeholder="Reason for closing (e.g. Roadway cleared by recovery team)..."
                    className="w-full text-xs p-3 rounded-xl border border-[#D6D3D1] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowResolveDialog(false)}
                      className="text-xs px-4 py-2 text-[#737373] hover:text-[#0A0A0A] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResolve}
                      className="px-6 py-2.5 rounded-full bg-[#991B1B] text-white text-xs font-bold hover:bg-[#7F1D1D]"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResolveDialog(true)}
                  className="text-xs text-[#991B1B] hover:underline font-bold"
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
