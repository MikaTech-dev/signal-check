<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
# SignalNG: Operational Architecture & Design Guidelines

## 1. Product Vision & Epistemic Stance
SignalNG is a mobile-first, hyper-local crisis triage engine. It bridges the gap between chaotic community chatter (WhatsApp forwards, verbal rumors, frantic warnings) and actionable, hyper-local awareness for residents navigating sudden uncertainty.

The platform explicitly rejects the illusion that AI can autonomously determine "ground truth" or declare routes "safe." Instead, it organizes raw multi-format reports, measures source depth, cross-examines contradictions, and alerts nearby residents within a verified 5 km radius with appropriate epistemic caution.

---

## 2. Key System Pillars

### Pillar 1: Ingestion & Radius Mechanics (Zero GIS Bloat)
- **Arbitrary Location Handling**: Captures coordinates via native one-tap device GPS or a free text geocoder for local landmarks (e.g., "Lugbe Market Fruit Section").
- **5 km Proximity Radius**: Avoids heavy PostGIS infrastructure. The backend applies the mathematical Haversine formula directly against stored coordinates to determine whether an active user falls within the affected incident perimeter (1.5 km clustering threshold, 5 km notification perimeter).
- **Coordinate Privacy**: Exact coordinates remain private. Public feeds receive masked coordinates (2-decimal rounding) or broad landmark labels only.
- **Multi-Format Intake**: Users upload plain text chatter, screenshots of WhatsApp chains, or photos.

### Pillar 2: The AI Layer (DeepSeek Flash as Triage Auditor)
DeepSeek Flash is strictly barred from judging whether an event is "true" or declaring an area "safe." It performs four constrained tasks:
1. **Actionable Completeness Audit**: Audits submissions for actionable specifics (clothing colors, exact timestamps, distinct physical landmarks) versus vague panic language. Incomplete or hysteria-inducing posts are quarantined and the reporter is prompted for missing details.
2. **Duplicate Chain Identification**: Identifies when multiple submissions share identical phraseology or viral forwarding patterns, ensuring that one viral rumor forwarded ten times is not counted as ten independent confirmations.
3. **Context & Comment Synthesis**: Periodic synthesis runs to map whether community observation is converging (adding specific sightings) or diverging (refuting the claim with counter-evidence).
4. **"What Would Confirm This?" Coach**: Generates 2 to 3 concrete, low-risk verification checks (e.g., calling stationary transport union desks, asking nearby pharmacists) while explicitly discouraging users from moving toward danger to investigate.

### Pillar 3: Structured Attestation Engine (Replacing Upvotes)
Reddit-style upvoting and downvoting are eliminated because panic causes people to upvote rumors they only heard secondhand. Voting is replaced with three explicit attestation actions:
- `FIRSTHAND_WITNESS`: "I am at this location and observe this directly."
- `ACTIVE_CONTRADICTION`: "I passed this exact spot within the last 15 minutes and conditions are normal."
- `HEARSAY_TRACKING`: "I received this via a third party / forwarding chain."

### Pillar 4: Deterministic 4-Stage Verification State Machine
Threat levels and incident statuses are governed deterministically:
1. **Unverified / Staged**: Single report submitted. Audited by LLM for completeness. Staged in local feeds; no broad alerts sent.
2. **Corroborated**: Supported by two or more independent firsthand witness accounts with no active contradictions. Triggers a structured 5 km perimeter alert labeled explicitly as `COMMUNITY REPORT (UNCONFIRMED)`.
3. **Confirmed**: Formally verified by designated stationary community anchors (transport union chairs, market leadership, community development coordinators) or the primary affected family.
4. **Stale / Resolved (TTL Decay)**: Reports carry an automatic expiration window (45 to 90 minutes). Without fresh firsthand reaffirmations, the status degrades automatically to prevent phantom crises from lingering.

### Pillar 5: Dashboard & Alerting Interface
- **No Chatbots**: An analytical workspace presenting clear discrepancy matrices, timelines, and source-chain depth rather than conversational chat bubbles.
- **Broadcast Templates**: Generates calm, pre-formatted, low-panic summaries ready for copy-pasting into local WhatsApp groups, SMS gateways, or community radio boards.

---

## 3. Brand Identity & Visual Language
- **Palette**:
  - Paper White / High Background: `#FAFAF9` / `#FFFFFF`
  - Near-Black / Charcoal: `#0A0A0A` / `#171717`
  - Secondary Rules & Muted Text: `#6B6B68` / `#737373`
  - Single Accent (Caution / Active Triage): `#C7862B` (Amber, borrowed from status indicator)
  - Alert States: Muted Brick Red (`#991B1B`), Ochre (`#B45309`), Steel Slate (`#334155`)
- **Aesthetic**: Matte, high-contrast, editorial typography and crisp borders. No generic purple gradients, glowing decorative dots, floating bento grids, or fabricated statistics.
- **Tone**: Grounded, urgent, authentic civic tool for navigating regional crisis and transit uncertainty.

---

## 4. Antislop Strict Standards
- **Zero Em Dashes (`—`)**: Use commas, periods, colons, hyphens, or parentheses in all UI text, code comments, and documentation.
- **No Template Clichés**:
  - No generic blueprint background grids or dot patterns without functional purpose.
  - No forced 3-step numbered card funnels (`1, 2, 3`).
  - No pill eyebrow badges parked above every heading.
  - No decorative arrows (`→`) placed mechanically on buttons.
  - No decorative pastel corner blobs or floating trend cards.
- **Asymmetric, Content-Driven Layouts**: Put the live noise versus verified signal triage console and proximity stream at the focal point.
- **Accessibility & Craftsmanship**: WCAG AA contrast, 44px minimum tap targets, explicit empty and error states, full keyboard navigation.

---

## 5. File & Module Structure
- `src/types/index.ts`: Strict TypeScript domain definitions (Incidents, Reports, Attestations, VerificationStates, Roles).
- `src/lib/haversine.ts`: Mathematical distance calculation and 5 km radius filtering.
- `src/lib/deepseek.ts`: Server-side DeepSeek Flash completeness auditor, duplicate detector, and verification coach with resilient zero-failure fallback.
- `src/lib/mockData.ts`: Realistic situational seed data and test presets (missing child, armed obstruction forward, contradicting traffic update).
- `src/components/ui/`: Accessible, minimalist design primitives (shadcn & ReactBits).
- `src/components/incidents/`: Proximity incident feed, discrepancy matrix, verification coach, and attestation drawer.
- `src/components/reports/`: 4-step multi-format intake form with live completeness check and WhatsApp paste parser.
- `src/app/page.tsx`: Editorial landing page with integrated live crisis triage console.
- `src/app/nearby/page.tsx`: Mobile-first nearby incidents feed and distance bands.
- `src/app/report/page.tsx`: Dedicated report submission and completeness auditor flow.
<!-- antislop:end -->

