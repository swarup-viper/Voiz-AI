import { AnalysisResult, CommunityType, FeedbackItem } from '@/types';
import { STUDENT_ANALYSIS_RESULT } from '@/data/mockData';
import { PUBLIC_SERVICES_ANALYSIS, PRODUCT_TEAM_ANALYSIS } from '@/data/otherDatasets';
import {
  AUDIENCE_TYPE,
  BackendAnalyzeResponse,
  BackendInsight,
  BackendOpportunitiesResponse,
  buildResultFromAnalysis,
  buildResultFromOpportunities,
} from '@/lib/backend';

/**
 * Where API calls go:
 *  - NEXT_PUBLIC_API_URL set  -> call that origin directly (backend must allow CORS; it does)
 *  - not set                  -> call same-origin `/backend-api/*`, which next.config.mjs proxies
 *                                to BACKEND_URL (default http://localhost:3000). No CORS needed.
 */
const DIRECT_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const endpoint = (name: 'analyze' | 'opportunities') =>
  DIRECT_BASE ? `${DIRECT_BASE}/api/${name}` : `/backend-api/${name}`;

/** Backend accepts 1–200 items per request. */
const MAX_ITEMS_PER_REQUEST = 200;
/** Claude batches 20 items at a time; 200 items can take a while. */
const REQUEST_TIMEOUT_MS = 120_000;

export interface AnalyzePayload {
  communityType: CommunityType;
  items: FeedbackItem[];
  datasetName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('The analysis took too long and was cancelled. Try fewer items.');
    }
    throw new Error(
      DIRECT_BASE
        ? `Cannot reach the backend at ${DIRECT_BASE}. Check that it is running and the URL is correct.`
        : 'Cannot reach the backend. Start it and check BACKEND_URL in .env.local.',
    );
  } finally {
    clearTimeout(timer);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON error body */
  }

  if (!res.ok) {
    const detail = body?.error || body?.message || res.statusText;
    if (res.status === 400) throw new Error(`The backend rejected the input: ${detail}`);
    if (res.status === 502) throw new Error(`The AI analysis failed: ${detail}`);
    if (res.status >= 500) throw new Error(`The backend hit an error (${res.status}): ${detail}`);
    throw new Error(`Backend returned ${res.status}: ${detail}`);
  }
  return body as T;
}

export const ApiClient = {
  /**
   * Send feedback to the backend for AI analysis and convert the response
   * into the structure the dashboard renders. Rejects with a readable error
   * instead of silently substituting fake data.
   */
  async analyzeFeedback(payload: AnalyzePayload): Promise<ApiResponse<AnalysisResult>> {
    const { communityType, items, datasetName } = payload;
    const submitted = items
      .map((it, i) => ({
        ...it,
        id: it.id || `FB-${String(i + 1).padStart(3, '0')}`,
        feedback: (it.feedback || '').trim(),
      }))
      .filter((it) => it.feedback.length > 0);

    if (submitted.length === 0) {
      return { success: false, error: 'There is no feedback text to analyze.' };
    }

    try {
      const insights: BackendInsight[] = [];
      for (let start = 0; start < submitted.length; start += MAX_ITEMS_PER_REQUEST) {
        const chunk = submitted.slice(start, start + MAX_ITEMS_PER_REQUEST);
        const json = await requestJson<BackendAnalyzeResponse>(endpoint('analyze'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audience_type: AUDIENCE_TYPE[communityType],
            items: chunk.map((c) => ({ text: c.feedback })),
          }),
        });
        if (!json || !Array.isArray(json.insights)) {
          throw new Error('The backend returned an unexpected response.');
        }
        insights.push(...json.insights);
      }

      const data = buildResultFromAnalysis({
        communityType,
        datasetName: datasetName || 'Uploaded feedback',
        submitted,
        insights,
      });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Analysis failed.' };
    }
  },

  /** Load everything the backend has stored so far (GET /api/opportunities). */
  async getSavedResults(communityType: CommunityType): Promise<ApiResponse<AnalysisResult>> {
    try {
      const json = await requestJson<BackendOpportunitiesResponse>(endpoint('opportunities'));
      if (!json || !Array.isArray(json.opportunities)) {
        throw new Error('The backend returned an unexpected response.');
      }
      if (json.opportunities.length === 0) {
        return { success: false, error: 'The backend has no saved analyses yet. Analyze some feedback first.' };
      }
      return { success: true, data: buildResultFromOpportunities(json, communityType) };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Could not load saved results.' };
    }
  },

  /** Built-in demo datasets (used on first load and by "Reset"). */
  getDemoDataset(communityType: CommunityType): AnalysisResult {
    switch (communityType) {
      case 'public_services':
        return PUBLIC_SERVICES_ANALYSIS;
      case 'product_team':
        return PRODUCT_TEAM_ANALYSIS;
      case 'students':
      default:
        return STUDENT_ANALYSIS_RESULT;
    }
  },
};
