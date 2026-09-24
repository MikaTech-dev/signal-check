import { AiAnalysisResult, SourceType, UrgencyLevel } from '@/types';

const SYSTEM_PROMPT = `
You are an emergency AI signal filter for community road safety reports in high-stress, rumour-heavy environments.
Your objective: Extract verified facts, ruthlessly distinguish firsthand eyewitness observations from hearsay rumours, and assign honest confidence ratings.

Rules:
1. Do not invent facts. Extract only what is stated in the report.
2. Distinguish firsthand eyewitnesses ("I am currently at", "I just saw", "I drove past") from hearsay/rumours ("my cousin said", "heard on WhatsApp", "someone told me", "forwarded message").
3. Determine:
   - incident_type: (e.g., "Normal Passage", "Roadblock", "Checkpoint", "Unverified Rumour", "Traffic Flow", "Gathering")
   - location: The specific road or landmark mentioned (e.g., "Market Central to North Gate", "Eastern River Bypass & Bridge", "South Highway Junction (Kilometer 4)", or exact named area).
   - event_time: Time mentioned or implied (e.g., "6:40 PM", "Recent", "Unspecified").
   - source_type: One of ["FIRSTHAND_OBSERVATION", "HEARSAY_RUMOR", "COMMUNITY_RADIO", "UNVERIFIED_WHATSAPP"].
   - claim: One clear sentence summarizing the factual assertion.
   - urgency: One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
   - confidence: Integer from 10 to 100 representing evidentiary reliability. Hearsay and forwarded panic without direct observation must have confidence <= 40. Direct firsthand with timestamps/specific details gets 85-98.
   - needs_human_review: boolean (true if ambiguous or panic-inducing hearsay).
   - is_firsthand: boolean (true only if speaker was physically present).
   - reasoning: One concise sentence explaining why you assigned this confidence and source classification. (Do NOT use em dashes).

Return ONLY valid JSON matching this schema:
{
  "incident_type": "string",
  "location": "string",
  "event_time": "string",
  "source_type": "FIRSTHAND_OBSERVATION" | "HEARSAY_RUMOR" | "COMMUNITY_RADIO" | "UNVERIFIED_WHATSAPP",
  "claim": "string",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": number,
  "needs_human_review": boolean,
  "is_firsthand": boolean,
  "reasoning": "string"
}
`;

/**
 * Heuristic fallback analysis engine used when DEEPSEEK_API_KEY is not configured
 * or when offline during local demo runs.
 */
export function heuristicFallbackAnalysis(rawText: string): AiAnalysisResult {
  const textLower = rawText.toLowerCase();

  const isHearsay =
    textLower.includes('heard') ||
    textLower.includes('my cousin') ||
    textLower.includes('my neighbour') ||
    textLower.includes('my sister') ||
    textLower.includes('someone posted') ||
    textLower.includes('whatsapp') ||
    textLower.includes('forwarded') ||
    textLower.includes('rumour') ||
    textLower.includes('they said');

  const isRadio =
    textLower.includes('radio') ||
    textLower.includes('patrol') ||
    textLower.includes('broadcast') ||
    textLower.includes('channel') ||
    textLower.includes('vigilante');

  const isDirectFirsthand =
    (textLower.includes('i just') ||
      textLower.includes('i drove') ||
      textLower.includes('i am at') ||
      textLower.includes('passed') ||
      textLower.includes('i saw') ||
      textLower.includes('left market')) &&
    !isHearsay;

  // Determine location
  let location = 'Market Central to North Gate';
  if (textLower.includes('east') || textLower.includes('bridge') || textLower.includes('river')) {
    location = 'Eastern River Bypass & Bridge';
  } else if (textLower.includes('south') || textLower.includes('highway') || textLower.includes('kilometer')) {
    location = 'South Highway Junction (Kilometer 4)';
  }

  // Determine source type
  let sourceType: SourceType = 'UNVERIFIED_WHATSAPP';
  let isFirsthand = false;
  let confidence = 35;
  let needsReview = true;
  let urgency: UrgencyLevel = 'MEDIUM';
  let incidentType = 'Unverified Field Report';
  let reasoning = 'Unconfirmed report containing indirect information without verified source signature.';

  if (isDirectFirsthand) {
    sourceType = 'FIRSTHAND_OBSERVATION';
    isFirsthand = true;
    confidence = 94;
    needsReview = false;
    urgency = textLower.includes('clear') || textLower.includes('normal') ? 'LOW' : 'HIGH';
    incidentType = textLower.includes('clear') ? 'Normal Transit Confirmed' : 'Direct Road Incident';
    reasoning = 'Direct eyewitness statement with first-person travel confirmation.';
  } else if (isRadio) {
    sourceType = 'COMMUNITY_RADIO';
    isFirsthand = true;
    confidence = 90;
    needsReview = false;
    urgency = 'HIGH';
    incidentType = 'Patrol Radio Advisory';
    reasoning = 'Official community patrol or vigilante radio dispatch.';
  } else if (isHearsay) {
    sourceType =
      textLower.includes('whatsapp') ||
      textLower.includes('share') ||
      textLower.includes('forward')
        ? 'UNVERIFIED_WHATSAPP'
        : 'HEARSAY_RUMOR';
    isFirsthand = false;
    confidence = 25;
    needsReview = true;
    urgency = textLower.includes('panic') || textLower.includes('gunshot') ? 'HIGH' : 'MEDIUM';
    incidentType = 'Unsubstantiated Rumour';
    reasoning = 'Second-hand narrative referencing third-party sources without direct witness verification.';
  }

  // Extract claim
  const claim = rawText.length > 90 ? `${rawText.slice(0, 87)}...` : rawText;

  return {
    incident_type: incidentType,
    location,
    event_time: 'Recent',
    source_type: sourceType,
    claim: claim.replace(/[\n\r]+/g, ' ').trim(),
    urgency,
    confidence,
    needs_human_review: needsReview,
    is_firsthand: isFirsthand,
    reasoning,
  };
}

export async function analyzeReportWithDeepSeek(reportText: string): Promise<AiAnalysisResult> {
  const apiKey =
    process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
    process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    // Graceful fallback for local development or demo without key
    return heuristicFallbackAnalysis(reportText);
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
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: reportText },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`DeepSeek API responded with status ${response.status}. Using heuristic fallback.`);
      return heuristicFallbackAnalysis(reportText);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return heuristicFallbackAnalysis(reportText);
    }

    const parsed = JSON.parse(content) as AiAnalysisResult;
    return parsed;
  } catch (error) {
    console.error('DeepSeek analysis encountered error:', error);
    return heuristicFallbackAnalysis(reportText);
  }
}
