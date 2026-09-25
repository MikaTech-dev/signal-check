import {
  Attestation,
  AuditLogEntry,
  Incident,
  IncidentReport,
  NotificationItem,
  UserAccount,
} from '@/types';

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'user-resident-1',
    name: 'Amara Okoye',
    emailOrPhone: 'amara.okoye@sample.org',
    role: 'RESIDENT',
    status: 'ACTIVE',
    lastLoginAt: 'Today, 6:40 PM',
    locationPermission: true,
    notificationsEnabled: true,
    notificationRadiusKm: 5.0,
    assignedCorridor: 'Lugbe Commercial Corridor',
  },
  {
    id: 'user-anchor-1',
    name: 'Musa Ibrahim',
    emailOrPhone: 'musa.ibrahim@nurtw-corridor.ng',
    role: 'ANCHOR',
    status: 'ACTIVE',
    lastLoginAt: 'Today, 6:15 PM',
    locationPermission: true,
    notificationsEnabled: true,
    notificationRadiusKm: 10.0,
    assignedCorridor: 'Airport Road / Lugbe Interchange',
  },
  {
    id: 'user-moderator-1',
    name: 'Tari Davies',
    emailOrPhone: 'tari.davies@civic-triage.ng',
    role: 'MODERATOR',
    status: 'ACTIVE',
    lastLoginAt: 'Today, 6:30 PM',
    locationPermission: true,
    notificationsEnabled: true,
    notificationRadiusKm: 15.0,
  },
  {
    id: 'user-admin-1',
    name: 'Adaeze Nwosu',
    emailOrPhone: 'adaeze.nwosu@signalng-hub.org',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLoginAt: 'Today, 5:50 PM',
    locationPermission: true,
    notificationsEnabled: true,
    notificationRadiusKm: 20.0,
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Fuel Tanker Spillage and Blocked Northbound Lane',
    incidentType: 'HAZARD_SPILL',
    state: 'CORROBORATED',
    triageStatus: 'ACTIVE_ALERT',
    locationLabel: 'Lugbe Market Central Northbound Exit',
    approximateArea: 'Lugbe Commercial Sector',
    coordinates: { latitude: 8.9845, longitude: 7.3789 },
    firstReportedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    lastReaffirmedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 36 * 60 * 1000).toISOString(),
    reportCount: 4,
    firsthandCount: 3,
    contradictionCount: 0,
    hearsayCount: 1,
    supportingFacts: [
      'Tanker breakdown and diesel spill blocking right lane past fruit market exit.',
      'Local market wardens diverting smaller vehicles toward Eastern Bypass.',
      'Fire service vehicle arrived on scene at 6:28 PM.',
    ],
    contradictingFacts: [],
    missingDetails: ['Estimated clearance time by recovery tow truck.'],
    suggestedVerificationChecks: [
      'Confirm clearance progress with the stationary NURTW gate coordinator.',
      'Check status with commercial dispatchers stationed at the Total station.',
      'Avoid driving through diesel slick.',
    ],
    synthesisSummary:
      'Strong convergence across 3 direct drivers and market wardens. Roadway restricted to single-file passage.',
    convergenceStatus: 'CONVERGING',
  },
  {
    id: 'inc-002',
    title: 'Disputed Roadblock Report vs Free Flow Observation',
    incidentType: 'ROAD_OBSTRUCTION',
    state: 'CONFLICTING',
    triageStatus: 'UNDER_REVIEW',
    locationLabel: 'Eastern River Bypass & Flyover Pillar 4',
    approximateArea: 'Eastern River Bypass',
    coordinates: { latitude: 8.9712, longitude: 7.3915 },
    firstReportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lastReaffirmedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    reportCount: 5,
    firsthandCount: 2,
    contradictionCount: 2,
    hearsayCount: 3,
    supportingFacts: [
      'Viral WhatsApp forward claims armed youth assembly near flyover pillar.',
    ],
    contradictingFacts: [
      'Tricycle rider Musa passed under pillar at 6:30 PM: Normal traffic, street hawkers present, no crowd.',
      'Private car driver Emeka crossed at 6:35 PM: Both lanes flowing at 40 km/h without disruption.',
    ],
    missingDetails: [
      'Whether the viral message originated from a previous week incident.',
    ],
    suggestedVerificationChecks: [
      'Call the stationary chemist shop situated opposite Pillar 4.',
      'Do not dispatch scouts to investigate.',
    ],
    synthesisSummary:
      'Severe divergence. Viral forwarded hysteria contradicts multiple direct commercial vehicle observations.',
    convergenceStatus: 'DIVERGING',
  },
  {
    id: 'inc-003',
    title: 'Missing Student Report near Lugbe Primary School',
    incidentType: 'MISSING_PERSON',
    state: 'UNVERIFIED',
    triageStatus: 'STAGED',
    locationLabel: 'Lugbe Primary School Extension Road',
    approximateArea: 'Lugbe Phase 1 Residential',
    coordinates: { latitude: 8.979, longitude: 7.368 },
    firstReportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    lastReaffirmedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 1000).toISOString(),
    reportCount: 1,
    firsthandCount: 1,
    contradictionCount: 0,
    hearsayCount: 0,
    supportingFacts: [
      '9-year-old student did not arrive home from evening tutoring class.',
    ],
    contradictingFacts: [],
    missingDetails: [
      'Exact clothing colors and school uniform crest details.',
      'Last confirmed departure time from tutoring center.',
      'Primary family contact phone or focal point.',
    ],
    suggestedVerificationChecks: [
      'Verify with the primary school headteacher or tutoring coordinator.',
      'Inquire with the stationery store keeper located at school gate.',
    ],
    synthesisSummary:
      'Single report staged. Awaiting family contact verification and critical physical description details.',
    convergenceStatus: 'STATIC',
  },
  {
    id: 'inc-004',
    title: 'Official Detour Confirmed at Airport Expressway Interchange',
    incidentType: 'CHECKPOINT',
    state: 'CONFIRMED',
    triageStatus: 'ACTIVE_ALERT',
    locationLabel: 'Airport Road Interchange Service Lane',
    approximateArea: 'Lugbe Airport Corridor',
    coordinates: { latitude: 8.995, longitude: 7.362 },
    firstReportedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    lastReaffirmedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
    reportCount: 6,
    firsthandCount: 5,
    contradictionCount: 0,
    hearsayCount: 1,
    supportingFacts: [
      'Official federal road safety diversion due to bridge joint maintenance.',
      'Service lane open; main expressway lane redirected into service lane.',
    ],
    contradictingFacts: [],
    missingDetails: [],
    suggestedVerificationChecks: [
      'Follow directional signage posted by road maintenance crew.',
    ],
    synthesisSummary:
      'Formally verified and managed by NURTW Airport Corridor Unit Chairman Musa Ibrahim.',
    convergenceStatus: 'CONVERGING',
    confirmedByAnchor: {
      anchorName: 'Musa Ibrahim',
      anchorTitle: 'NURTW Corridor Unit Chairman',
      confirmedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      notes:
        'Inspected personally at 6:10 PM. Maintenance crew is present with reflective cones and traffic wardens.',
    },
  },
];

export const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: 'rep-101',
    userId: 'user-resident-1',
    reporterLabel: 'Resident Amara',
    incidentId: 'inc-001',
    incidentType: 'HAZARD_SPILL',
    rawText:
      'Just drove past Northbound exit at 6:32 PM. Diesel tanker broke down and spilled fuel across right lane. Market wardens are waving cars left.',
    sourceType: 'FIRSTHAND',
    inputType: 'TEXT',
    locationLabel: 'Lugbe Market Central Northbound Exit',
    coordinates: { latitude: 8.9845, longitude: 7.3789 },
    eventTime: '6:32 PM',
    isHappeningNow: true,
    submittedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    triageAudit: {
      completenessScore: 92,
      missingActionableDetails: ['Expected tow recovery arrival time.'],
      duplicateChainDetected: false,
      duplicateChainConfidence: 0,
      suggestedVerificationChecks: [
        'Check with NURTW gate warden stationed at North exit.',
      ],
      triageNotes: 'High completeness firsthand telemetry with specific lane orientation.',
      quarantined: false,
    },
    moderationStatus: 'APPROVED',
  },
  {
    id: 'rep-102',
    userId: 'user-resident-1',
    reporterLabel: 'Anonymous Forward',
    incidentId: 'inc-002',
    incidentType: 'ROAD_OBSTRUCTION',
    rawText:
      'FORWARDED AS RECEIVED: URGENT TO ALL LUGBE RESIDENTS! Bad boys with cutlasses are blocking Eastern bridge flyover pillar right now! Share to all groups!!',
    sourceType: 'HEARSAY',
    inputType: 'SCREENSHOT',
    locationLabel: 'Eastern River Bypass & Flyover Pillar 4',
    coordinates: { latitude: 8.9712, longitude: 7.3915 },
    eventTime: 'Unspecified',
    isHappeningNow: false,
    submittedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    triageAudit: {
      completenessScore: 24,
      missingActionableDetails: [
        'Exact timestamp of sighting.',
        'Direct observer verification.',
        'Distinguishing specifics.',
      ],
      duplicateChainDetected: true,
      duplicateChainConfidence: 94,
      suggestedVerificationChecks: [
        'Call the stationary chemist opposite Pillar 4.',
        'Do not forward unverified panic messages.',
      ],
      triageNotes:
        'Viral copy-paste chain detected. Quarantined from independent corroboration count.',
      quarantined: true,
      quarantineReason:
        'Viral chain phraseology detected without primary eyewitness testimony.',
    },
    moderationStatus: 'QUARANTINED',
  },
];

export const INITIAL_ATTESTATIONS: Attestation[] = [
  {
    id: 'att-201',
    incidentId: 'inc-001',
    userId: 'user-resident-1',
    userRole: 'RESIDENT',
    type: 'FIRSTHAND_WITNESS',
    observation:
      'I am standing by the Total filling station. Fire truck has laid sand over the diesel spill. Traffic is crawling but moving.',
    observedAt: '6:36 PM',
    locationObserved: 'Total Station opposite Market Northbound Exit',
    isStillActive: true,
    submittedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'att-202',
    incidentId: 'inc-002',
    userId: 'user-anchor-1',
    userRole: 'ANCHOR',
    type: 'ACTIVE_CONTRADICTION',
    observation:
      'I just rode my motorcycle through Eastern Bypass Pillar 4 at 6:30 PM. Road is 100% peaceful. Hawkers are selling bread and water normally.',
    observedAt: '6:30 PM',
    locationObserved: 'Eastern River Bypass Pillar 4',
    contradictionDetails:
      'No blockage, no armed youth, normal evening transit confirmed.',
    submittedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    incidentId: 'inc-001',
    title: 'COMMUNITY REPORT (UNCONFIRMED)',
    message:
      'Multiple independent firsthand reports indicate a fuel tanker spillage near Lugbe Market Northbound Exit. Caution advised.',
    incidentState: 'CORROBORATED',
    locationLabel: 'Lugbe Market Central Northbound Exit',
    distanceBand: 'Within 1.2 km',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif-002',
    incidentId: 'inc-004',
    title: 'VERIFIED BY COMMUNITY ANCHOR',
    message:
      'Official road maintenance detour active at Airport Road Interchange Service Lane verified by NURTW Unit Chair Musa Ibrahim.',
    incidentState: 'CONFIRMED',
    locationLabel: 'Airport Road Interchange Service Lane',
    distanceBand: '2.8 km away (Airport Corridor)',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actorName: 'Musa Ibrahim',
    actorRole: 'ANCHOR',
    action: 'FORMAL_INCIDENT_CONFIRMATION',
    targetId: 'inc-004',
    details:
      'Verified Airport Road Interchange detour after on-site inspection.',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    actorName: 'Tari Davies',
    actorRole: 'MODERATOR',
    action: 'QUARANTINE_VIRAL_REPORT',
    targetId: 'rep-102',
    details:
      'Quarantined viral copy-paste WhatsApp screenshot with 94% duplicate confidence.',
  },
];
