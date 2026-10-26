export type CommunityType = 'students' | 'public_services' | 'product_team';

export interface FeedbackItem {
  id: string;
  feedback: string;
  source?: string;
  group?: string;
  timestamp?: string;
  sentiment?: 'negative' | 'neutral' | 'positive';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  theme?: string;
}

export type QuadrantType = 'Quick Win' | 'Strategic Project' | 'Fill-in Task' | 'Reconsider';

export interface Intervention {
  id: string;
  needId: string;
  needTitle: string;
  title: string;
  description: string;
  impact: number; // 1-5 scale
  effort: number; // 1-5 scale
  quadrant: QuadrantType;
  timeline: string;
  supportingEvidenceCount: number;
  evidenceIds: string[];
}

export interface CommunityNeed {
  id: string;
  rank: number;
  title: string;
  category: string;
  summary: string;
  feedbackCount: number;
  frequencyScore: number; // 1-5 scale (normalized)
  severityScore: number;  // 1-5 scale
  urgencyScore: number;   // 1-5 scale
  priorityScore: number;  // frequencyScore * severityScore * urgencyScore (1-125)
  interventionCount: number;
  interventions: Intervention[];
  evidenceIds: string[];
}

export interface AnalysisResult {
  datasetName: string;
  communityType: CommunityType;
  totalFeedbackCount: number;
  recurringNeedsCount: number;
  highPriorityCount: number;
  suggestedInterventionsCount: number;
  needs: CommunityNeed[];
  interventions: Intervention[];
  rawFeedback: FeedbackItem[];
  analyzedAt: string;
  isDemoMode: boolean;
  scoringFormula: {
    formula: string;
    description: string;
    normalizationExplanation: string;
  };
}

export interface CommunityConfig {
  type: CommunityType;
  label: string;
  tagline: string;
  audienceLabel: string;
  feedbackUnitLabel: string;
  needUnitLabel: string;
  sampleDatasetName: string;
  defaultCategories: string[];
}
