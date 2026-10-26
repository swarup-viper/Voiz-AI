'use client';

import React from 'react';
import { 
  MessageSquare, 
  Layers, 
  Flame, 
  Lightbulb, 
  ArrowRight, 
  PlusCircle, 
  Sparkles, 
  Clock, 
  FileSearch,
  Grid2X2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '../dashboard/MetricCard';
import { PriorityTable } from '../dashboard/PriorityTable';
import { OpportunityMatrix } from '../opportunity/OpportunityMatrix';
import { COMMUNITY_CONFIGS } from '@/data/mockData';

export const OverviewView: React.FC = () => {
  const { analysisResult, communityType, setActiveNav } = useApp();
  const currentConfig = COMMUNITY_CONFIGS[communityType];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Headline & Subtitle in Pale Lavender (Light) / Midnight Card (Dark) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f0e7ff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-6 sm:p-8 shadow-sm transition-colors duration-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF4FA3]/15 via-[#9B5DE5]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] text-xs font-bold border border-[#FF4FA3]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Community Needs & Opportunity Mapper</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
            Turn feedback into meaningful action.
          </h1>

          <p className="text-sm text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            Voiz transforms scattered complaints, suggestions, and survey results into an
            evidence-backed, ranked list of community needs with high-leverage interventions for {currentConfig.label.toLowerCase()}s.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveNav('analyze')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#9B5DE5] hover:opacity-95 text-[#ffffff] text-xs font-bold shadow-md shadow-[#FF4FA3]/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze New Feedback</span>
            </button>

            <button
              onClick={() => setActiveNav('opportunity-map')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#ffffff] dark:bg-[#17132B] hover:bg-[#ede7f5] dark:hover:bg-[#28224A] border border-[#cdc3dd] dark:border-[#2E2854] text-[#211B38] dark:text-[#FAF7FF] text-xs font-bold shadow-sm transition-all"
            >
              <Grid2X2 className="w-4 h-4 text-[#7934CF] dark:text-[#9B5DE5]" />
              <span>View 2x2 Opportunity Map</span>
            </button>

            <button
              onClick={() => setActiveNav('evidence')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#ffffff] dark:bg-[#17132B] hover:bg-[#ede7f5] dark:hover:bg-[#28224A] border border-[#cdc3dd] dark:border-[#2E2854] text-[#211B38] dark:text-[#FAF7FF] text-xs font-bold shadow-sm transition-all"
            >
              <FileSearch className="w-4 h-4 text-[#E5B500] dark:text-[#FFE66D]" />
              <span>Explore Citations</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Feedback Analyzed"
          value={analysisResult.totalFeedbackCount}
          description="Unstructured citizen and student submissions ingested with full metadata."
          icon={<MessageSquare className="w-5 h-5 text-[#D81B76] dark:text-[#FF4FA3]" />}
          accentColor="pink"
          onClick={() => setActiveNav('evidence')}
        />
        <MetricCard
          title="Recurring Needs Identified"
          value={analysisResult.recurringNeedsCount}
          description="Synthesized root-cause clusters synthesized across community responses."
          icon={<Layers className="w-5 h-5 text-[#7934CF] dark:text-[#9B5DE5]" />}
          accentColor="purple"
        />
        <MetricCard
          title="High-Priority Issues"
          value={analysisResult.highPriorityCount}
          description="Issues exceeding 60.0 score threshold demanding expedited administrative focus."
          icon={<Flame className="w-5 h-5 text-[#D9492A] dark:text-[#FF8066]" />}
          accentColor="coral"
        />
        <MetricCard
          title="Suggested Interventions"
          value={analysisResult.suggestedInterventionsCount}
          description="High-impact Quick Wins and strategic projects ready for implementation."
          icon={<Lightbulb className="w-5 h-5 text-[#7A6100] dark:text-[#FFE66D]" />}
          accentColor="yellow"
          onClick={() => setActiveNav('recommendations')}
        />
      </div>

      {/* Ranked Priority Needs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#211B38] dark:text-[#FAF7FF]">Top Priority Community Needs</h2>
            <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
              Ranked dynamically by Frequency × Severity × Urgency with direct feedback evidence.
            </p>
          </div>

          <button
            onClick={() => setActiveNav('recommendations')}
            className="flex items-center space-x-1 text-xs text-[#D81B76] dark:text-[#FF4FA3] hover:underline font-bold"
          >
            <span>View All Needs & Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <PriorityTable limit={5} showFilters={false} />
      </div>

      {/* Compact Impact-vs-Effort Matrix Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#211B38] dark:text-[#FAF7FF]">Impact vs. Effort Matrix Preview</h2>
            <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
              Interventions organized into Quick Wins, Strategic Projects, and Backlog items.
            </p>
          </div>

          <button
            onClick={() => setActiveNav('opportunity-map')}
            className="flex items-center space-x-1 text-xs text-[#7934CF] dark:text-[#9B5DE5] hover:underline font-bold"
          >
            <span>Open Full Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <OpportunityMatrix compact={true} />
      </div>

      {/* Recent Analysis Summary Card & Call to Action */}
      <div className="rounded-2xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#5e5779] dark:text-[#77738A]">
            <Clock className="w-3.5 h-3.5 text-[#E5B500] dark:text-[#FFE66D]" />
            <span>Last Analyzed: <strong className="text-[#211B38] dark:text-[#FAF7FF]">{analysisResult.analyzedAt}</strong></span>
            <span>•</span>
            <span>Dataset: <strong className="text-[#211B38] dark:text-[#FAF7FF]">{analysisResult.datasetName}</strong></span>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] max-w-xl">
            Want to test with new student complaints or municipal logs? Ingest CSV or paste text anytime to recalibrate priorities.
          </p>
        </div>

        <button
          onClick={() => setActiveNav('analyze')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#f0e7ff] dark:bg-[#17132B] hover:bg-[#e6ddf5] dark:hover:bg-[#28224A] border border-[#FF4FA3]/40 text-[#211B38] dark:text-[#FAF7FF] text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />
          <span>Analyze Feedback</span>
        </button>
      </div>
    </div>
  );
};
