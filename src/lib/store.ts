import {
  Attestation,
  AuditLogEntry,
  Coordinates,
  Incident,
  IncidentReport,
  IncidentState,
  NotificationItem,
  UserAccount,
  UserRole,
} from '@/types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_ATTESTATIONS,
  INITIAL_INCIDENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  MOCK_USERS,
} from './mockData';
import { isWithinClusterRadius } from './haversine';
import { evaluateIncidentState } from './stateMachine';
import { heuristicTriageAudit } from './deepseek';

// Default mock current user coordinates: Lugbe Market Central, Abuja
export const DEFAULT_USER_COORDINATES: Coordinates = {
  latitude: 8.9806,
  longitude: 7.3762,
};

class SignalStore {
  private currentUser: UserAccount = MOCK_USERS[0]; // Amara (Resident)
  private userCoordinates: Coordinates = { ...DEFAULT_USER_COORDINATES };
  private incidents: Incident[] = [...INITIAL_INCIDENTS];
  private reports: IncidentReport[] = [...INITIAL_REPORTS];
  private attestations: Attestation[] = [...INITIAL_ATTESTATIONS];
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('signalng_current_user', JSON.stringify(this.currentUser));
      localStorage.setItem('signalng_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('signalng_reports', JSON.stringify(this.reports));
      localStorage.setItem('signalng_attestations', JSON.stringify(this.attestations));
      localStorage.setItem('signalng_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('signalng_audit_logs', JSON.stringify(this.auditLogs));
    } catch {
      // Storage quota or SSR fallback
    }
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('signalng_current_user');
      const savedIncidents = localStorage.getItem('signalng_incidents');
      const savedReports = localStorage.getItem('signalng_reports');
      const savedAttestations = localStorage.getItem('signalng_attestations');
      const savedNotifs = localStorage.getItem('signalng_notifications');
      const savedLogs = localStorage.getItem('signalng_audit_logs');

      if (savedUser) this.currentUser = JSON.parse(savedUser);
      if (savedIncidents) this.incidents = JSON.parse(savedIncidents);
      if (savedReports) this.reports = JSON.parse(savedReports);
      if (savedAttestations) this.attestations = JSON.parse(savedAttestations);
      if (savedNotifs) this.notifications = JSON.parse(savedNotifs);
      if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
    } catch {
      // Reset to initial mock data on error
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((listener) => listener());
  }

  // --- User & Role Management ---
  public getCurrentUser(): UserAccount {
    return this.currentUser;
  }

  public switchRole(role: UserRole) {
    const foundUser = MOCK_USERS.find((u) => u.role === role) || {
      id: `user-${role.toLowerCase()}`,
      name: `User (${role})`,
      emailOrPhone: `user@signalng-${role.toLowerCase()}.ng`,
      role,
      status: 'ACTIVE',
      lastLoginAt: 'Just now',
      locationPermission: true,
      notificationsEnabled: true,
      notificationRadiusKm: 5.0,
    };
    this.currentUser = foundUser;
    this.notify();
  }

  public getUserCoordinates(): Coordinates {
    return this.userCoordinates;
  }

  public setUserCoordinates(coords: Coordinates) {
    this.userCoordinates = coords;
    this.notify();
  }

  // --- Incidents Access ---
  public getIncidents(): Incident[] {
    // Run lazy TTL evaluation
    const now = Date.now();
    let changed = false;
    this.incidents.forEach((inc) => {
      const evalResult = evaluateIncidentState(inc, now);
      if (evalResult.stateChanged) {
        inc.state = evalResult.newState;
        changed = true;
      }
    });
    if (changed) {
      this.saveToLocalStorage();
    }
    return [...this.incidents];
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.getIncidents().find((i) => i.id === id);
  }

  // --- Reports & Triage Ingestion ---
  public submitReport(
    reportInput: Omit<IncidentReport, 'id' | 'submittedAt' | 'userId' | 'moderationStatus'>
  ): { report: IncidentReport; linkedIncident: Incident; isNewIncident: boolean } {
    const reportId = `rep-${Date.now().toString().slice(-4)}`;
    const newReport: IncidentReport = {
      ...reportInput,
      id: reportId,
      userId: this.currentUser.id,
      reporterLabel: this.currentUser.name,
      submittedAt: new Date().toISOString(),
      moderationStatus: reportInput.triageAudit.quarantined ? 'QUARANTINED' : 'PENDING',
    };

    // Check if within 1.5 km cluster radius of an active incident of matching type
    let linkedIncident = this.incidents.find(
      (inc) =>
        inc.state !== 'RESOLVED' &&
        inc.incidentType === newReport.incidentType &&
        isWithinClusterRadius(inc.coordinates, newReport.coordinates, 1.5)
    );

    let isNewIncident = false;

    if (!linkedIncident) {
      isNewIncident = true;
      const newIncidentId = `inc-${Date.now().toString().slice(-4)}`;
      linkedIncident = {
        id: newIncidentId,
        title: `${newReport.incidentType.replace(/_/g, ' ')} near ${newReport.locationLabel}`,
        incidentType: newReport.incidentType,
        state: 'UNVERIFIED',
        triageStatus: newReport.triageAudit.quarantined ? 'QUARANTINED' : 'STAGED',
        locationLabel: newReport.locationLabel,
        approximateArea: newReport.locationLabel,
        coordinates: newReport.coordinates,
        firstReportedAt: new Date().toISOString(),
        lastReaffirmedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        reportCount: 1,
        firsthandCount: newReport.sourceType === 'FIRSTHAND' ? 1 : 0,
        contradictionCount: 0,
        hearsayCount: newReport.sourceType === 'HEARSAY' ? 1 : 0,
        supportingFacts: [newReport.rawText],
        contradictingFacts: [],
        missingDetails: newReport.triageAudit.missingActionableDetails,
        suggestedVerificationChecks: newReport.triageAudit.suggestedVerificationChecks,
        synthesisSummary: `Initial report logged. Awaiting additional observation.`,
        convergenceStatus: 'STATIC',
      };
      this.incidents.unshift(linkedIncident);
    } else {
      // Link to existing incident
      linkedIncident.reportCount += 1;
      linkedIncident.lastReaffirmedAt = new Date().toISOString();
      linkedIncident.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      if (newReport.sourceType === 'FIRSTHAND') {
        linkedIncident.firsthandCount += 1;
        linkedIncident.supportingFacts.push(newReport.rawText);
      } else if (newReport.sourceType === 'HEARSAY') {
        linkedIncident.hearsayCount += 1;
      }

      // Recalculate state machine
      const evalResult = evaluateIncidentState(linkedIncident);
      if (evalResult.stateChanged) {
        linkedIncident.state = evalResult.newState;
        if (evalResult.triggersPerimeterNotification) {
          this.triggerNotification(
            linkedIncident.id,
            evalResult.newState === 'CONFIRMED'
              ? 'VERIFIED BY COMMUNITY ANCHOR'
              : 'COMMUNITY REPORT (UNCONFIRMED)',
            evalResult.notificationMessage ||
              `Telemetry update at ${linkedIncident.locationLabel}.`,
            evalResult.newState,
            linkedIncident.locationLabel
          );
        }
      }
    }

    newReport.incidentId = linkedIncident.id;
    this.reports.unshift(newReport);

    this.notify();
    return { report: newReport, linkedIncident, isNewIncident };
  }

  // --- Structured Attestations ---
  public submitAttestation(
    attestationInput: Omit<Attestation, 'id' | 'submittedAt' | 'userId' | 'userRole'>
  ): { attestation: Attestation; updatedIncident: Incident; stateChanged: boolean } {
    const attId = `att-${Date.now().toString().slice(-4)}`;
    const newAttestation: Attestation = {
      ...attestationInput,
      id: attId,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      submittedAt: new Date().toISOString(),
    };

    const incident = this.incidents.find((i) => i.id === attestationInput.incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    incident.lastReaffirmedAt = new Date().toISOString();
    incident.expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    if (newAttestation.type === 'FIRSTHAND_WITNESS') {
      incident.firsthandCount += 1;
      incident.supportingFacts.push(newAttestation.observation);
    } else if (newAttestation.type === 'ACTIVE_CONTRADICTION') {
      incident.contradictionCount += 1;
      incident.contradictingFacts.push(newAttestation.observation);
    } else if (newAttestation.type === 'HEARSAY_TRACKING') {
      incident.hearsayCount += 1;
    }

    // Evaluate state machine
    const evalResult = evaluateIncidentState(incident);
    const stateChanged = evalResult.stateChanged;
    if (stateChanged) {
      incident.state = evalResult.newState;
      if (evalResult.triggersPerimeterNotification) {
        this.triggerNotification(
          incident.id,
          evalResult.newState === 'CONFIRMED'
            ? 'VERIFIED BY COMMUNITY ANCHOR'
            : 'COMMUNITY REPORT (UNCONFIRMED)',
          evalResult.notificationMessage ||
            `Telemetry update at ${incident.locationLabel}.`,
          evalResult.newState,
          incident.locationLabel
        );
      }
    }

    this.attestations.unshift(newAttestation);
    this.notify();

    return { attestation: newAttestation, updatedIncident: incident, stateChanged };
  }

  // --- Anchor Actions ---
  public confirmIncidentAsAnchor(incidentId: string, notes: string): Incident {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.confirmedByAnchor = {
      anchorName: this.currentUser.name,
      anchorTitle: this.currentUser.assignedCorridor || 'Stationary Corridor Anchor',
      confirmedAt: new Date().toISOString(),
      notes,
    };
    incident.state = 'CONFIRMED';
    incident.triageStatus = 'ACTIVE_ALERT';
    incident.lastReaffirmedAt = new Date().toISOString();

    this.triggerNotification(
      incident.id,
      'VERIFIED BY COMMUNITY ANCHOR',
      `Formally verified by ${this.currentUser.name}. ${notes}`,
      'CONFIRMED',
      incident.locationLabel
    );

    this.logAudit(
      'FORMAL_ANCHOR_CONFIRMATION',
      incident.id,
      `Formally confirmed incident by anchor ${this.currentUser.name}. Notes: ${notes}`
    );

    this.notify();
    return incident;
  }

  public resolveIncident(incidentId: string, reason: string): Incident {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.resolvedBy = {
      name: this.currentUser.name,
      role: this.currentUser.role,
      resolvedAt: new Date().toISOString(),
      reason,
    };
    incident.state = 'RESOLVED';
    incident.triageStatus = 'CLOSED';

    this.logAudit(
      'RESOLVE_INCIDENT',
      incident.id,
      `Resolved incident by ${this.currentUser.name} (${this.currentUser.role}). Reason: ${reason}`
    );

    this.notify();
    return incident;
  }

  // --- Moderator Actions ---
  public quarantineReport(reportId: string, reason: string) {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.moderationStatus = 'QUARANTINED';
      report.triageAudit.quarantined = true;
      report.triageAudit.quarantineReason = reason;
      this.logAudit('QUARANTINE_REPORT', report.id, reason);
      this.notify();
    }
  }

  public approveReport(reportId: string) {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.moderationStatus = 'APPROVED';
      report.triageAudit.quarantined = false;
      this.logAudit('APPROVE_REPORT', report.id, 'Approved by moderator review');
      this.notify();
    }
  }

  // --- Notifications & Audit ---
  private triggerNotification(
    incidentId: string,
    title: string,
    message: string,
    state: IncidentState,
    locationLabel: string
  ) {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      incidentId,
      title,
      message,
      incidentState: state,
      locationLabel,
      distanceBand: 'Within 5 km notification perimeter',
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(notif);
  }

  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  public getReports(): IncidentReport[] {
    return [...this.reports];
  }

  public getAttestations(): Attestation[] {
    return [...this.attestations];
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  private logAudit(action: string, targetId: string, details: string) {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action,
      targetId,
      details,
    };
    this.auditLogs.unshift(entry);
  }

  public resetToDefaultSeed() {
    this.currentUser = MOCK_USERS[0];
    this.incidents = [...INITIAL_INCIDENTS];
    this.reports = [...INITIAL_REPORTS];
    this.attestations = [...INITIAL_ATTESTATIONS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.notify();
  }
}

export const signalStore = new SignalStore();
