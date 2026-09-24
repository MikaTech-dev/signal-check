export type SourceType = 'FIRSTHAND_OBSERVATION' | 'HEARSAY_RUMOR' | 'COMMUNITY_RADIO' | 'UNVERIFIED_WHATSAPP';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RoadStatusType = 'SAFE' | 'CAUTION' | 'DANGER' | 'UNKNOWN';

export interface SafetyReport {
  id: string;
  rawText: string;
  submittedAt: string; // ISO or formatted time
  location: string;
  sourceType: SourceType;
  incidentType: string;
  claim: string;
  confidenceScore: number; // 0 - 100
  urgency: UrgencyLevel;
  needsHumanReview: boolean;
  isFirsthand: boolean;
  reasoning: string;
  verifiedByAi: boolean;
}

export interface RouteStatus {
  id: string;
  name: string;
  description: string;
  status: RoadStatusType;
  confidenceScore: number;
  lastUpdated: string;
  firsthandCount: number;
  hearsayCount: number;
  summary: string;
  activeIncidents: string[];
}

export interface AiAnalysisResult {
  incident_type: string;
  location: string;
  event_time: string;
  source_type: SourceType;
  claim: string;
  urgency: UrgencyLevel;
  confidence: number;
  needs_human_review: boolean;
  is_firsthand: boolean;
  reasoning: string;
}
