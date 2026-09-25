import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHaversineDistance, formatDistanceBand, isWithinClusterRadius, maskCoordinates } from '../haversine';
import { evaluateIncidentState } from '../stateMachine';
import { heuristicTriageAudit } from '../deepseek';
import { signalStore, DEFAULT_USER_COORDINATES } from '../store';
import { Incident } from '@/types';

describe('SignalNG Hyper-Local Crisis Triage Engine', () => {
  beforeEach(() => {
    signalStore.resetToDefaultSeed();
  });

  describe('Pillar 1: Haversine Proximity & Radius Mechanics', () => {
    it('calculates accurate distance between Lugbe landmarks', () => {
      // Lugbe Market Central (8.9806, 7.3762) to North Gate (8.9845, 7.3789)
      const coord1 = { latitude: 8.9806, longitude: 7.3762 };
      const coord2 = { latitude: 8.9845, longitude: 7.3789 };
      const dist = calculateHaversineDistance(coord1, coord2);

      expect(dist).toBeGreaterThan(0.3);
      expect(dist).toBeLessThan(0.8);
    });

    it('formats human-friendly distance bands without exposing raw GPS in feeds', () => {
      expect(formatDistanceBand(0.2)).toContain('Immediate vicinity');
      expect(formatDistanceBand(0.8)).toContain('Within 800m');
      expect(formatDistanceBand(3.2, 'Lugbe Corridor')).toContain('3.2 km away (Lugbe Corridor)');
    });

    it('correctly determines 1.5 km cluster radius for incident linking', () => {
      const p1 = { latitude: 8.9806, longitude: 7.3762 };
      const nearbyPoint = { latitude: 8.9845, longitude: 7.3789 }; // ~0.5 km
      const farPoint = { latitude: 9.05, longitude: 7.45 }; // ~10 km

      expect(isWithinClusterRadius(p1, nearbyPoint, 1.5)).toBe(true);
      expect(isWithinClusterRadius(p1, farPoint, 1.5)).toBe(false);
    });

    it('masks exact private GPS coordinates for public responses', () => {
      const exact = { latitude: 8.984512, longitude: 7.378945 };
      const masked = maskCoordinates(exact);

      expect(masked.latitude).toBe(8.98);
      expect(masked.longitude).toBe(7.38);
    });
  });

  describe('Pillar 2: AI Triage Auditor & Duplicate Chain Identifier', () => {
    it('awards high completeness score for reports with timestamps and concrete landmarks', () => {
      const input = 'Just drove past Market North Exit at 6:32 PM on my bike. White tanker broke down spilling fuel in right lane.';
      const audit = heuristicTriageAudit(input, 'HAZARD_SPILL', 'Lugbe Market Northbound Exit');

      expect(audit.completenessScore).toBeGreaterThanOrEqual(80);
      expect(audit.duplicateChainDetected).toBe(false);
      expect(audit.suggestedVerificationChecks.length).toBeGreaterThanOrEqual(2);
    });

    it('detects viral copy-paste WhatsApp chains and flags duplicate forward signature', () => {
      const viralForward = 'FORWARDED AS RECEIVED: URGENT TO ALL LUGBE PARENTS!! Bad boys are gathering with weapons near bridge! Share to all groups!!';
      const audit = heuristicTriageAudit(viralForward, 'ROAD_OBSTRUCTION', 'Eastern River Bypass');

      expect(audit.duplicateChainDetected).toBe(true);
      expect(audit.duplicateChainConfidence).toBeGreaterThanOrEqual(80);
      expect(audit.missingActionableDetails.length).toBeGreaterThanOrEqual(1);
    });

    it('generates low-risk verification coaching without sending civilians into danger', () => {
      const input = 'Someone said checkpoint was established at bridge.';
      const audit = heuristicTriageAudit(input, 'CHECKPOINT', 'Bridge');

      const allChecks = audit.suggestedVerificationChecks.join(' ');
      expect(allChecks.toLowerCase()).toContain('stationary');
      expect(allChecks.toLowerCase()).toContain('not travel');
    });
  });

  describe('Pillar 3 & 4: Deterministic 4-Stage State Machine & Attestation Engine', () => {
    const baseIncident: Incident = {
      id: 'test-inc-1',
      title: 'Sample Test Incident',
      incidentType: 'ROAD_OBSTRUCTION',
      state: 'UNVERIFIED',
      triageStatus: 'STAGED',
      locationLabel: 'Test Landmark',
      approximateArea: 'Test Area',
      coordinates: { latitude: 8.98, longitude: 7.37 },
      firstReportedAt: new Date().toISOString(),
      lastReaffirmedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      reportCount: 1,
      firsthandCount: 1,
      contradictionCount: 0,
      hearsayCount: 0,
      supportingFacts: ['Firsthand observation logged'],
      contradictingFacts: [],
      missingDetails: [],
      suggestedVerificationChecks: ['Check union desk'],
      synthesisSummary: 'Awaiting corroboration',
      convergenceStatus: 'STATIC',
    };

    it('remains UNVERIFIED with only 1 firsthand witness', () => {
      const res = evaluateIncidentState({ ...baseIncident, firsthandCount: 1 });
      expect(res.newState).toBe('UNVERIFIED');
      expect(res.triggersPerimeterNotification).toBe(false);
    });

    it('transitions to CORROBORATED when 2 independent firsthand witnesses report without contradiction', () => {
      const res = evaluateIncidentState({ ...baseIncident, firsthandCount: 2, contradictionCount: 0 });
      expect(res.newState).toBe('CORROBORATED');
      expect(res.triggersPerimeterNotification).toBe(true);
    });

    it('transitions to CONFLICTING when active contradictions are logged against firsthand sightings', () => {
      const res = evaluateIncidentState({
        ...baseIncident,
        firsthandCount: 2,
        contradictionCount: 1,
        state: 'CORROBORATED',
      });
      expect(res.newState).toBe('CONFLICTING');
      expect(res.triggersPerimeterNotification).toBe(false);
    });

    it('transitions to CONFIRMED when formal stationary community anchor confirms', () => {
      const res = evaluateIncidentState({
        ...baseIncident,
        firsthandCount: 1,
        confirmedByAnchor: {
          anchorName: 'Musa Ibrahim',
          anchorTitle: 'NURTW Corridor Chair',
          confirmedAt: new Date().toISOString(),
          notes: 'Verified on site',
        },
      });
      expect(res.newState).toBe('CONFIRMED');
      expect(res.triggersPerimeterNotification).toBe(true);
    });

    it('degrades to STALE after TTL window expires without fresh reaffirmations', () => {
      const staleTime = new Date(Date.now() - 90 * 60 * 1000).toISOString(); // 90 mins ago
      const res = evaluateIncidentState({
        ...baseIncident,
        firsthandCount: 3,
        lastReaffirmedAt: staleTime,
      });
      expect(res.newState).toBe('STALE');
      expect(res.triggersPerimeterNotification).toBe(false);
    });
  });

  describe('SignalStore Flow Integration', () => {
    it('links new report within 1.5 km cluster radius to existing incident', () => {
      const result = signalStore.submitReport({
        incidentType: 'HAZARD_SPILL',
        rawText: 'Second vehicle confirming fuel spillage near market northbound gate.',
        sourceType: 'FIRSTHAND',
        inputType: 'TEXT',
        locationLabel: 'Lugbe Market Central Northbound Exit',
        coordinates: { latitude: 8.9845, longitude: 7.3789 },
        eventTime: '6:35 PM',
        isHappeningNow: true,
        triageAudit: {
          completenessScore: 85,
          missingActionableDetails: [],
          duplicateChainDetected: false,
          duplicateChainConfidence: 0,
          suggestedVerificationChecks: ['Check union gate'],
          triageNotes: 'Linked report',
          quarantined: false,
        },
      });

      expect(result.isNewIncident).toBe(false);
      expect(result.linkedIncident.id).toBe('inc-001');
    });

    it('records structured contradiction attestation and flips state to CONFLICTING', () => {
      const attResult = signalStore.submitAttestation({
        incidentId: 'inc-001',
        type: 'ACTIVE_CONTRADICTION',
        observation: 'Road has been completely swept and diesel cleared. Traffic moving freely.',
        observedAt: '6:38 PM',
        locationObserved: 'Market Northbound Exit',
        contradictionDetails: 'Clear roadway without obstruction.',
      });

      expect(attResult.updatedIncident.contradictionCount).toBeGreaterThanOrEqual(1);
      expect(attResult.updatedIncident.state).toBe('CONFLICTING');
    });
  });
});
