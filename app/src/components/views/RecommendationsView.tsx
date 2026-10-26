'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Lightbulb, 
  ChevronRight,
  Search
} from 'lucide-react';
import { InterventionCard } from '../recommendations/InterventionCard';

export const RecommendationsView: React.FC = () => {
  const { analysisResult, openNeedDetails } = useApp();
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredInterventions = analysisResult.interventions.filter((i) => {
    const matchesQuad = selectedQuadrant === 'all' || i.quadrant === selectedQuadrant;
    const matchesSearch =
      !searchFilter.trim() ||
      i.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      i.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      i.needTitle.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesQuad && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#ffffff] dark:bg-[#201B3B] p-6 rounded-2xl border border-[#cdc3dd] dark:border-[#2E2854] space-y-2 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFE66D]/40 dark:bg-[#FFE66D]/20 text-[#7A6100] dark:text-[#FFE66D] border border-[#d4be3d]/60 dark:border-[#FFE66D]/40">
            Actionable Roadmap
          </span>
          <span className="text-xs text-[#5e5779] dark:text-[#77738A] font-medium">Ranked Interventions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
          Recommended Community Interventions
        </h1>
        <p className="text-xs sm:text-sm text-[#5e5779] dark:text-[#77738A] leading-relaxed max-w-3xl">
          Evidence-backed solutions synthesized directly from recurring friction patterns.
          Each intervention includes implementation timelines, impact/effort scorings, and direct citations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5e5779] dark:text-[#77738A]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search interventions or related needs..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#211B38] dark:text-[#FAF7FF] placeholder-[#77738A] focus:outline-none focus:border-[#FF4FA3] shadow-xs transition-colors"
          />
        </div>

        {/* Quadrant Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedQuadrant('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedQuadrant === 'all'
                ? 'bg-[#211B38] dark:bg-[#FAF7FF] text-white dark:text-[#17132B] shadow-xs'
                : 'bg-[#f0e7ff] dark:bg-[#201B3B] text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF] border border-[#cdc3dd] dark:border-[#2E2854]'
            }`}
          >
            All Interventions ({analysisResult.interventions.length})
          </button>
          <button
            onClick={() => setSelectedQuadrant('Quick Win')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selectedQuadrant === 'Quick Win'
                ? 'bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3] border-[#FF4FA3] ring-1 ring-[#FF4FA3]'
                : 'bg-[#f0e7ff] dark:bg-[#201B3B] text-[#5e5779] dark:text-[#77738A] border-[#cdc3dd] dark:border-[#2E2854] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
            }`}
          >
            Quick Wins
          </button>
          <button
            onClick={() => setSelectedQuadrant('Strategic Project')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selectedQuadrant === 'Strategic Project'
                ? 'bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] border-[#9B5DE5] ring-1 ring-[#9B5DE5]'
                : 'bg-[#f0e7ff] dark:bg-[#201B3B] text-[#5e5779] dark:text-[#77738A] border-[#cdc3dd] dark:border-[#2E2854] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
            }`}
          >
            Strategic Projects
          </button>
          <button
            onClick={() => setSelectedQuadrant('Fill-in Task')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selectedQuadrant === 'Fill-in Task'
                ? 'bg-[#FFE66D]/40 dark:bg-[#FFE66D]/20 text-[#7A6100] dark:text-[#FFE66D] border-[#d4be3d] dark:border-[#FFE66D] ring-1 ring-[#FFE66D]'
                : 'bg-[#f0e7ff] dark:bg-[#201B3B] text-[#5e5779] dark:text-[#77738A] border-[#cdc3dd] dark:border-[#2E2854] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
            }`}
          >
            Fill-in Tasks
          </button>
        </div>
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInterventions.map((intv) => (
          <InterventionCard key={intv.id} intervention={intv} />
        ))}
      </div>

      {filteredInterventions.length === 0 && (
        <div className="rounded-2xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-12 text-center text-[#5e5779] dark:text-[#77738A] shadow-xs">
          <Lightbulb className="w-8 h-8 mx-auto text-[#5e5779]/50 dark:text-[#77738A]/50 mb-2" />
          <p className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF]">No matching recommendations found</p>
          <p className="text-xs mt-1">Try clearing your search query or selecting "All Interventions".</p>
        </div>
      )}

      {/* Grouped by Community Need Accordion / Section */}
      <div className="pt-6 space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#211B38] dark:text-[#FAF7FF]">Browse by Recurring Community Need</h2>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
            Each recurring need clusters 2–3 targeted interventions addressing root systemic failures.
          </p>
        </div>

        <div className="grid gap-3">
          {analysisResult.needs.map((need) => (
            <div
              key={need.id}
              onClick={() => openNeedDetails(need)}
              className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#FF4FA3] p-4 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-xs"
            >
              <div className="flex items-start space-x-3">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#17132B] text-[#D81B76] dark:text-[#FF4FA3] border border-[#cdc3dd] dark:border-[#2E2854]">
                  #{need.rank}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF] group-hover:text-[#D81B76] dark:group-hover:text-[#FF4FA3] transition-colors">
                      {need.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] font-bold">
                      {need.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#5e5779] dark:text-[#77738A] mt-0.5 line-clamp-1">
                    {need.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold text-[#7A6100] dark:text-[#FFE66D]">{need.interventionCount} Interventions</span>
                  <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">{need.feedbackCount} Evidence Quotes</p>
                </div>
                <div className="p-2 rounded-lg bg-[#f0e7ff] dark:bg-[#17132B] text-[#5e5779] dark:text-[#77738A] group-hover:text-[#D81B76] dark:group-hover:text-[#FF4FA3] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
