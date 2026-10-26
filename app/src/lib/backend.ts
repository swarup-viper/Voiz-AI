/**
 * Adapter between the Feedback-to-Opportunity-Map backend and the Voiz UI.
 *
 * Backend contract (see backend README):
 *   POST /api/analyze        { audience_type, items: [{ text }] }  -> { received, insights_created, insights[] }
 *   GET  /api/opportunities  -> { total_insights, opportunities[] }
 *
 * The backend returns themed insights with verbatim evidence quotes. It does NOT
 * return severity, effort, interventions, sources or groups, so those are derived
 * here (deterministically, no randomness) or kept locally from the uploaded rows.
 */
import {
  AnalysisResult,
  CommunityNeed,
  CommunityType,
  FeedbackItem,
  Intervention,
  QuadrantType,
} from '@/types';

/* ----------------------------- Backend shapes ----------------------------- */

export type BackendInsightType = 'complaint' | 'suggestion' | 'praise';
export type BackendSentiment = 'negative' | 'neutral' | 'positive';

export interface BackendInsight {
  id: string;
  feedback_id: string;
  theme: string;
  category: string | null;
  type: BackendInsightType;
  sentiment: BackendSentiment;
  urgency: number; // 1-5
  who_affected: string | null;
  evidence_quote: string | null;
  quote_verified: boolean;
  created_at?: string;
}

export interface BackendAnalyzeResponse {
  received: number;
  insights_created: number;
  insights: BackendInsight[];
}

export interface BackendOpportunity {
  theme: string;
  category: string | null;
  mentions: number;
  complaints: number;
  suggestions: number;
  praise: number;
  avg_urgency: number;
  priority_score: number;
  who_affected: string[];
  evidence: { feedback_id: string; quote: string; verified: boolean }[];
}

export interface BackendOpportunitiesResponse {
  total_insights: number;
  opportunities: BackendOpportunity[];
}

/** Voiz community lens -> backend `audience_type` string. */
export const AUDIENCE_TYPE: Record<CommunityType, string> = {
  students: 'students',
  public_services: 'citizens',
  product_team: 'product users',
};

/* -------------------------------- Helpers -------------------------------- */

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const shortId = (id: string) => (id.length > 12 ? id.slice(0, 8) : id);
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function urgencyLabel(u: number): FeedbackItem['urgency'] {
  if (u >= 5) return 'critical';
  if (u >= 4) return 'high';
  if (u >= 3) return 'medium';
  return 'low';
}

function titleCase(s: string) {
  return s.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

/** Effort is not provided by the backend: estimate it from the category. */
function estimateEffort(category: string | null | undefined): number {
  const c = (category || '').toLowerCase();
  if (/(infra|facilit|hardware|network|transport|road|water|building|utility|utilities)/.test(c)) return 4;
  if (/(polic|regulat|licens|financ|billing|pricing|admin)/.test(c)) return 3.5;
  if (/(service|dining|food|academ|support|process|onboard|integrat)/.test(c)) return 3;
  if (/(communicat|information|ux|design|content|feature)/.test(c)) return 2;
  return 3;
}

function quadrantFor(impact: number, effort: number): QuadrantType {
  if (impact >= 3) return effort < 3 ? 'Quick Win' : 'Strategic Project';
  return effort < 3 ? 'Fill-in Task' : 'Reconsider';
}

function timelineFor(effort: number) {
  if (effort < 2.5) return '1–2 Weeks';
  if (effort < 3.5) return '3–6 Weeks';
  return '1–3 Months';
}

const SCORING = {
  formula: 'Priority Score = Frequency (1-5) × Severity (1-5) × Urgency (1-5)',
  description:
    'Urgency is the average urgency (1–5) reported by the AI analysis. Severity blends how much of the theme is complaints with its peak urgency. Praise-only themes are not ranked.',
  normalizationExplanation:
    'Frequency = 1 + 4 × (mentions ÷ mentions of the largest theme). Severity = 1 + 2 × complaint share + 2 × (peak urgency − 1) ÷ 4. Effort and impact for the map are Voiz estimates (impact from priority rank, effort from category); the backend does not supply them.',
};

/* ---------------------------- Needs construction --------------------------- */

interface ThemeGroup {
  key: string;
  theme: string;
  category: string;
  complaints: number;
  suggestions: number;
  praise: number;
  urgencies: number[];
  who: string[];
  items: { evidenceId: string; quote: string; type: BackendInsightType; urgency: number }[];
}

function buildNeeds(groups: ThemeGroup[]): { needs: CommunityNeed[]; interventions: Intervention[] } {
  const ranked = groups.filter((g) => g.complaints + g.suggestions > 0);
  const maxMentions = Math.max(1, ...ranked.map((g) => g.complaints + g.suggestions + g.praise));

  const scored = ranked.map((g) => {
    const mentions = g.complaints + g.suggestions + g.praise;
    const avgUrg = g.urgencies.reduce((a, b) => a + b, 0) / Math.max(1, g.urgencies.length);
    const peak = Math.max(...g.urgencies, 1);
    const complaintShare = g.complaints / Math.max(1, mentions);
    const frequencyScore = clamp(round1(1 + 4 * (mentions / maxMentions)), 1, 5);
    const urgencyScore = clamp(round1(avgUrg), 1, 5);
    const severityScore = clamp(round1(1 + 2 * complaintShare + (2 * (peak - 1)) / 4), 1, 5);
    const priorityScore = round1(frequencyScore * severityScore * urgencyScore);
    return { g, mentions, frequencyScore, urgencyScore, severityScore, priorityScore };
  });

  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  const maxPriority = Math.max(1, ...scored.map((s) => s.priorityScore));

  const needs: CommunityNeed[] = [];
  const allInterventions: Intervention[] = [];

  scored.forEach((s, idx) => {
    const { g } = s;
    const rank = idx + 1;
    const needId = `NEED-${String(rank).padStart(2, '0')}`;
    const evidenceIds = Array.from(new Set(g.items.map((i) => i.evidenceId)));
    const impact = clamp(round1(1 + 4 * (s.priorityScore / maxPriority)), 1, 5);
    const effort = estimateEffort(g.category);
    const who = g.who.filter((w) => w && w.toLowerCase() !== 'unspecified').slice(0, 3);

    const topComplaint = [...g.items]
      .filter((i) => i.type === 'complaint')
      .sort((a, b) => b.urgency - a.urgency)[0];
    const topSuggestion = [...g.items]
      .filter((i) => i.type === 'suggestion')
      .sort((a, b) => b.urgency - a.urgency)[0];

    const interventions: Intervention[] = [];

    if (topComplaint) {
      interventions.push({
        id: `INT-${rank}A`,
        needId,
        needTitle: g.theme,
        title: `Resolve: ${g.theme}`,
        description: `Investigate and fix the root cause behind ${g.complaints} complaint${g.complaints === 1 ? '' : 's'}${
          who.length ? ` affecting ${who.join(', ')}` : ''
        }. Most urgent report: “${topComplaint.quote}”`,
        impact,
        effort,
        quadrant: quadrantFor(impact, effort),
        timeline: timelineFor(effort),
        supportingEvidenceCount: g.complaints,
        evidenceIds: Array.from(new Set(g.items.filter((i) => i.type === 'complaint').map((i) => i.evidenceId))),
      });
    }

    if (topSuggestion) {
      const sEffort = clamp(effort - 0.5, 1, 5);
      const sImpact = clamp(round1(impact - 0.3), 1, 5);
      interventions.push({
        id: `INT-${rank}${interventions.length ? 'B' : 'A'}`,
        needId,
        needTitle: g.theme,
        title: `Act on community suggestion: ${g.theme}`,
        description: `${g.suggestions} suggestion${g.suggestions === 1 ? '' : 's'} proposed a fix. Example: “${topSuggestion.quote}”`,
        impact: sImpact,
        effort: sEffort,
        quadrant: quadrantFor(sImpact, sEffort),
        timeline: timelineFor(sEffort),
        supportingEvidenceCount: g.suggestions,
        evidenceIds: Array.from(new Set(g.items.filter((i) => i.type === 'suggestion').map((i) => i.evidenceId))),
      });
    }

    allInterventions.push(...interventions);

    const parts: string[] = [];
    if (g.complaints) parts.push(`${g.complaints} complaint${g.complaints === 1 ? '' : 's'}`);
    if (g.suggestions) parts.push(`${g.suggestions} suggestion${g.suggestions === 1 ? '' : 's'}`);
    if (g.praise) parts.push(`${g.praise} praise`);

    needs.push({
      id: needId,
      rank,
      title: g.theme,
      category: g.category ? titleCase(g.category) : 'General',
      summary: `${parts.join(', ')}${who.length ? ` · affects ${who.join(', ')}` : ''}.`,
      feedbackCount: s.mentions,
      frequencyScore: s.frequencyScore,
      severityScore: s.severityScore,
      urgencyScore: s.urgencyScore,
      priorityScore: s.priorityScore,
      interventionCount: interventions.length,
      interventions,
      evidenceIds,
    });
  });

  return { needs, interventions: allInterventions };
}

function groupInsights(
  rows: { theme: string; category: string | null; type: BackendInsightType; urgency: number; who: string | null; evidenceId: string; quote: string }[],
): ThemeGroup[] {
  const map = new Map<string, ThemeGroup>();
  for (const r of rows) {
    const key = r.theme.trim().toLowerCase();
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        theme: r.theme.trim(),
        category: r.category || '',
        complaints: 0,
        suggestions: 0,
        praise: 0,
        urgencies: [],
        who: [],
        items: [],
      };
      map.set(key, g);
    }
    if (r.type === 'complaint') g.complaints++;
    else if (r.type === 'suggestion') g.suggestions++;
    else g.praise++;
    g.urgencies.push(r.urgency);
    if (r.who && !g.who.includes(r.who)) g.who.push(r.who);
    g.items.push({ evidenceId: r.evidenceId, quote: r.quote, type: r.type, urgency: r.urgency });
  }
  return Array.from(map.values());
}

function finalize(
  base: { datasetName: string; communityType: CommunityType; rawFeedback: FeedbackItem[]; totalFeedbackCount: number },
  groups: ThemeGroup[],
): AnalysisResult {
  const { needs, interventions } = buildNeeds(groups);
  return {
    datasetName: base.datasetName,
    communityType: base.communityType,
    totalFeedbackCount: base.totalFeedbackCount,
    recurringNeedsCount: needs.length,
    highPriorityCount: needs.filter((n) => n.severityScore >= 3.5 && n.urgencyScore >= 3).length,
    suggestedInterventionsCount: interventions.length,
    needs,
    interventions,
    rawFeedback: base.rawFeedback,
    analyzedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    isDemoMode: false,
    scoringFormula: SCORING,
  };
}

/* ------------------------ POST /api/analyze -> result ------------------------ */

/**
 * Build the dashboard result for a batch the user just submitted.
 * The backend assigns its own feedback UUIDs and does not echo the original text,
 * so each insight is matched back to the submitted row by finding the row whose
 * text contains the (verbatim) evidence quote.
 */
export function buildResultFromAnalysis(args: {
  communityType: CommunityType;
  datasetName: string;
  submitted: FeedbackItem[];
  insights: BackendInsight[];
}): AnalysisResult {
  const { communityType, datasetName, submitted, insights } = args;
  const normalized = submitted.map((s) => norm(s.feedback));

  const feedbackIdToIndex = new Map<string, number>();
  const claimed = new Set<number>();
  const extraRaw = new Map<string, FeedbackItem>(); // quotes we could not match to a row

  // The backend groups themes case-insensitively, so show one spelling per theme.
  const canon = new Map<string, string>();
  insights.forEach((ins) => {
    const k = ins.theme.trim().toLowerCase();
    if (!canon.has(k)) canon.set(k, ins.theme.trim());
  });

  const rows = insights.map((ins) => {
    const quote = (ins.evidence_quote || '').trim();
    let idx = feedbackIdToIndex.get(ins.feedback_id);

    if (idx === undefined && quote) {
      const q = norm(quote);
      const candidates = normalized.map((t, i) => (t.includes(q) ? i : -1)).filter((i) => i >= 0);
      idx = candidates.find((i) => !claimed.has(i)) ?? candidates[0];
      if (idx !== undefined) {
        feedbackIdToIndex.set(ins.feedback_id, idx);
        claimed.add(idx);
      }
    }

    let evidenceId: string;
    if (idx !== undefined) {
      evidenceId = submitted[idx].id;
    } else {
      evidenceId = shortId(ins.feedback_id);
      if (!extraRaw.has(evidenceId)) {
        extraRaw.set(evidenceId, { id: evidenceId, feedback: quote || '(no quote returned)', source: 'Backend' });
      }
    }

    return {
      ins,
      idx,
      evidenceId,
      theme: canon.get(ins.theme.trim().toLowerCase()) || ins.theme.trim(),
      category: ins.category,
      type: ins.type,
      urgency: clamp(Number(ins.urgency) || 1, 1, 5),
      who: ins.who_affected,
      quote: quote || '(no quote returned)',
    };
  });

  // Annotate each submitted row with its strongest insight.
  const rawFeedback: FeedbackItem[] = submitted.map((s) => ({ ...s }));
  const best = new Map<number, (typeof rows)[number]>();
  rows.forEach((r) => {
    if (r.idx === undefined) return;
    const cur = best.get(r.idx);
    if (!cur || r.urgency > cur.urgency) best.set(r.idx, r);
  });
  best.forEach((r, i) => {
    rawFeedback[i].theme = r.theme.trim();
    rawFeedback[i].sentiment = r.ins.sentiment;
    rawFeedback[i].urgency = urgencyLabel(r.urgency);
  });
  extraRaw.forEach((item, key) => {
    const r = rows.find((x) => x.evidenceId === key)!;
    item.theme = r.theme.trim();
    item.sentiment = r.ins.sentiment;
    item.urgency = urgencyLabel(r.urgency);
    rawFeedback.push(item);
  });

  const groups = groupInsights(
    rows.map((r) => ({
      theme: r.theme,
      category: r.category,
      type: r.type,
      urgency: r.urgency,
      who: r.who,
      evidenceId: r.evidenceId,
      quote: r.quote,
    })),
  );

  return finalize({ datasetName, communityType, rawFeedback, totalFeedbackCount: submitted.length }, groups);
}

/* --------------------- GET /api/opportunities -> result --------------------- */

/** Build a dashboard result from everything stored in the backend database. */
export function buildResultFromOpportunities(
  data: BackendOpportunitiesResponse,
  communityType: CommunityType,
): AnalysisResult {
  const rawFeedback: FeedbackItem[] = [];
  const seen = new Set<string>();

  const groups: ThemeGroup[] = data.opportunities.map((o) => {
    const urgency = clamp(Number(o.avg_urgency) || 1, 1, 5);
    const total = Math.max(0, o.mentions);
    const g: ThemeGroup = {
      key: o.theme.trim().toLowerCase(),
      theme: o.theme.trim(),
      category: o.category || '',
      complaints: o.complaints,
      suggestions: o.suggestions,
      praise: o.praise,
      urgencies: Array.from({ length: Math.max(1, total) }, () => urgency),
      who: o.who_affected || [],
      items: [],
    };

    // The aggregate view only carries up to 3 quotes per theme, so type is
    // assigned from the theme's dominant kind of feedback.
    const dominant: BackendInsightType =
      o.complaints >= o.suggestions && o.complaints > 0 ? 'complaint' : o.suggestions > 0 ? 'suggestion' : 'praise';

    o.evidence.forEach((e) => {
      g.items.push({ evidenceId: shortId(e.feedback_id), quote: e.quote, type: dominant, urgency });
      if (!seen.has(e.feedback_id)) {
        seen.add(e.feedback_id);
        rawFeedback.push({
          id: shortId(e.feedback_id),
          feedback: e.quote,
          source: e.verified ? 'Verified quote' : 'Unverified quote',
          theme: o.theme.trim(),
          sentiment: dominant === 'praise' ? 'positive' : dominant === 'complaint' ? 'negative' : 'neutral',
          urgency: urgencyLabel(urgency),
        });
      }
    });
    return g;
  });

  return finalize(
    { datasetName: 'Saved analyses (database)', communityType, rawFeedback, totalFeedbackCount: data.total_insights },
    groups,
  );
}
