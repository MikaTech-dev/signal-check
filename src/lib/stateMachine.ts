import { Incident, IncidentState } from '@/types';

export interface StateEvaluationResult {
  previousState: IncidentState;
  newState: IncidentState;
  stateChanged: boolean;
  triggersPerimeterNotification: boolean;
  notificationMessage?: string;
  reason: string;
}

const DEFAULT_TTL_MINUTES = 60;

/**
 * Evaluates the deterministic state machine for an incident based on counts,
 * anchor verifications, contradictions, and TTL decay.
 */
export function evaluateIncidentState(
  incident: Incident,
  currentTimeMs: number = Date.now()
): StateEvaluationResult {
  const previousState = incident.state;

  // 1. Check if already manually resolved
  if (incident.resolvedBy) {
    return {
      previousState,
      newState: 'RESOLVED',
      stateChanged: previousState !== 'RESOLVED',
      triggersPerimeterNotification: false,
      reason: `Marked resolved by ${incident.resolvedBy.name} (${incident.resolvedBy.role}).`,
    };
  }

  // 2. Check if confirmed by designated stationary community anchor
  if (incident.confirmedByAnchor) {
    const isNewConfirmation = previousState !== 'CONFIRMED';
    return {
      previousState,
      newState: 'CONFIRMED',
      stateChanged: isNewConfirmation,
      triggersPerimeterNotification: isNewConfirmation,
      notificationMessage: `Formally verified by ${incident.confirmedByAnchor.anchorName} (${incident.confirmedByAnchor.anchorTitle}). Details verified by local anchor.`,
      reason: `Formally verified by community anchor ${incident.confirmedByAnchor.anchorName}.`,
    };
  }

  // 3. Check for TTL expiration / staleness
  const lastReaffirmMs = new Date(incident.lastReaffirmedAt).getTime();
  const timeElapsedMinutes = (currentTimeMs - lastReaffirmMs) / (1000 * 60);

  if (timeElapsedMinutes > DEFAULT_TTL_MINUTES) {
    return {
      previousState,
      newState: 'STALE',
      stateChanged: previousState !== 'STALE',
      triggersPerimeterNotification: false,
      reason: `No recent firsthand reaffirmations logged in the last ${Math.round(timeElapsedMinutes)} minutes.`,
    };
  }

  // 4. Check for active contradictions
  if (incident.contradictionCount > 0 && incident.firsthandCount > 0) {
    return {
      previousState,
      newState: 'CONFLICTING',
      stateChanged: previousState !== 'CONFLICTING',
      triggersPerimeterNotification: false,
      reason: `Discrepancy detected: ${incident.firsthandCount} firsthand observation(s) vs ${incident.contradictionCount} active contradiction(s).`,
    };
  }

  // 5. Check for corroboration: 2 or more independent firsthand witnesses
  if (incident.firsthandCount >= 2 && incident.contradictionCount === 0) {
    const isNewCorroboration = previousState !== 'CORROBORATED';
    return {
      previousState,
      newState: 'CORROBORATED',
      stateChanged: isNewCorroboration,
      triggersPerimeterNotification: isNewCorroboration,
      notificationMessage: `COMMUNITY REPORT (UNCONFIRMED): Multiple independent firsthand witnesses report activity near ${incident.locationLabel}. Caution advised.`,
      reason: `Corroborated by ${incident.firsthandCount} independent firsthand eyewitness reports.`,
    };
  }

  // 6. Default to Unverified / Staged
  return {
    previousState,
    newState: 'UNVERIFIED',
    stateChanged: previousState !== 'UNVERIFIED',
    triggersPerimeterNotification: false,
    reason: `Single report or pending firsthand eyewitness corroboration.`,
  };
}
