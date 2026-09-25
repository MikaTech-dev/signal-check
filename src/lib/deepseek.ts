import { IncidentType, ReportInputType, ReportSourceType, TriageAuditResult } from '@/types';

const SYSTEM_TRIAGE_AUDIT_PROMPT = `
You are the SignalNG Crisis Triage Auditor powered by DeepSeek Flash.
Your objective: Audit community crisis chatter, extract actionable facts, verify detail completeness, flag viral duplicate forwarding chains, and generate low-risk verification checks without putting civilians in danger.

STRICT EPISTEMIC BOUNDARIES:
- You CANNOT declare an event "true" or "false".
- You CANNOT declare any route or area "safe".
- You strictly audit completeness, identify duplicate phrasing, and coach safe verification steps.
- ZERO em dashes. Use colons, hyphens, periods, or commas instead.

AUDIT TASKS:
1. Completeness Score (0-100): High score for concrete landmarks, exact times, observable specifics (colors, vehicle types, specific gate numbers). Low score for vague panic words ("run for your life", "trouble everywhere", "bad boys").
2. Missing Actionable Details: List 2 to 3 specific missing facts that would make this report actionable (e.g., "Exact gate or pillar number", "Direction of movement", "Time last seen").
3. Duplicate Chain Detection: Check if the text matches common viral forwarding templates ("URGENT FORWARD TO ALL", "Shared as received", "Warning to all parents").
4. "What Would Confirm This?" Verification Checks: 2 to 3 low-risk verification actions (e.g., "Contact the stationary NURTW transport desk at North Gate", "Inquire with the 24-hour pharmacy across the junction"). Explicitly warn against moving toward the danger area.
5. Quarantined status: Set to true if the message contains only pure unsourced panic or aggressive incitement without actionable details.

Return ONLY valid JSON matching this schema:
{
  "completenessScore": number,
  "missingActionableDetails": ["string"],
  "duplicateChainDetected": boolean,
  "duplicateChainConfidence": number,
  "suggestedVerificationChecks": ["string"],
  "triageNotes": "string",
  "quarantined": boolean,
  "quarantineReason": "string"
}
`;

/**
 * Robust heuristic triage auditor for offline testing and local demo execution.
 */
export function heuristicTriageAudit(
  rawText: string,
  incidentType: IncidentType,
  locationLabel: string
): TriageAuditResult {
  const textLower = rawText.toLowerCase();

  // Viral forwarding indicators
  const isViralForward =
    textLower.includes('forwarded as received') ||
    textLower.includes('forward to all') ||
    textLower.includes('urgent broadcast') ||
    textLower.includes('share to every group') ||
    textLower.includes('please pass this on') ||
    textLower.includes('breaking news on whatsapp') ||
    textLower.includes('heard from a sister') ||
    textLower.includes('cousin said');

  // Vague panic indicators
  const isVaguePanic =
    (textLower.includes('trouble everywhere') ||
      textLower.includes('everybody run') ||
      textLower.includes('bad boys are around') ||
      textLower.includes('stay away from outside') ||
      textLower.includes('danger danger')) &&
    !textLower.includes('pm') &&
    !textLower.includes('am') &&
    !textLower.includes('at the gate') &&
    !textLower.includes('near');

  // Specific detail detectors
  const hasTime =
    textLower.includes('pm') ||
    textLower.includes('am') ||
    textLower.includes('mins ago') ||
    textLower.includes('just now') ||
    textLower.includes('around') ||
    /\d{1,2}:\d{2}/.test(textLower);

  const hasSpecifics =
    textLower.includes('black') ||
    textLower.includes('white') ||
    textLower.includes('truck') ||
    textLower.includes('bike') ||
    textLower.includes('keke') ||
    textLower.includes('bus') ||
    textLower.includes('gate') ||
    textLower.includes('junction') ||
    textLower.includes('bridge') ||
    textLower.includes('uniform') ||
    textLower.includes('shirt') ||
    textLower.includes('trousers') ||
    textLower.includes('age');

  const missingDetails: string[] = [];

  if (!hasTime) {
    missingDetails.push('Exact timestamp or how many minutes ago observation occurred.');
  }

  if (incidentType === 'MISSING_PERSON') {
    if (!textLower.includes('age') && !textLower.includes('years old')) {
      missingDetails.push('Approximate age and physical height description.');
    }
    if (!textLower.includes('shirt') && !textLower.includes('color') && !textLower.includes('wearing')) {
      missingDetails.push('Clothing color and items last seen carrying.');
    }
    if (!textLower.includes('direction') && !textLower.includes('heading')) {
      missingDetails.push('Last confirmed direction of movement from landmark.');
    }
  } else if (incidentType === 'ROAD_OBSTRUCTION' || incidentType === 'CHECKPOINT') {
    if (!textLower.includes('lane') && !textLower.includes('both sides')) {
      missingDetails.push('Whether one lane or both directions of traffic are obstructed.');
    }
    if (!textLower.includes('clear') && !textLower.includes('moving')) {
      missingDetails.push('Whether commercial tricycles and bikes can squeeze through.');
    }
  } else {
    if (missingDetails.length === 0 && !hasSpecifics) {
      missingDetails.push('Distinguishing physical landmark near the reported event.');
      missingDetails.push('Observable numbers of people or vehicles involved.');
    }
  }

  // Verification checks (low-risk stationary anchor checks)
  const verificationChecks: string[] = [
    `Contact the stationary transport union desk at ${locationLabel || 'the nearest commercial junction'}.`,
    `Inquire with stationary shopkeepers or pharmacists stationed within 400m of the area.`,
    'Do not travel towards the unconfirmed area to investigate.',
  ];

  let completenessScore = 65;
  if (hasTime) completenessScore += 15;
  if (hasSpecifics) completenessScore += 15;
  if (isViralForward) completenessScore -= 25;
  if (isVaguePanic) completenessScore -= 35;

  completenessScore = Math.max(15, Math.min(95, completenessScore));

  const quarantined = isVaguePanic && completenessScore < 30;

  return {
    completenessScore,
    missingActionableDetails: missingDetails.length > 0 ? missingDetails : ['Current active status update.'],
    duplicateChainDetected: isViralForward,
    duplicateChainConfidence: isViralForward ? 88 : 10,
    suggestedVerificationChecks: verificationChecks,
    triageNotes: isViralForward
      ? 'Forwarded message signature detected. Quarantined from unconfirmed count until direct eyewitness validates.'
      : isVaguePanic
      ? 'High panic phrasing with low actionable granularity. Flagged for detail enrichment.'
      : 'Actionable telemetry with sufficient observational markers.',
    quarantined,
    quarantineReason: quarantined
      ? 'Quarantined due to speculative hysteria phrasing without verifiable local landmarks.'
      : undefined,
  };
}

/**
 * Server-side audit invocation with API fallback to local heuristics.
 */
export async function auditReportWithDeepSeek(
  rawText: string,
  incidentType: IncidentType,
  locationLabel: string
): Promise<TriageAuditResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return heuristicTriageAudit(rawText, incidentType, locationLabel);
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_TRIAGE_AUDIT_PROMPT },
          {
            role: 'user',
            content: `Incident Type: ${incidentType}\nLocation: ${locationLabel}\nRaw Chatter: "${rawText}"`,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('DeepSeek API responded with status:', response.status);
      return heuristicTriageAudit(rawText, incidentType, locationLabel);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content) as TriageAuditResult;

    return {
      completenessScore: typeof parsed.completenessScore === 'number' ? parsed.completenessScore : 60,
      missingActionableDetails: Array.isArray(parsed.missingActionableDetails)
        ? parsed.missingActionableDetails
        : ['Observational timestamp confirmation.'],
      duplicateChainDetected: Boolean(parsed.duplicateChainDetected),
      duplicateChainConfidence: typeof parsed.duplicateChainConfidence === 'number' ? parsed.duplicateChainConfidence : 0,
      suggestedVerificationChecks: Array.isArray(parsed.suggestedVerificationChecks)
        ? parsed.suggestedVerificationChecks
        : ['Check with local commercial transport park desk.'],
      triageNotes: parsed.triageNotes || 'Processed by DeepSeek Flash triage audit.',
      quarantined: Boolean(parsed.quarantined),
      quarantineReason: parsed.quarantineReason,
    };
  } catch (error) {
    console.warn('DeepSeek audit error, using resilient heuristic auditor:', error);
    return heuristicTriageAudit(rawText, incidentType, locationLabel);
  }
}

/**
 * Generate a calm, low-panic broadcast template for WhatsApp, SMS, or community radio boards.
 */
export function generateBroadcastSummary(
  title: string,
  state: string,
  locationLabel: string,
  timeReported: string,
  keyFacts: string[]
): string {
  const stateLabel = state === 'CORROBORATED'
    ? 'COMMUNITY REPORT (UNCONFIRMED)'
    : state === 'CONFIRMED'
    ? 'VERIFIED BY COMMUNITY ANCHOR'
    : state === 'CONFLICTING'
    ? 'CONFLICTING REPORTS'
    : 'UNVERIFIED OBSERVATION';

  const factsList = keyFacts.length > 0
    ? keyFacts.map((fact) => `- ${fact}`).join('\n')
    : '- Awaiting additional eyewitness verification.';

  return `[SIGNAL-NG CRISIS NOTICE: ${stateLabel}]
Location: ${locationLabel}
Report Window: ${timeReported}
Status: ${state}

Summary of Community Telemetry:
${factsList}

Important Note: This notice compiles community reports with active epistemic tracking. It does not establish that any route is fully safe or clear. Do not move toward unverified zones to investigate.
Shared via SignalNG hyper-local triage network.`;
}
