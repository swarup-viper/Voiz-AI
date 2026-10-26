# Voiz — Many Voices. One Clear Plan
### AI-Powered Community Needs & Opportunity Mapper

Voiz is a modern, high-performance web application designed to transform scattered community complaints, survey entries, and feedback submissions into an evidence-backed, ranked list of community needs paired with high-leverage actionable interventions.

Built for student communities, public municipal services, and product development teams, Voiz is designed for international hackathons, civic tech demonstrations, and real-world deployment.

---

## 🎨 Design System & Aesthetic Direction

Voiz follows a restrained, premium SaaS aesthetic inspired by Linear, Vercel, and Stripe:
- **Primary Background**: Midnight Navy (`#17132B`)
- **Card Background**: Deep Navy (`#201B3B`)
- **Card Borders**: Refined Slate Border (`#2E2854`)
- **Primary Accent**: Hot Pink (`#FF4FA3`)
- **Secondary Accent**: Electric Purple (`#9B5DE5`)
- **Highlight Accent**: Coral Orange (`#FF8066`)
- **Special Highlight**: Neon Yellow (`#FFE66D`)
- **Primary Text on Dark**: Soft White (`#FAF7FF`)
- **Muted Text**: Muted Slate (`#77738A`)

---

## 🚀 Key Features

1. **Multi-Audience Lens**:
   - Seamlessly switch between **Student Community**, **Public Services**, and **Product Team** contexts.
   - All terminology, metrics, needs, and interventions adapt dynamically.

2. **Overview Dashboard**:
   - Headline: *"Turn feedback into meaningful action."*
   - 4 summary metrics (Total Analyzed, Recurring Needs, High-Priority Issues, Suggested Interventions).
   - Top 5 ranked needs table with instant drawer trigger.
   - Compact 2×2 Impact vs. Effort matrix preview.
   - Prominent *"Analyze New Feedback"* call to action.

3. **Feedback Ingest & Parsing Engine**:
   - **Mode 1: CSV Upload**: Drag-and-drop or file browse, instant PapaParse parsing, column verification (`id,feedback,source,group`), preview table, sample CSV template download, and a 1-click **Load 45 Campus Sample** button.
   - **Mode 2: Paste Raw Feedback**: Multiline textarea accepting one complaint per line with instant row count detection.

4. **6-Stage Analysis Pipeline UI**:
   - Real-time animated progress visualizing:
     1. Reading feedback entries
     2. Extracting issues & sentiment
     3. Grouping recurring needs
     4. Calculating priority scores
     5. Generating actionable interventions
     6. Preparing the opportunity map

5. **Ranked Priority Table**:
   - Interactive, sortable table (Rank, Community Need, Feedback Count, Severity, Urgency, Priority Score, Interventions).
   - Real-time search query matching across titles, summaries, and categories.
   - Filter by Severity level (`Critical`, `High`, `Medium`).
   - Clickable rows that slide out the comprehensive Need Detail Panel.

6. **Transparent Priority Scoring**:
   $$\text{Priority Score} = \text{Frequency (1–5)} \times \text{Severity (1–5)} \times \text{Urgency (1–5)}$$
   - Normalized 1.0–5.0 scale for frequency, severity, and urgency.
   - Explicit mathematical breakdowns displayed for every need.

7. **2×2 Opportunity Matrix (Impact vs. Effort)**:
   - **Top-Left**: Quick Wins (High Impact, Low Effort)
   - **Top-Right**: Strategic Projects (High Impact, High Effort)
   - **Bottom-Left**: Fill-in Tasks (Low Impact, Low Effort)
   - **Bottom-Right**: Reconsider (Low Impact, High Effort)
   - Interactive points with full quadrant filtering and click-to-detail drawer lineage.

8. **Evidence Explorer & Lineage Trace (The Core Feature)**:
   - Every single recommendation is 100% traceable to genuine raw feedback records using immutable `evidenceIds`.
   - Filter citations by Theme, Sentiment (`negative`, `neutral`, `positive`), and Urgency (`critical`, `high`, `medium`, `low`).
   - Shows original text, Feedback ID, source channel, group/cohort, and attributed need.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS with custom midnight color tokens
- **Icons**: Lucide React
- **CSV Engine**: PapaParse
- **State Architecture**: Typed React Context API (`AppContext.tsx`)
- **API Architecture**: Centralized typed client (`src/lib/api.ts`) + Next.js App Router API Routes (`/backend-api/*` proxy to the backend)

---

## 📁 Project Structure

```
voiz-app/
├── src/
│   ├── app/
│   │   ├── globals.css               # Midnight navy theme & scrollbars
│   │   ├── layout.tsx                # App root metadata & provider wrapper
│   │   └── page.tsx                  # Core layout & dynamic view switcher
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx        # Navigation sidebar with demo badge
│   │   │   └── Topbar.tsx            # Top navigation, audience selector, CTAs
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx        # Summary metric stat cards
│   │   │   ├── PriorityTable.tsx     # Sortable & filterable priority table
│   │   │   └── PriorityScoreBreakdown.tsx # Transparent math formula explainer
│   │   ├── opportunity/
│   │   │   └── OpportunityMatrix.tsx # 2x2 Impact vs Effort grid & cards
│   │   ├── recommendations/
│   │   │   └── InterventionCard.tsx  # Recommendation cards with evidence CTA
│   │   ├── evidence/
│   │   │   ├── EvidenceQuote.tsx     # Citation card with sentiment/urgency badges
│   │   │   └── NeedDetailPanel.tsx   # Slide-out drawer with full quote lineage
│   │   ├── upload/
│   │   │   ├── FeedbackUploader.tsx  # CSV upload & paste interface
│   │   │   ├── CSVPreview.tsx        # CSV table preview & validation
│   │   │   └── AnalysisProgress.tsx  # 6-stage AI pipeline progress modal
│   │   └── views/
│   │       ├── OverviewView.tsx      # Overview dashboard view
│   │       ├── OpportunityMapView.tsx# 2x2 Opportunity matrix view
│   │       ├── RecommendationsView.tsx # Actionable roadmap view
│   │       └── EvidenceExplorerView.tsx# Ground-truth evidence explorer view
│   ├── context/
│   │   └── AppContext.tsx            # Global state (audience, active nav, filters, drawer)
│   ├── data/
│   │   ├── mockData.ts               # 40+ student feedback items & traced needs
│   │   └── otherDatasets.ts          # Datasets for Public Services & Product Teams
│   ├── lib/
│   │   ├── api.ts                    # Backend API client (analyze, saved results)
│   │   ├── backend.ts                # Backend response -> dashboard model adapter
│   │   └── utils.ts                  # Score formatting, badge styling, cn helper
│   └── types/
│       └── index.ts                  # TypeScript interfaces for all data models
├── .env.example                      # Example environment variables
├── .env.local                        # Local development environment configuration
├── package.json                      # Dependencies and run scripts
├── tailwind.config.ts                # Custom Tailwind palette configuration
└── tsconfig.json                     # Strict TypeScript compiler options
```

---

## 🏃 Running the Application

### 1. Prerequisites
- Node.js (v18+)
- pnpm or npm

### 2. Development Server
Run the local dev server:
```bash
pnpm dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
pnpm build
pnpm start
```

---

## 🔌 Connecting to the Backend (Feedback-to-Opportunity-Map)

Voiz talks to the Next.js + Supabase + Claude backend. The frontend runs on **port 3001** so the backend can keep port 3000.

1. Start the backend (`npm run dev` in the backend project, port 3000) with its `.env.local` filled in and `supabase/schema.sql` applied.
2. In this project, copy `.env.example` to `.env.local` and set `BACKEND_URL` (default `http://localhost:3000`).
3. `npm install && npm run dev`, then open http://localhost:3001.

Requests go to same-origin `/backend-api/*`, which `next.config.mjs` proxies to `$BACKEND_URL/api/*` (no CORS needed). Set `NEXT_PUBLIC_API_URL` only if you want the browser to call the backend directly.

| UI action | Backend call |
| --- | --- |
| Analyze Feedback (CSV / paste) | `POST /api/analyze` with `{ audience_type, items: [{ text }] }`, in chunks of 200 |
| "Load saved results from backend" (sidebar) | `GET /api/opportunities` |

`src/lib/backend.ts` converts the backend's insights into the dashboard model. What the backend provides vs. what Voiz derives:

- **From the backend:** theme, category, complaint/suggestion/praise type, sentiment, urgency (1–5), who is affected, verbatim evidence quotes.
- **Kept locally:** CSV `id`, `source` and `group` (the backend only receives the text; insights are matched back to rows by their evidence quote).
- **Derived in Voiz:** frequency and severity scores, impact/effort for the matrix, and the suggested interventions (built from the actual complaint/suggestion quotes). Effort is a category-based estimate.
- Praise-only themes are not ranked as needs, matching the backend's `priority_score = 0`.

If the backend is down or returns an error, the Analyze screen shows the error instead of falling back to fake data. The built-in demo datasets are still used on first load and by **Reset**.

---

## ⚙️ Environment Variables

```bash
BACKEND_URL=http://localhost:3000   # server-side proxy target
NEXT_PUBLIC_API_URL=                # optional: call the backend directly from the browser
```
