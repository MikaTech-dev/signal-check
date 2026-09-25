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
    <div className="max-w-2xl mx-auto space-y-12 pb-16 text-[#0A0A0A]">
      {/* Progress & Header */}
      {step <= 4 && (
        <div>
          <div className="text-sm font-bold text-[#737373] uppercase tracking-wide mb-3">
            Step {step} of 4
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A]">
            {step === 1 && 'What happened?'}
            {step === 2 && 'Where did it occur?'}
            {step === 3 && 'When did you observe it?'}
            {step === 4 && 'Review and Submit'}
          </h2>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <label className="block text-base font-semibold text-[#171717]">
              Details
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g., I just saw a fallen power line blocking the service lane opposite the market..."
              className="w-full text-base sm:text-lg p-5 rounded-2xl border border-[#E7E5E4] bg-white text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] resize-none transition-shadow shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm pt-2">
              <span className="text-[#737373]">Presets:</span>
              <button onClick={() => handleQuickPasteScenario({ text: 'Just drove past Market North Exit. Diesel tanker broken down with fuel spill across right lane. Wardens waving cars to bypass.', type: 'HAZARD_SPILL', source: 'FIRSTHAND', landmarkIndex: 0 })} className="text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">Tanker Spill</button>
              <button onClick={() => handleQuickPasteScenario({ text: 'FORWARDED AS RECEIVED: URGENT TO ALL PARENTS!! Bad boys are gathering with weapons near Eastern flyover! Stay inside everyone panic!!', type: 'ROAD_OBSTRUCTION', source: 'HEARSAY', landmarkIndex: 1 })} className="text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">Viral Rumor</button>
              <button onClick={() => handleQuickPasteScenario({ text: '9-year-old student wearing white shirt and navy shorts did not return from afternoon math lesson. Last seen near school gate at 5:45 PM.', type: 'MISSING_PERSON', source: 'FIRSTHAND', landmarkIndex: 2 })} className="text-[#0A0A0A] underline hover:text-[#C7862B] transition-colors">Missing Student</button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-base font-semibold text-[#171717]">
              Classification
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              className="w-full text-base p-4 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]"
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

          <div className="space-y-4">
            <label className="block text-base font-semibold text-[#171717]">
              Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'FIRSTHAND', label: 'Firsthand', desc: 'I saw this directly', icon: Eye },
                { id: 'HEARSAY', label: 'Hearsay', desc: 'Forwarded or told to me', icon: MessageSquareQuote },
                { id: 'UNKNOWN', label: 'Unknown', desc: 'Uncertain origin', icon: FileText }
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = sourceType === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceType(src.id as ReportSourceType)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md'
                        : 'bg-white text-[#171717] border-[#E7E5E4] hover:border-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-base mb-1.5">
                      <Icon className="w-5 h-5" />
                      <span>{src.label}</span>
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-gray-300' : 'text-[#737373]'}`}>
                      {src.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button
              type="button"
              disabled={!rawText.trim()}
              onClick={handleNext}
              className="group px-8 py-4 rounded-full bg-[#0A0A0A] text-white text-base font-bold hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-transform active:scale-[0.98]"
            >
              <span>Next</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <label className="block text-base font-semibold text-[#171717]">
              Verified local landmarks
            </label>
            <div className="grid gap-3">
              {COMMON_LANDMARKS.map((landmark, idx) => {
                const isSelected = locationLabel === landmark.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLandmarkSelect(landmark)}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md font-bold'
                        : 'bg-white text-[#171717] border-[#E7E5E4] hover:border-[#0A0A0A]'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-base">
                      <MapPin className={`w-5 h-5 ${isSelected ? 'text-[#C7862B]' : 'text-[#737373]'}`} />
                      <span>{landmark.label}</span>
                    </span>
                    {isSelected && <Check className="w-5 h-5 text-[#C7862B]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-base font-semibold text-[#171717]">
              Or type custom description
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g., Lugbe Market Fruit Section near chemist"
              className="w-full text-base p-4 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]"
            />
          </div>

          <div className="pt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-4 text-base font-bold text-[#737373] hover:text-[#0A0A0A] transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="group px-8 py-4 rounded-full bg-[#0A0A0A] text-white text-base font-bold hover:bg-[#262626] flex items-center gap-3 transition-transform active:scale-[0.98]"
            >
              <span>Next</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setIsHappeningNow(!isHappeningNow)}
              className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isHappeningNow
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-md'
                  : 'bg-white text-[#171717] border-[#E7E5E4] hover:border-[#0A0A0A]'
              }`}
            >
              <div>
                <div className="font-bold text-lg mb-1">Happening right now</div>
                <div className={`text-sm ${isHappeningNow ? 'text-gray-300' : 'text-[#737373]'}`}>
                  Active ongoing observation
                </div>
              </div>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                isHappeningNow ? 'border-[#C7862B] bg-[#C7862B]' : 'border-[#D6D3D1]'
              }`}>
                {isHappeningNow && <Check className="w-4 h-4 text-[#0A0A0A]" />}
              </div>
            </button>

            {!isHappeningNow && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-base font-semibold text-[#171717]">
                  Approximate time
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g., 6:15 PM or 25 minutes ago"
                  className="w-full text-base p-4 rounded-xl border border-[#E7E5E4] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]"
                />
              </div>
            )}
          </div>

          <div className="pt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-4 text-base font-bold text-[#737373] hover:text-[#0A0A0A] transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="group px-8 py-4 rounded-full bg-[#0A0A0A] text-white text-base font-bold hover:bg-[#262626] flex items-center gap-3 transition-transform active:scale-[0.98]"
            >
              <span>Review</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-8">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#737373]">Incident</div>
              <div className="text-2xl font-bold text-[#0A0A0A]">{incidentType.replace(/_/g, ' ')}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#737373]">Location</div>
              <div className="text-2xl font-bold text-[#0A0A0A]">{locationLabel}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#737373]">Time</div>
              <div className="text-2xl font-bold text-[#0A0A0A]">{isHappeningNow ? 'Happening Now' : eventTime}</div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-[#737373]">Report Details</div>
              <p className="text-lg text-[#171717] bg-[#FAFAF9] p-6 rounded-2xl leading-relaxed">
                {rawText}
              </p>
            </div>
          </div>

          {triageAudit.missingActionableDetails.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#FAFAF9] space-y-3">
              <div className="font-bold text-[#0A0A0A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C7862B]" />
                <span>Before you submit</span>
              </div>
              <p className="text-base text-[#57534E] leading-relaxed">
                Your report will be processed immediately. Adding these details later could help confirm the event:
              </p>
              <ul className="list-disc pl-5 text-base text-[#57534E] space-y-1">
                {triageAudit.missingActionableDetails.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-4 text-base font-bold text-[#737373] hover:text-[#0A0A0A] transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitReport}
              className="group px-8 py-4 rounded-full bg-[#0A0A0A] text-white text-base font-bold hover:bg-[#262626] transition-transform active:scale-[0.98] flex items-center gap-3"
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? 'Processing...' : 'Submit Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && submissionResult && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-3 max-w-sm">
              <h2 className="text-4xl font-bold text-[#0A0A0A] tracking-tight">Report Received</h2>
              <p className="text-lg text-[#57534E] leading-relaxed">
                {submissionResult.isNewIncident
                  ? 'We have initialized a new community incident based on your observation.'
                  : 'Your observation has been linked to an existing nearby incident.'}
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#FAFAF9] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <span className="text-base font-semibold text-[#737373]">Incident ID</span>
              <span className="text-lg font-bold text-[#0A0A0A]">{submissionResult.linkedIncident.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <span className="text-base font-semibold text-[#737373]">Current Status</span>
              <span className="text-lg font-bold text-[#0A0A0A]">{submissionResult.linkedIncident.state}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#737373]">Completeness</span>
              <span className="text-lg font-bold text-[#0A0A0A]">{submissionResult.report.triageAudit.completenessScore}/100</span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete();
                window.location.href = `/nearby?incident=${submissionResult.linkedIncident.id}`;
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0A0A0A] text-white text-base font-bold hover:bg-[#262626] transition-transform active:scale-[0.98] text-center"
            >
              View live feed
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setRawText('');
                setSubmissionResult(null);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#E7E5E4] bg-white text-[#0A0A0A] text-base font-bold hover:border-[#0A0A0A] transition-colors text-center"
            >
              Submit another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
