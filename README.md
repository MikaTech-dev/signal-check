# SafeRoute Signal: AI-Powered Community Safety & Road Verification

> Built for the Screening Challenge: **"Build Something That Helps"** (Amara's 6:40 PM market closing scenario).

---

## 1. Problem & Scenario

At 6:40 PM on the edge of a tense regional market town, Amara is closing her shop. Rumours circulate rapidly across WhatsApp groups and uncoordinated radio chatter. Panic spreads easily, but verified facts are scarce. Amara needs to know right now whether the road home is safe, and she needs to trust what she is told.

**SafeRoute Signal** uses **DeepSeek Flash** to extract verified facts from unstructured community noise, separating direct eyewitness observations from hearsay and panic forwards, and calculating real-time road corridor safety consensus.

---

## 2. Key Architecture & Modules

```
src/
├── types/
│   └── index.ts                 # Type definitions (Reports, Routes, AI Analysis)
├── lib/
│   ├── deepseek.ts              # DeepSeek API integration with zero-failure fallback
│   ├── mockData.ts              # Realistic regional seed data & 1-click test scenarios
│   ├── utils.ts                 # Status tokens, formatting, and accessibility helpers
│   └── __tests__/
│       └── signalCheck.test.ts  # Vitest unit test suite for business & extraction logic
├── components/
│   ├── ui/                      # Accessible design primitives (Button, Badge, Card, Modal)
│   ├── layout/                  # Context Header with live market time & accessible TabNav
│   ├── dashboard/               # Amara's 6:40 PM Decision Card, Corridor Grid, Evidence Modal
│   └── reports/                 # Raw WhatsApp/Radio ingest, AI fact breakdown, Signal stream
└── app/
    ├── api/analyze/route.ts     # Next.js Server Route for DeepSeek Flash
    ├── layout.tsx               # Root layout & meta tags
    ├── page.tsx                 # Main application dashboard
    └── globals.css              # Accessible high-contrast theme tokens
```

---

## 3. Setup & Environment

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

*(Note: The system also includes an intelligent local heuristic analysis fallback, ensuring complete functionality even without an active key or during offline review).*

---

## 4. Commands

### Run Unit Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

### Start Development Server
```bash
npm run dev
```

---

## 5. Antislop & UX Standards Applied
- **Truth over Hype**: Zero fabricated statistics or generic AI testimonials.
- **Copywriting Hygiene**: No em dashes (`—`), no empty buzzwords, clear human phrasing.
- **Accessibility**: WCAG AA color contrast, minimum 44px touch targets, full keyboard operability (`Escape` for modals, logical `Tab` navigation).
- **Resilience**: Complete handling for empty, loading, error, and offline states.
