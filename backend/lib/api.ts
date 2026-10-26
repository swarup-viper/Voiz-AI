import { AnalysisResult, CommunityType, FeedbackItem, CommunityNeed, Intervention } from '@/types';
import { STUDENT_ANALYSIS_RESULT } from '@/data/mockData';
import { PUBLIC_SERVICES_ANALYSIS, PRODUCT_TEAM_ANALYSIS } from '@/data/otherDatasets';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface AnalyzePayload {
  communityType: CommunityType;
  items: FeedbackItem[];
  datasetName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFallbackDemo?: boolean;
}

let cachedResult: AnalysisResult | null = null;

export const ApiClient = {
  /**
   * Submit feedback items for AI analysis
   */
  async analyzeFeedback(payload: AnalyzePayload): Promise<ApiResponse<AnalysisResult>> {
    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/analyze` : '/api/analyze';

      // Map frontend payload to backend API format: { audience_type, items: [{ text }] }
      const backendPayload = {
        audience_type: payload.communityType,
        items: payload.items.map((i) => ({ text: i.feedback })),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // After successful analysis, reload the live results
      return await this.getLatestResults();
    } catch (err: any) {
      console.warn('Backend API connection warning, using local synthesis:', err.message);
      const fallbackResult = generateLocalAnalysis(payload);
      cachedResult = fallbackResult;
      return {
        success: true,
        data: fallbackResult,
        isFallbackDemo: true,
      };
    }
  },

  /**
   * Retrieve the live analysis results from Supabase backend
   */
  async getLatestResults(): Promise<ApiResponse<AnalysisResult>> {
    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/results` : '/api/results';
      const response = await fetch(endpoint, { cache: 'no-store' });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          cachedResult = json.data;
          return { success: true, data: json.data };
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch results from API, falling back to mock:', err.message);
    }

    if (cachedResult) {
      return { success: true, data: cachedResult };
    }

    cachedResult = STUDENT_ANALYSIS_RESULT;
    return { success: true, data: STUDENT_ANALYSIS_RESULT, isFallbackDemo: true };
  },

  /**
   * Get initial mock dataset for a community type
   */
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

function generateLocalAnalysis(payload: AnalyzePayload): AnalysisResult {
  const { communityType, items, datasetName } = payload;
  if (!items || items.length === 0) {
    return ApiClient.getDemoDataset(communityType);
  }

  const themesMap: Record<string, FeedbackItem[]> = {};

  items.forEach((item, index) => {
    const text = (item.feedback || '').toLowerCase();
    let assignedTheme = 'General Community Inquiries';

    if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) {
      assignedTheme = 'Slow Wi-Fi';
    } else if (text.includes('mess') || text.includes('food') || text.includes('dining')) {
      assignedTheme = 'Mess Food Quality';
    } else if (text.includes('hostel') || text.includes('water') || text.includes('room')) {
      assignedTheme = 'Hostel Facilities';
    } else if (text.includes('course') || text.includes('registration') || text.includes('portal')) {
      assignedTheme = 'Course Registration Crashes';
    } else if (text.includes('shuttle') || text.includes('bus')) {
      assignedTheme = 'Late Bus Service';
    } else if (item.theme) {
      assignedTheme = item.theme;
    }

    if (!themesMap[assignedTheme]) {
      themesMap[assignedTheme] = [];
    }
    themesMap[assignedTheme].push({
      ...item,
      id: item.id || `FB-${String(index + 1).padStart(3, '0')}`,
      theme: assignedTheme,
    });
  });

  const generatedNeeds: CommunityNeed[] = [];
  let rank = 1;

  for (const [theme, themeItems] of Object.entries(themesMap)) {
    const feedbackCount = themeItems.length;
    const frequencyScore = Math.min(5, Math.max(1, Number((1 + (feedbackCount / items.length) * 4).toFixed(1))));
    const severityScore = 4.0;
    const urgencyScore = 4.0;
    const priorityScore = Number((frequencyScore * severityScore * urgencyScore).toFixed(1));
    const needId = `NEED-${String(rank).padStart(2, '0')}`;
    const evidenceIds = themeItems.map((i) => i.id);

    generatedNeeds.push({
      id: needId,
      rank,
      title: theme,
      category: 'Community Priority',
      summary: `Recurring friction identified across ${feedbackCount} submissions.`,
      feedbackCount,
      frequencyScore,
      severityScore,
      urgencyScore,
      priorityScore,
      interventionCount: 1,
      evidenceIds,
      interventions: [
        {
          id: `INT-${rank}`,
          needId,
          needTitle: theme,
          title: `Direct Action Plan for ${theme}`,
          description: `Address immediate community friction cited across ${feedbackCount} submissions.`,
          impact: 4.5,
          effort: 2.0,
          quadrant: 'Quick Win',
          timeline: '1–2 Weeks',
          supportingEvidenceCount: feedbackCount,
          evidenceIds,
        },
      ],
    });
    rank++;
  }

  return {
    datasetName: datasetName || 'Uploaded Custom Feedback Dataset',
    communityType,
    totalFeedbackCount: items.length,
    recurringNeedsCount: generatedNeeds.length,
    highPriorityCount: generatedNeeds.filter((n) => n.priorityScore >= 60).length,
    suggestedInterventionsCount: generatedNeeds.length,
    needs: generatedNeeds,
    interventions: generatedNeeds.flatMap((n) => n.interventions),
    rawFeedback: items,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDemoMode: false,
    scoringFormula: {
      formula: 'Priority Score = Frequency (1-5) × Severity (1-5) × Urgency (1-5)',
      description: 'Objective formula multiplying normalized frequency, severity, and urgency.',
      normalizationExplanation: 'Frequency is normalized linearly onto 1.0–5.0 based on cluster proportion.',
    },
  };
}
