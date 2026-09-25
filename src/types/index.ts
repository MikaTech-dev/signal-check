export type UserRole =
  | 'RESIDENT'
  | 'COMMUNITY_ANCHOR'
  | 'ANCHOR'
  | 'MODERATOR'
  | 'ADMIN';

export type UserAccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export type IncidentState =
  | 'UNVERIFIED'
  | 'CORROBORATED'
  | 'CONFLICTING'
  | 'CONFIRMED'
  | 'STALE'
  | 'RESOLVED';

export type TriageStatus =
  | 'STAGED'
  | 'ACTIVE_ALERT'
  | 'QUARANTINED'
  | 'UNDER_REVIEW'
  | 'CLOSED';

export type IncidentType =
  | 'ROAD_OBSTRUCTION'
  | 'SECURITY_GATHERING'
  | 'MISSING_PERSON'
  | 'CHECKPOINT'
  | 'CIVIL_UNREST'
  | 'COMMERCIAL_TRAFFIC'
  | 'HAZARD_SPILL'
  | 'INFRASTRUCTURE'
  | 'FLOODING'
  | 'OTHER';

export type ReportSourceType = 'FIRSTHAND' | 'HEARSAY' | 'UNKNOWN';

export type ReportInputType = 'TEXT' | 'IMAGE' | 'SCREENSHOT' | 'AUDIO';

export type AttestationType =
  | 'FIRSTHAND_WITNESS'
  | 'ACTIVE_CONTRADICTION'
  | 'HEARSAY_TRACKING';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserAccount {
  id: string;
  name: string;
  emailOrPhone: string;
  role: UserRole;
  status: UserAccountStatus;
  lastLoginAt: string | null;
  locationPermission: boolean;
  notificationsEnabled: boolean;
  notificationRadiusKm: number;
  assignedCorridor?: string;
  createdAt?: string;
}

export interface TriageAuditResult {
  completenessScore: number; // 0 - 100
  missingActionableDetails: string[];
  duplicateChainDetected: boolean;
  duplicateChainConfidence: number; // 0 - 100
  suggestedVerificationChecks: string[];
  triageNotes: string;
  quarantined: boolean;
  quarantineReason?: string;
}

export interface IncidentReport {
  id: string;
  userId: string;
  reporterLabel?: string;
  incidentId?: string; // Linked incident
  incidentType: IncidentType;
  rawText: string;
  sourceType: ReportSourceType;
  inputType: ReportInputType;
  mediaUrl?: string;
  locationLabel: string;
  coordinates: Coordinates; // Private exact coordinates
  latitude?: number;
  longitude?: number;
  eventTime: string;
  isHappeningNow: boolean;
  submittedAt: string;
  createdAt?: string;
  triageStatus?: 'AUDITED' | 'QUARANTINED' | 'PENDING' | 'REJECTED';
  triageAudit: TriageAuditResult;
  extractedDetails?: {
    incidentType: string;
    landmark: string;
    approximateTime: string;
    severityKeywords: string[];
  };
  missingDetails?: string[];
  moderationStatus: 'PENDING' | 'APPROVED' | 'QUARANTINED' | 'REJECTED';
}

export interface Attestation {
  id: string;
  incidentId: string;
  userId: string;
  userRole: UserRole;
  type: AttestationType;
  action?: AttestationType; // Backend alias
  observation: string;
  comment?: string; // Backend alias
  observedAt: string;
  locationObserved: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  isStillActive?: boolean;
  contradictionDetails?: string;
  hearsaySource?: string;
  isForwardedMessage?: boolean;
  submittedAt: string;
  createdAt?: string;
}

export interface Incident {
  id: string;
  title: string;
  incidentType: IncidentType;
  state: IncidentState;
  triageStatus: TriageStatus;
  locationLabel: string;
  approximateArea?: string;
  coordinates: Coordinates; // Stored for Haversine
  latitude?: number; // Public masked coordinate
  longitude?: number; // Public masked coordinate
  summary?: string;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  distanceKm?: number;
  firstReportedAt: string;
  lastReaffirmedAt: string;
  expiresAt: string; // TTL window
  reportCount: number;
  firsthandCount: number;
  contradictionCount: number;
  hearsayCount: number;
  supportingFacts: string[];
  contradictingFacts: string[];
  missingDetails: string[];
  suggestedVerificationChecks: string[];
  synthesisSummary: string;
  convergenceStatus: 'CONVERGING' | 'DIVERGING' | 'STATIC';
  createdAt?: string;
  updatedAt?: string;
  confirmedByAnchor?: {
    anchorName: string;
    anchorTitle: string;
    confirmedAt: string;
    notes: string;
  };
  resolvedBy?: {
    name: string;
    role: string;
    resolvedAt: string;
    reason: string;
  };
}

export interface ReportLinkage {
  type: 'LINKED_TO_EXISTING_INCIDENT' | 'USED_TO_CREATE_INCIDENT';
  distanceKm?: number;
  incidentId: string;
}

export interface StateTransitionResult {
  previousState: IncidentState;
  nextState: IncidentState;
  reason: string;
  shouldNotify: boolean;
}

export interface NotificationItem {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  incidentState: IncidentState;
  locationLabel: string;
  distanceBand: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetId: string;
  details: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  eventType:
    | 'REPORT_SUBMITTED'
    | 'ATTESTATION_ADDED'
    | 'STATE_TRANSITION'
    | 'ANCHOR_CONFIRMED'
    | 'INCIDENT_RESOLVED'
    | 'TTL_DEGRADED';
  actorLabel: string;
  actorRole: UserRole;
  description: string;
  metadata?: Record<string, unknown>;
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
