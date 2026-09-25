'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Incident, Attestation, AttestationType } from '@/types';
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
  Share2,
  Plus,
  HelpCircle,
  Lock,
  RefreshCw,
  Info,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident;
  onClose: () => void;
  onUpdate: () => void;
}

function formatRelativeTime(timestamp?: string): string {
  if (!timestamp) return 'Recently';
  const time = new Date(timestamp).getTime();
  if (isNaN(time)) return 'Recently';
  const diffMinutes = Math.max(0, Math.round((Date.now() - time) / (1000 * 60)));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function IncidentDetailDrawer({
  incident,
  onClose,
  onUpdate,
}: IncidentDetailDrawerProps) {
  const { user } = useAuth();
  const [currentIncident, setCurrentIncident] = useState<Incident>(incident);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isLoadingAttestations, setIsLoadingAttestations] = useState(true);
  const [attestationFilter, setAttestationFilter] = useState<'ALL' | AttestationType>('ALL');

  const [showAttestationForm, setShowAttestationForm] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAnchorConfirmDialog, setShowAnchorConfirmDialog] = useState(false);
  const [anchorNotes, setAnchorNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveReason, setResolveReason] = useState('');

  const currentUser = user;
  const userCoords = signalStore.getUserCoordinates();
  const incCoords = currentIncident.coordinates || {
    latitude: currentIncident.latitude || 0,
    longitude: currentIncident.longitude || 0,
  };
  const distanceKm =
    typeof currentIncident.distanceKm === 'number'
      ? currentIncident.distanceKm
      : calculateHaversineDistance(userCoords, incCoords);
  const distanceBand = formatDistanceBand(
    distanceKm,
    currentIncident.approximateArea || currentIncident.locationLabel
  );
  const maskedCoords = maskCoordinates(incCoords);

  const reportTime = currentIncident.firstReportedAt || currentIncident.createdAt || new Date().toISOString();
  const expireTime = currentIncident.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const timeElapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - new Date(reportTime).getTime()) / (1000 * 60))
  );

  const loadData = useCallback(async () => {
    setIsLoadingAttestations(true);
    try {
      // 1. Fetch live attestations from API
      let remoteAttestations: Attestation[] = [];
      try {
        const attRes = await incidentsApi.getAttestations(incident.id);
        if (attRes.success && Array.isArray(attRes.data)) {
          remoteAttestations = attRes.data;
        }
      } catch {
        // Fallback to local store if server unreachable
      }

      // 2. Merge with local store attestations
      const localAttestations = signalStore.getAttestationsForIncident(incident.id);
      const combined = [...remoteAttestations];
      localAttestations.forEach((loc) => {
        if (!combined.some((c) => c.id === loc.id)) {
          combined.push(loc);
        }
      });

      // Sort newest first
      combined.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.submittedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.submittedAt || 0).getTime();
        return timeB - timeA;
      });

      setAttestations(combined);

      // 3. Fetch latest incident metadata
      try {
        const incRes = await incidentsApi.getById(incident.id);
        if (incRes.success && incRes.data) {
          setCurrentIncident(incRes.data);
          signalStore.updateIncident(incRes.data);
        }
      } catch {
        const localInc = signalStore.getIncidentById(incident.id);
        if (localInc) {
          setCurrentIncident(localInc);
        }
      }
    } finally {
      setIsLoadingAttestations(false);
    }
  }, [incident.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttestationComplete = async () => {
    setShowAttestationForm(false);
    await loadData();
    onUpdate();
  };

  const handleAnchorConfirm = async () => {
    if (!anchorNotes.trim()) {
      toast.error('Please enter on-site verification notes.');
      return;
    }

    try {
      await incidentsApi.confirm(currentIncident.id, anchorNotes.trim());
    } catch {
      // Local store fallback
    }

    signalStore.confirmIncidentAsAnchor(currentIncident.id, anchorNotes.trim());
    setShowAnchorConfirmDialog(false);
    toast.success('Incident formally confirmed by anchor', {
      description: '5 km perimeter alert broadcast triggered.',
    });
    await loadData();
    onUpdate();
  };

  const handleResolve = async () => {
    if (!resolveReason.trim()) {
      toast.error('Please state the resolution reason.');
      return;
    }

    try {
      await incidentsApi.resolve(currentIncident.id, resolveReason.trim());
    } catch {
      // Local store fallback
    }

    signalStore.resolveIncident(currentIncident.id, resolveReason.trim());
    setShowResolveDialog(false);
    toast.success('Incident marked resolved', {
      description: 'Incident archived from active crisis perimeter.',
    });
    await loadData();
    onUpdate();
  };

  // Filter calculations
  const firsthandList = attestations.filter(
    (a) => (a.action || a.type) === 'FIRSTHAND_WITNESS'
  );
  const contradictionList = attestations.filter(
    (a) => (a.action || a.type) === 'ACTIVE_CONTRADICTION'
  );
  const hearsayList = attestations.filter(
    (a) => (a.action || a.type) === 'HEARSAY_TRACKING'
  );

  const firsthandCount = Math.max(currentIncident.firsthandCount || 0, firsthandList.length);
  const contradictionCount = Math.max(currentIncident.contradictionCount || 0, contradictionList.length);
  const hearsayCount = Math.max(currentIncident.hearsayCount || 0, hearsayList.length);

  const filteredAttestations = attestations.filter((a) => {
    if (attestationFilter === 'ALL') return true;
    return (a.action || a.type) === attestationFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E5E4] rounded-t-[2.5rem] sm:rounded-[2.5rem] max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0A0A0A] text-white">
              {currentIncident.incidentType.replace(/_/g, ' ')}
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
              {currentIncident.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
              <span className="flex items-center gap-1.5 font-semibold text-[#0A0A0A]">
                <MapPin className="w-4 h-4 text-[#C7862B]" />
                <span>{currentIncident.locationLabel}</span>
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
                {currentIncident.state}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#0A0A0A] font-bold text-base">
                  <Eye className="w-4 h-4 text-[#0A0A0A]" />
                  <span>{firsthandCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Firsthand</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#991B1B] font-bold text-base">
                  <ShieldAlert className="w-4 h-4 text-[#991B1B]" />
                  <span>{contradictionCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Contradictions</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E5E4]">
                <div className="flex items-center justify-center gap-1.5 text-[#57534E] font-bold text-base">
                  <MessageSquareQuote className="w-4 h-4 text-[#57534E]" />
                  <span>{hearsayCount}</span>
                </div>
                <div className="text-[11px] text-[#737373] mt-1 font-medium">Hearsay Volume</div>
              </div>
            </div>

            {currentIncident.confirmedByAnchor && (
              <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#0A0A0A] text-xs">
                <div className="flex items-center gap-2 font-bold text-[#0A0A0A] mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#C7862B]" />
                  <span>Confirmed by Anchor: {currentIncident.confirmedByAnchor.anchorName}</span>
                </div>
                <p className="text-[11px] text-[#57534E]">
                  {currentIncident.confirmedByAnchor.anchorTitle} &bull; {currentIncident.confirmedByAnchor.notes}
                </p>
              </div>
            )}
          </div>

          {/* Eyewitness Log & Community Comments Section */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                  Eyewitness Log & Comments
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] text-[#737373]">
                  {attestations.length}
                </span>
              </div>
              <button
                onClick={() => loadData()}
                disabled={isLoadingAttestations}
                title="Refresh ground updates"
                className="text-xs text-[#737373] hover:text-[#0A0A0A] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#FAFAF9] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAttestations ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAttestationFilter('ALL')}
                className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  attestationFilter === 'ALL'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-[#FAFAF9] text-[#57534E] border border-[#E7E5E4] hover:border-[#0A0A0A]'
                }`}
              >
                <span>All Updates</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${attestationFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#737373]'}`}>
                  {attestations.length}
                </span>
              </button>

              <button
                onClick={() => setAttestationFilter('FIRSTHAND_WITNESS')}
                className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  attestationFilter === 'FIRSTHAND_WITNESS'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-[#FAFAF9] text-[#57534E] border border-[#E7E5E4] hover:border-[#0A0A0A]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Eyewitnesses</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${attestationFilter === 'FIRSTHAND_WITNESS' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#737373]'}`}>
                  {firsthandList.length}
                </span>
              </button>

              <button
                onClick={() => setAttestationFilter('ACTIVE_CONTRADICTION')}
                className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  attestationFilter === 'ACTIVE_CONTRADICTION'
                    ? 'bg-[#991B1B] text-white'
                    : 'bg-[#FAFAF9] text-[#57534E] border border-[#E7E5E4] hover:border-[#991B1B]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Road Clear</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${attestationFilter === 'ACTIVE_CONTRADICTION' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#737373]'}`}>
                  {contradictionList.length}
                </span>
              </button>

              <button
                onClick={() => setAttestationFilter('HEARSAY_TRACKING')}
                className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                  attestationFilter === 'HEARSAY_TRACKING'
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-[#FAFAF9] text-[#57534E] border border-[#E7E5E4] hover:border-[#0A0A0A]'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Chatter</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${attestationFilter === 'HEARSAY_TRACKING' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#737373]'}`}>
                  {hearsayList.length}
                </span>
              </button>
            </div>

            {/* List of Attestation Comments */}
            {isLoadingAttestations ? (
              <div className="space-y-2.5">
                <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] animate-pulse space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] animate-pulse space-y-2">
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ) : filteredAttestations.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] text-center space-y-3">
                <MessageSquareQuote className="w-6 h-6 text-[#A8A29E] mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#0A0A0A]">
                    {attestations.length === 0
                      ? 'No ground updates or eyewitness comments yet'
                      : 'No updates match this filter'}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {attestations.length === 0
                      ? 'Are you near this location? Be the first to confirm current conditions or report that the road is clear.'
                      : 'Try selecting a different filter above to view other ground reports.'}
                  </p>
                </div>
                {attestations.length === 0 && !showAttestationForm && (
                  <button
                    onClick={() => setShowAttestationForm(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-transform active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C7862B]" />
                    <span>Post First Update</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttestations.map((att) => {
                  const type = att.action || att.type || 'FIRSTHAND_WITNESS';
                  const comment = att.comment || att.observation || att.contradictionDetails || '';
                  const location = att.locationLabel || att.locationObserved;
                  const timeStr = formatRelativeTime(att.createdAt || att.submittedAt || att.observedAt);
                  const isFirsthand = type === 'FIRSTHAND_WITNESS';
                  const isContradiction = type === 'ACTIVE_CONTRADICTION';
                  const isHearsay = type === 'HEARSAY_TRACKING';

                  return (
                    <div
                      key={att.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isContradiction
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-[#FAFAF9] border-[#E7E5E4]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                              isContradiction
                                ? 'bg-[#991B1B] text-white'
                                : isFirsthand
                                ? 'bg-[#0A0A0A] text-white'
                                : 'bg-[#E7E5E4] text-[#171717]'
                            }`}
                          >
                            {isContradiction ? (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                <span>Road Clear</span>
                              </>
                            ) : isFirsthand ? (
                              <>
                                <Eye className="w-3 h-3 text-[#C7862B]" />
                                <span>Direct Eyewitness</span>
                              </>
                            ) : (
                              <>
                                <MessageSquareQuote className="w-3 h-3" />
                                <span>Forwarded Chatter</span>
                              </>
                            )}
                          </span>

                          {location && (
                            <span className="text-[11px] text-[#57534E] flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-[#737373]" />
                              <span>{location}</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-[#737373] whitespace-nowrap">
                          {timeStr}
                        </span>
                      </div>

                      <p className="text-xs text-[#171717] leading-relaxed font-normal">
                        {comment}
                      </p>

                      {att.contradictionDetails && att.contradictionDetails !== comment && (
                        <div className="mt-2 pt-2 border-t border-rose-200/60 text-[11px] text-rose-900 font-medium">
                          Details: {att.contradictionDetails}
                        </div>
                      )}

                      {att.hearsaySource && (
                        <div className="mt-2 pt-2 border-t border-[#E7E5E4] text-[11px] text-[#737373]">
                          Source: {att.hearsaySource}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Initial Report Observations (if any exist from intake) */}
            {currentIncident.supportingFacts && currentIncident.supportingFacts.length > 0 && (
              <div className="pt-2 border-t border-[#E7E5E4] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#57534E]">
                  <Info className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Initial Intake Telemetry ({currentIncident.supportingFacts.length})</span>
                </div>
                <div className="space-y-1.5 pl-4 border-l-2 border-[#E7E5E4]">
                  {currentIncident.supportingFacts.map((fact, idx) => (
                    <p key={idx} className="text-xs text-[#57534E] leading-relaxed">
                      {fact}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Critical Missing Details */}
          {currentIncident.missingDetails && currentIncident.missingDetails.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C7862B]" />
                <span>Missing Specific Information Needed:</span>
              </h4>
              <ul className="text-xs text-amber-900 space-y-1 pl-5 list-disc">
                {currentIncident.missingDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Coach */}
          {currentIncident.suggestedVerificationChecks && currentIncident.suggestedVerificationChecks.length > 0 && (
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
                {currentIncident.suggestedVerificationChecks.map((check, idx) => (
                  <div key={idx} className="text-xs text-[#E7E5E4] flex items-start gap-2 bg-[#171717] p-3 rounded-xl border border-white/5">
                    <span className="text-[#C7862B] font-bold">{idx + 1}.</span>
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions: Attestation & Broadcast */}
          {showAttestationForm ? (
            <AttestationForm
              incident={currentIncident}
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
            currentIncident.state !== 'CONFIRMED' &&
            currentIncident.state !== 'RESOLVED' && (
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
            currentIncident.state !== 'RESOLVED' && (
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
            incident={currentIncident}
            onClose={() => setShowBroadcastModal(false)}
          />
        )}
      </div>
    </div>
  );
}
