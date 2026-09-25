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
import { isWithinClusterRadius, calculateHaversineDistance } from './haversine';
import { evaluateIncidentState } from './stateMachine';
import { heuristicTriageAudit } from './deepseek';

// Default mock current user coordinates: Lugbe Market Central, Abuja
export const DEFAULT_USER_COORDINATES: Coordinates = {
  latitude: 8.9806,
  longitude: 7.3762,
};

class SignalStore {
  private currentUser: UserAccount | null = null;
  private userCoordinates: Coordinates = { ...DEFAULT_USER_COORDINATES };
  private incidents: Incident[] = [...INITIAL_INCIDENTS];
  private reports: IncidentReport[] = [...INITIAL_REPORTS];
  private attestations: Attestation[] = [...INITIAL_ATTESTATIONS];
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
  private readNotificationIds: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      if (this.currentUser) {
        localStorage.setItem('signalng_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('signalng_current_user');
      }
      localStorage.setItem('signalng_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('signalng_reports', JSON.stringify(this.reports));
      localStorage.setItem('signalng_attestations', JSON.stringify(this.attestations));
      localStorage.setItem('signalng_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('signalng_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('signalng_read_notifs', JSON.stringify(Array.from(this.readNotificationIds)));
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
      const savedRead = localStorage.getItem('signalng_read_notifs');

      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = null;
      }
      if (savedIncidents) this.incidents = JSON.parse(savedIncidents);
      if (savedReports) this.reports = JSON.parse(savedReports);
      if (savedAttestations) this.attestations = JSON.parse(savedAttestations);
      if (savedNotifs) this.notifications = JSON.parse(savedNotifs);
      if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
      if (savedRead) this.readNotificationIds = new Set(JSON.parse(savedRead));
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
  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public setCurrentUser(user: UserAccount | null) {
    this.currentUser = user ? { ...user } : null;
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
      userId: this.currentUser?.id || 'anon',
      reporterLabel: this.currentUser?.name || 'Anonymous Resident',
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
      userId: this.currentUser?.id || 'anon',
      userRole: this.currentUser?.role || 'RESIDENT',
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

    const anchorName = this.currentUser?.name || 'Community Anchor';
    const anchorTitle = this.currentUser?.assignedCorridor || 'Stationary Corridor Anchor';

    incident.confirmedByAnchor = {
      anchorName,
      anchorTitle,
      confirmedAt: new Date().toISOString(),
      notes,
    };
    incident.state = 'CONFIRMED';
    incident.triageStatus = 'ACTIVE_ALERT';
    incident.lastReaffirmedAt = new Date().toISOString();

    this.triggerNotification(
      incident.id,
      'VERIFIED BY COMMUNITY ANCHOR',
      `Formally verified by ${anchorName}. ${notes}`,
      'CONFIRMED',
      incident.locationLabel
    );

    this.logAudit(
      'FORMAL_ANCHOR_CONFIRMATION',
      incident.id,
      `Formally confirmed incident by anchor ${anchorName}. Notes: ${notes}`
    );

    this.notify();
    return incident;
  }

  public resolveIncident(incidentId: string, reason: string): Incident {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) throw new Error('Incident not found');

    const resolverName = this.currentUser?.name || 'Authorized Staff';
    const resolverRole = this.currentUser?.role || 'MODERATOR';

    incident.resolvedBy = {
      name: resolverName,
      role: resolverRole,
      resolvedAt: new Date().toISOString(),
      reason,
    };
    incident.state = 'RESOLVED';
    incident.triageStatus = 'CLOSED';

    this.logAudit(
      'RESOLVE_INCIDENT',
      incident.id,
      `Resolved incident by ${resolverName} (${resolverRole}). Reason: ${reason}`
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
    this.notify();
  }

  public syncNotificationsFromIncidents(incidents: Incident[], userCoords?: Coordinates) {
    const coords = userCoords || this.userCoordinates;
    const generatedNotifs: NotificationItem[] = [];

    incidents.forEach((inc) => {
      if (inc.state === 'RESOLVED') return;
      const incCoords = inc.coordinates || { latitude: inc.latitude || 0, longitude: inc.longitude || 0 };
      const dist = calculateHaversineDistance(coords, incCoords);
      const isWithinRadius = dist <= 5.0 || (typeof inc.distanceKm === 'number' && inc.distanceKm <= 5.0);

      if (isWithinRadius) {
        const notifId = `notif-${inc.id}`;
        let title = 'COMMUNITY REPORT';
        if (inc.state === 'CONFIRMED') {
          title = 'VERIFIED BY COMMUNITY ANCHOR';
        } else if (inc.state === 'CONFLICTING') {
          title = 'CONFLICTING REPORTS';
        } else if (inc.state === 'CORROBORATED') {
          title = 'COMMUNITY REPORT (CONFIRMED BY 2+)';
        }

        const effectiveDist = typeof inc.distanceKm === 'number' ? inc.distanceKm : dist;
        const distanceText = effectiveDist < 1 ? 'Under 1 km away' : `${effectiveDist.toFixed(1)} km away`;
        const summaryText =
          inc.summary ||
          inc.synthesisSummary ||
          `${inc.incidentType.replace(/_/g, ' ')} active near ${inc.locationLabel}. Direct eyewitness observations requested.`;

        generatedNotifs.push({
          id: notifId,
          incidentId: inc.id,
          title,
          message: summaryText,
          incidentState: inc.state,
          locationLabel: inc.locationLabel,
          distanceBand: distanceText,
          createdAt: inc.firstReportedAt || inc.createdAt || new Date().toISOString(),
          read: this.readNotificationIds.has(notifId),
        });
      }
    });

    if (generatedNotifs.length > 0) {
      this.notifications = generatedNotifs;
      this.notify();
    }
  }

  public getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string) {
    this.readNotificationIds.add(id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('signalng_read_notifs', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch {}
    }
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => {
      n.read = true;
      this.readNotificationIds.add(n.id);
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('signalng_read_notifs', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch {}
    }
    this.notify();
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
      actorName: this.currentUser?.name || 'System / Anonymous',
      actorRole: this.currentUser?.role || 'RESIDENT',
      action,
      targetId,
      details,
    };
    this.auditLogs.unshift(entry);
  }

  public resetToDefaultSeed() {
    this.currentUser = null;
    this.incidents = [...INITIAL_INCIDENTS];
    this.reports = [...INITIAL_REPORTS];
    this.attestations = [...INITIAL_ATTESTATIONS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.notify();
  }
}

export const signalStore = new SignalStore();
