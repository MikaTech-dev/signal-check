'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Coordinates,
  Incident,
  IncidentReport,
  IncidentType,
  ReportInputType,
  ReportSourceType,
} from '@/types';
import { heuristicTriageAudit } from '@/lib/deepseek';
import { signalStore } from '@/lib/store';
import { reportsApi } from '@/lib/api';
import {
  Check,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Eye,
  MessageSquareQuote,
  Layers,
} from 'lucide-react';

const COMMON_LANDMARKS = [
  { label: 'Lugbe Market Central Northbound Exit', coords: { latitude: 8.9845, longitude: 7.3789 } },
  { label: 'Eastern River Bypass & Flyover Pillar 4', coords: { latitude: 8.9712, longitude: 7.3915 } },
  { label: 'Lugbe Primary School Extension Road', coords: { latitude: 8.979, longitude: 7.368 } },
  { label: 'Airport Road Interchange Service Lane', coords: { latitude: 8.995, longitude: 7.362 } },
  { label: 'Federal Housing Estate Junction', coords: { latitude: 8.982, longitude: 7.371 } },
];

export function MultiStepReportForm({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [rawText, setRawText] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('ROAD_OBSTRUCTION');
  const [sourceType, setSourceType] = useState<ReportSourceType>('FIRSTHAND');
  const [inputType, setInputType] = useState<ReportInputType>('TEXT');

  const [locationLabel, setLocationLabel] = useState(COMMON_LANDMARKS[0].label);
  const [coordinates, setCoordinates] = useState<Coordinates>(COMMON_LANDMARKS[0].coords);

  const [isHappeningNow, setIsHappeningNow] = useState(true);
  const [eventTime, setEventTime] = useState('Within last 10 minutes');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    report: IncidentReport;
    linkedIncident: Incident;
    isNewIncident: boolean;
  } | null>(null);

  const triageAudit = heuristicTriageAudit(rawText, incidentType, locationLabel);

  const handleLandmarkSelect = (landmark: (typeof COMMON_LANDMARKS)[0]) => {
    setLocationLabel(landmark.label);
    setCoordinates(landmark.coords);
  };

  const handleNext = () => {
    if (step === 1 && !rawText.trim()) {
      toast.error('Please enter report details before proceeding.');
      return;
    }
    setStep((prev) => (Math.min(prev + 1, 4) as 1 | 2 | 3 | 4));
  };

  const handleBack = () => {
    setStep((prev) => (Math.max(prev - 1, 1) as 1 | 2 | 3 | 4));
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    try {
      let finalAudit = triageAudit;
      let serverReport: IncidentReport | null = null;
      let serverIncident: Incident | null = null;
      let serverLinkage: { type: string; distanceKm?: number; incidentId: string } | null = null;

      try {
        const apiRes = await reportsApi.submitReport({
          rawText: rawText.trim(),
          incidentType,
          sourceType,
          locationLabel,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          eventTime: new Date().toISOString(),
          inputType,
        });

        if (apiRes.success && apiRes.data) {
          serverReport = {
            ...apiRes.data.report,
            coordinates: {
              latitude: apiRes.data.report.latitude || coordinates.latitude,
              longitude: apiRes.data.report.longitude || coordinates.longitude,
            },
            isHappeningNow,
            submittedAt: apiRes.data.report.createdAt || new Date().toISOString(),
            triageAudit: apiRes.data.report.triageAudit || finalAudit,
            moderationStatus: apiRes.data.report.moderationStatus || 'APPROVED',
          };
          serverIncident = {
            ...apiRes.data.incident,
            coordinates: {
              latitude: apiRes.data.incident.latitude || coordinates.latitude,
              longitude: apiRes.data.incident.longitude || coordinates.longitude,
            },
            firstReportedAt: apiRes.data.incident.createdAt || new Date().toISOString(),
            lastReaffirmedAt: apiRes.data.incident.updatedAt || new Date().toISOString(),
            expiresAt: apiRes.data.incident.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            reportCount: apiRes.data.incident.reportCount || 1,
            firsthandCount: apiRes.data.incident.firsthandCount || 1,
            contradictionCount: apiRes.data.incident.contradictionCount || 0,
            hearsayCount: apiRes.data.incident.hearsayCount || 0,
            supportingFacts: [rawText.trim()],
            contradictingFacts: [],
            missingDetails: apiRes.data.report.missingDetails || [],
            suggestedVerificationChecks: ['Stationary anchor verification'],
            synthesisSummary: apiRes.data.incident.summary || 'Incident recorded.',
            convergenceStatus: 'STATIC',
            triageStatus: 'ACTIVE_ALERT',
          };
          serverLinkage = apiRes.data.linkage;
        }
      } catch {
        // Fallback to local store
      }

      if (serverReport && serverIncident && serverLinkage) {
        const isNew = serverLinkage.type === 'USED_TO_CREATE_INCIDENT';
        setSubmissionResult({
          report: serverReport,
          linkedIncident: serverIncident,
          isNewIncident: isNew,
        });
        setStep(5);

        if (isNew) {
          toast.success('Report created new community incident', {
            description: `Incident #${serverIncident.id} in ${locationLabel}`,
          });
        } else {
          toast.success('Report auto-linked to incident', {
            description: `Linked within cluster radius (${serverLinkage.distanceKm ? serverLinkage.distanceKm.toFixed(2) + ' km' : '1.5 km'}).`,
          });
        }
        return;
      }

      // Local fallback execution
      const result = signalStore.submitReport({
        incidentType,
        rawText: rawText.trim(),
        sourceType,
        inputType,
        locationLabel,
        coordinates,
        eventTime: isHappeningNow ? 'Happening Now' : eventTime,
        isHappeningNow,
        triageAudit: finalAudit,
      });

      setSubmissionResult(result);
      setStep(5);

      if (result.isNewIncident) {
        toast.success('Report staged as new community incident', {
          description: `Location: ${locationLabel}`,
        });
      } else {
        toast.success('Report linked to existing incident', {
          description: `Linked within 1.5 km cluster radius to #${result.linkedIncident.id}.`,
        });
      }
    } catch {
      toast.error('Failed to submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPasteScenario = (preset: {
    text: string;
    type: IncidentType;
    source: ReportSourceType;
    landmarkIndex: number;
  }) => {
    setRawText(preset.text);
    setIncidentType(preset.type);
    setSourceType(preset.source);
    handleLandmarkSelect(COMMON_LANDMARKS[preset.landmarkIndex]);
    toast.info('Sample scenario loaded', {
      description: 'You can edit or proceed through the steps.',
    });
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-lg shadow-sm overflow-hidden text-[#0A0A0A]">
      {step <= 4 && (
        <div className="p-4 border-b border-[#E7E5E4] bg-[#FAFAF9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Crisis Intake &bull; Step {step} of 4
            </span>
            <span className="text-xs font-semibold text-[#C7862B]">
              {step === 1 && '1. What happened?'}
              {step === 2 && '2. Where did it occur?'}
              {step === 3 && '3. When did you observe it?'}
              {step === 4 && '4. Review and Submit'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full ${
                  s <= step ? 'bg-[#0A0A0A]' : 'bg-[#E7E5E4]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] space-y-2">
            <div className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              Quick Situational Presets
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPasteScenario({
                    text: 'Just drove past Market North Exit. Diesel tanker broken down with fuel spill across right lane. Wardens waving cars to bypass.',
                    type: 'HAZARD_SPILL',
                    source: 'FIRSTHAND',
                    landmarkIndex: 0,
                  })
                }
                className="text-[11px] px-2.5 py-1 rounded border border-[#D6D3D1] bg-white hover:bg-[#F5F5F4] text-[#171717]"
              >
                1. Tanker Fuel Spill (Firsthand)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPasteScenario({
                    text: 'FORWARDED AS RECEIVED: URGENT TO ALL PARENTS!! Bad boys are gathering with weapons near Eastern flyover! Stay inside everyone panic!!',
                    type: 'ROAD_OBSTRUCTION',
                    source: 'HEARSAY',
                    landmarkIndex: 1,
                  })
                }
                className="text-[11px] px-2.5 py-1 rounded border border-[#D6D3D1] bg-white hover:bg-[#F5F5F4] text-[#171717]"
              >
                2. Viral WhatsApp Rumor (Hearsay)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPasteScenario({
                    text: '9-year-old student wearing white shirt and navy shorts did not return from afternoon math lesson. Last seen near school gate at 5:45 PM.',
                    type: 'MISSING_PERSON',
                    source: 'FIRSTHAND',
                    landmarkIndex: 2,
                  })
                }
                className="text-[11px] px-2.5 py-1 rounded border border-[#D6D3D1] bg-white hover:bg-[#F5F5F4] text-[#171717]"
              >
                3. Missing Student Report
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
              Paste or type community chatter / eyewitness telemetry:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g., I just saw a fallen power line blocking the service lane opposite the market..."
              className="w-full text-xs p-3 rounded-md border border-[#D6D3D1] bg-white text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
              Incident Classification:
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              className="w-full text-xs p-2.5 rounded-md border border-[#D6D3D1] bg-white text-[#0A0A0A]"
            >
              <option value="ROAD_OBSTRUCTION">Road Obstruction / Blockage</option>
              <option value="HAZARD_SPILL">Hazard / Chemical or Fuel Spill</option>
              <option value="CHECKPOINT">Checkpoint / Official Diversion</option>
              <option value="SECURITY_GATHERING">Unusual Security Gathering</option>
              <option value="MISSING_PERSON">Missing Person / Child Sighting</option>
              <option value="CIVIL_UNREST">Civil Unrest / Disruption</option>
              <option value="COMMERCIAL_TRAFFIC">Commercial Traffic Congestion</option>
              <option value="OTHER">Other Local Incident</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
              Source Relationship:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('FIRSTHAND')}
                className={`p-2.5 rounded border text-left min-h-[44px] ${
                  sourceType === 'FIRSTHAND'
                    ? 'bg-[#0A0A0A] text-[#FAFAF9] border-[#0A0A0A]'
                    : 'bg-[#FAFAF9] text-[#171717] border-[#E7E5E4]'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Firsthand</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">I saw this directly</div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('HEARSAY')}
                className={`p-2.5 rounded border text-left min-h-[44px] ${
                  sourceType === 'HEARSAY'
                    ? 'bg-[#44403C] text-[#FAFAF9] border-[#44403C]'
                    : 'bg-[#FAFAF9] text-[#171717] border-[#E7E5E4]'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-xs">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  <span>Hearsay</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Forwarded / Told to me</div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('UNKNOWN')}
                className={`p-2.5 rounded border text-left min-h-[44px] ${
                  sourceType === 'UNKNOWN'
                    ? 'bg-[#44403C] text-[#FAFAF9] border-[#44403C]'
                    : 'bg-[#FAFAF9] text-[#171717] border-[#E7E5E4]'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unknown</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Uncertain origin</div>
              </button>
            </div>
          </div>

          {rawText.trim().length > 10 && (
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1 text-[#0A0A0A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C7862B]" />
                  <span>Actionable Completeness Score:</span>
                </span>
                <span className="font-mono text-[#0A0A0A]">
                  {triageAudit.completenessScore}/100
                </span>
              </div>
              {triageAudit.duplicateChainDetected && (
                <div className="text-[#991B1B] font-semibold text-[11px] pt-1">
                  &bull; Duplicate viral forwarding chain detected ({triageAudit.duplicateChainConfidence}% confidence).
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!rawText.trim()}
              onClick={handleNext}
              className="px-5 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] flex items-center gap-1.5"
            >
              <span>Next: Location Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C7862B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Coordinate Privacy:</strong> Exact coordinates are used internally to calculate 5 km notification perimeters and 1.5 km incident linking. Public feeds receive masked coordinates or landmark labels only.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A0A0A] mb-2">
              Select or search verified local landmark:
            </label>
            <div className="space-y-1.5">
              {COMMON_LANDMARKS.map((landmark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLandmarkSelect(landmark)}
                  className={`w-full p-2.5 rounded border text-left text-xs transition-colors flex items-center justify-between min-h-[44px] ${
                    locationLabel === landmark.label
                      ? 'bg-[#0A0A0A] text-[#FAFAF9] border-[#0A0A0A] font-bold'
                      : 'bg-white text-[#171717] border-[#E7E5E4] hover:bg-[#FAFAF9]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C7862B]" />
                    <span>{landmark.label}</span>
                  </span>
                  {locationLabel === landmark.label && <Check className="w-4 h-4 text-[#C7862B]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A0A0A] mb-1">
              Or type custom street / landmark description:
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g., Lugbe Market Fruit Section near chemist"
              className="w-full text-xs p-2.5 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A]"
            />
          </div>

          <div className="flex justify-between pt-2 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded text-xs font-medium text-[#737373] hover:text-[#0A0A0A] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] min-h-[44px] flex items-center gap-1.5"
            >
              <span>Next: Timestamp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0A0A0A]">
              Observation Timing:
            </label>

            <div className="flex items-center gap-2 p-3 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9]">
              <input
                type="checkbox"
                id="happeningNow"
                checked={isHappeningNow}
                onChange={(e) => setIsHappeningNow(e.target.checked)}
                className="w-4 h-4 rounded border-[#D6D3D1] text-[#0A0A0A] focus:ring-[#0A0A0A]"
              />
              <label htmlFor="happeningNow" className="text-xs font-semibold text-[#171717] cursor-pointer">
                Happening right now (Active observation)
              </label>
            </div>

            {!isHappeningNow && (
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Approximate time of observation:
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g., 6:15 PM or 25 minutes ago"
                  className="w-full text-xs p-2.5 rounded border border-[#D6D3D1] bg-white text-[#0A0A0A]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded text-xs font-medium text-[#737373] hover:text-[#0A0A0A] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] min-h-[44px] flex items-center gap-1.5"
            >
              <span>Review & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Submission Summary
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E7E5E4]">
                <span className="text-[#737373]">Incident Type:</span>
                <span className="font-bold text-[#0A0A0A]">{incidentType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E5E4]">
                <span className="text-[#737373]">Source Basis:</span>
                <span className="font-bold text-[#0A0A0A]">{sourceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E5E4]">
                <span className="text-[#737373]">Location Label:</span>
                <span className="font-bold text-[#0A0A0A]">{locationLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E5E4]">
                <span className="text-[#737373]">Timing:</span>
                <span className="font-bold text-[#0A0A0A]">
                  {isHappeningNow ? 'Happening Now' : eventTime}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#737373]">Raw Telemetry:</span>
              <p className="text-xs text-[#171717] bg-white p-2.5 rounded border border-[#E7E5E4] mt-1 leading-relaxed">
                {rawText}
              </p>
            </div>
          </div>

          {triageAudit.missingActionableDetails.length > 0 && (
            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <span className="font-bold text-[#1C1917]">
                Triage Auditor Note:
              </span>
              <p className="text-[#57534E] text-[11px]">
                Your report will be processed immediately. If you have additional specifics later, these details will help confirm the event:
              </p>
              <ul className="list-disc pl-4 text-[#57534E] text-[11px] space-y-0.5">
                {triageAudit.missingActionableDetails.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-[#737373] leading-relaxed">
            By submitting, your report will be evaluated by the Haversine linking engine. Exact coordinates are protected; masked area summary will appear in local feeds.
          </p>

          <div className="flex justify-between pt-2 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded text-xs font-medium text-[#737373] hover:text-[#0A0A0A] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitReport}
              className="px-6 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] active:scale-[0.98] transition-transform min-h-[44px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#C7862B]" />
              <span>{isSubmitting ? 'Triage Processing...' : 'Submit Incident Report'}</span>
            </button>
          </div>
        </div>
      )}

      {step === 5 && submissionResult && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Report Successfully Ingested and Triaged</span>
            </div>
            <p className="text-xs text-emerald-800">
              {submissionResult.isNewIncident
                ? 'Your report initialized a new staged community incident.'
                : `Your report was automatically linked to an existing incident within the 1.5 km cluster radius.`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E7E5E4] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#737373] font-semibold">Incident Identifier:</span>
              <span className="font-mono font-bold text-[#0A0A0A]">
                {submissionResult.linkedIncident.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373] font-semibold">Current State:</span>
              <span className="font-bold px-2 py-0.5 rounded bg-white border border-[#D6D3D1]">
                {submissionResult.linkedIncident.state}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737373] font-semibold">Completeness Score:</span>
              <span className="font-mono font-bold text-[#0A0A0A]">
                {submissionResult.report.triageAudit.completenessScore}/100
              </span>
            </div>
          </div>

          {submissionResult.report.triageAudit.missingActionableDetails.length > 0 && (
            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <span className="font-bold text-[#1C1917]">
                More detail could help corroborate:
              </span>
              <ul className="list-disc pl-4 text-[#57534E] text-[11px] space-y-0.5">
                {submissionResult.report.triageAudit.missingActionableDetails.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F5F5F4]">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setRawText('');
                setSubmissionResult(null);
              }}
              className="px-4 py-2 rounded text-xs font-medium text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F4]"
            >
              Submit Another Report
            </button>
            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete();
                window.location.href = `/nearby?incident=${submissionResult.linkedIncident.id}`;
              }}
              className="px-5 py-2.5 rounded bg-[#0A0A0A] text-[#FAFAF9] text-xs font-bold hover:bg-[#262626] min-h-[44px]"
            >
              View Linked Incident Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
