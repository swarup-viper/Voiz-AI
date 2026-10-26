'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Rocket, 
  CheckSquare, 
  AlertCircle, 
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Intervention } from '@/types';

interface OpportunityMatrixProps {
  compact?: boolean;
}

export const OpportunityMatrix: React.FC<OpportunityMatrixProps> = ({ compact = false }) => {
  const { analysisResult, openInterventionDetails } = useApp();
  const [hoveredIntervention, setHoveredIntervention] = useState<Intervention | null>(null);
  const [activeQuadrantFilter, setActiveQuadrantFilter] = useState<string>('all');

  const interventions = analysisResult.interventions || [];

  // Filter if user clicked a quadrant filter
  const displayedInterventions = activeQuadrantFilter === 'all'
    ? interventions
    : interventions.filter((i) => i.quadrant === activeQuadrantFilter);

  // Quadrants metadata
  const quadrantMeta = [
    {
      id: 'Quick Win',
      label: 'Quick Wins',
      subtitle: 'High Impact, Low Effort',
      desc: 'Immediate ROI actions. Prioritize for rapid momentum and high community visibility.',
      color: '#D81B76',
      badgeClass: 'bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3] border-[#FF4FA3]/40',
      icon: <Zap className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />,
    },
    {
      id: 'Strategic Project',
      label: 'Strategic Projects',
      subtitle: 'High Impact, High Effort',
      desc: 'Substantial structural transformations. Requires dedicated budget and roadmap scheduling.',
      color: '#7934CF',
      badgeClass: 'bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] border-[#9B5DE5]/40',
      icon: <Rocket className="w-4 h-4 text-[#7934CF] dark:text-[#9B5DE5]" />,
    },
    {
      id: 'Fill-in Task',
      label: 'Fill-in Tasks',
      subtitle: 'Low Impact, Low Effort',
      desc: 'Incremental, low-risk improvements. Perfect for interim sprints or tech-rep projects.',
      color: '#7A6100',
      badgeClass: 'bg-[#FFE66D]/40 dark:bg-[#FFE66D]/20 text-[#7A6100] dark:text-[#FFE66D] border-[#d4be3d]/60 dark:border-[#FFE66D]/30',
      icon: <CheckSquare className="w-4 h-4 text-[#7A6100] dark:text-[#FFE66D]" />,
    },
    {
      id: 'Reconsider',
      label: 'Reconsider / Deprioritize',
      subtitle: 'Low Impact, High Effort',
      desc: 'Resource drains with marginal community return. Avoid or restructure scope.',
      color: '#D9492A',
      badgeClass: 'bg-[#FF8066]/20 text-[#D9492A] dark:text-[#FF8066] border-[#FF8066]/40',
      icon: <AlertCircle className="w-4 h-4 text-[#D9492A] dark:text-[#FF8066]" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Quadrant Filter Pills */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ffffff] dark:bg-[#201B3B] p-4 rounded-xl border border-[#cdc3dd] dark:border-[#2E2854] shadow-sm transition-colors duration-200">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF]">Impact vs. Effort Opportunity Matrix</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] border border-[#9B5DE5]/30">
                Decision Framework
              </span>
            </div>
            <p className="text-xs text-[#5e5779] dark:text-[#77738A] mt-0.5">
              Click any node or card to inspect root-cause evidence quotes from student feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveQuadrantFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeQuadrantFilter === 'all'
                  ? 'bg-[#211B38] text-[#ffffff] dark:bg-[#FAF7FF] dark:text-[#17132B] shadow-sm'
                  : 'bg-[#f0e7ff] dark:bg-[#17132B] text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF] border border-[#cdc3dd] dark:border-[#2E2854]'
              }`}
            >
              All ({interventions.length})
            </button>
            {quadrantMeta.map((q) => {
              const count = interventions.filter((i) => i.quadrant === q.id).length;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuadrantFilter(q.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    activeQuadrantFilter === q.id
                      ? `${q.badgeClass} ring-1 ring-current`
                      : 'bg-[#f0e7ff] dark:bg-[#17132B] text-[#5e5779] dark:text-[#77738A] border-[#cdc3dd] dark:border-[#2E2854] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
                  }`}
                >
                  <span>{q.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffffff] dark:bg-[#201B3B] text-[#211B38] dark:text-[#FAF7FF]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The 2x2 Matrix Grid */}
      <div className="rounded-xl bg-[#f5effb] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] p-4 sm:p-5 overflow-hidden space-y-3 shadow-sm transition-colors duration-200">
        <div className="flex gap-3 items-stretch">
          {/* Y Axis Dedicated Column */}
          <div className="w-8 shrink-0 flex flex-col items-center justify-between py-4 select-none bg-[#ffffff] dark:bg-[#201B3B]/50 rounded-lg border border-[#cdc3dd] dark:border-[#2E2854] shadow-xs">
            <span className="text-[10px] font-black text-[#D81B76] dark:text-[#FF4FA3] uppercase tracking-wider">High</span>
            <div className="flex-1 flex flex-col items-center justify-center my-2 space-y-2">
              <div className="w-px flex-1 bg-gradient-to-b from-[#FF4FA3]/60 via-[#FF4FA3]/20 to-transparent" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#D81B76] dark:text-[#FF4FA3] [writing-mode:vertical-lr] rotate-180 py-2">
                IMPACT
              </span>
              <div className="w-px flex-1 bg-gradient-to-t from-[#5e5779]/40 via-[#5e5779]/20 to-transparent" />
            </div>
            <span className="text-[10px] font-bold text-[#5e5779] dark:text-[#77738A] uppercase tracking-wider">Low</span>
          </div>

          {/* Matrix Canvas: 2x2 Quadrant Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[380px] sm:min-h-[460px]">
            {/* Top-Left: Quick Wins (High Impact, Low Effort) - Blush Pink */}
            <div className="relative rounded-xl border border-dashed border-[#FF4FA3]/40 dark:border-[#FF4FA3]/30 bg-[#FFE4F0]/70 dark:bg-[#FF4FA3]/5 p-4 flex flex-col justify-between group shadow-xs">
              <div className="flex items-center justify-between border-b border-[#FF4FA3]/25 dark:border-[#FF4FA3]/20 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#D81B76] dark:text-[#FF4FA3]">Quick Wins</h3>
                    <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">High Impact • Low Effort</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3] font-bold">
                  Priority 1
                </span>
              </div>

              {/* Interventions in this quadrant */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {displayedInterventions
                  .filter((i) => i.quadrant === 'Quick Win')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openInterventionDetails(item)}
                      onMouseEnter={() => setHoveredIntervention(item)}
                      onMouseLeave={() => setHoveredIntervention(null)}
                      className="cursor-pointer rounded-lg bg-[#ffffff] dark:bg-[#201B3B]/90 border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#FF4FA3] p-2.5 transition-all hover:translate-x-1 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] line-clamp-1">
                          {item.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-[#D81B76] dark:text-[#FF4FA3] shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5e5779] dark:text-[#77738A]">
                        <span className="text-[#D81B76] dark:text-[#FF4FA3] font-bold truncate max-w-[140px]">
                          {item.needTitle}
                        </span>
                        <span className="font-medium">{item.supportingEvidenceCount} quotes</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top-Right: Strategic Projects (High Impact, High Effort) - Pale Lavender */}
            <div className="relative rounded-xl border border-dashed border-[#9B5DE5]/40 dark:border-[#9B5DE5]/30 bg-[#F0E7FF]/80 dark:bg-[#9B5DE5]/5 p-4 flex flex-col justify-between group shadow-xs">
              <div className="flex items-center justify-between border-b border-[#9B5DE5]/25 dark:border-[#9B5DE5]/20 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5]">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#7934CF] dark:text-[#9B5DE5]">Strategic Projects</h3>
                    <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">High Impact • High Effort</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] font-bold">
                  Planned Sprints
                </span>
              </div>

              {/* Interventions in this quadrant */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {displayedInterventions
                  .filter((i) => i.quadrant === 'Strategic Project')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openInterventionDetails(item)}
                      onMouseEnter={() => setHoveredIntervention(item)}
                      onMouseLeave={() => setHoveredIntervention(null)}
                      className="cursor-pointer rounded-lg bg-[#ffffff] dark:bg-[#201B3B]/90 border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#9B5DE5] p-2.5 transition-all hover:translate-x-1 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] line-clamp-1">
                          {item.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-[#7934CF] dark:text-[#9B5DE5] shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5e5779] dark:text-[#77738A]">
                        <span className="text-[#7934CF] dark:text-[#9B5DE5] font-bold truncate max-w-[140px]">
                          {item.needTitle}
                        </span>
                        <span className="font-medium">{item.supportingEvidenceCount} quotes</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom-Left: Fill-in Tasks (Low Impact, Low Effort) - Warm White */}
            <div className="relative rounded-xl border border-dashed border-[#FFE66D]/70 dark:border-[#FFE66D]/30 bg-[#FFF9F5] dark:bg-[#FFE66D]/5 p-4 flex flex-col justify-between group shadow-xs">
              <div className="flex items-center justify-between border-b border-[#FFE66D]/40 dark:border-[#FFE66D]/20 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-[#FFE66D]/40 text-[#7A6100] dark:text-[#FFE66D]">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#7A6100] dark:text-[#FFE66D]">Fill-in Tasks</h3>
                    <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">Low Impact • Low Effort</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE66D]/40 text-[#7A6100] dark:text-[#FFE66D] font-bold">
                  Quick Backlog
                </span>
              </div>

              {/* Interventions in this quadrant */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {displayedInterventions
                  .filter((i) => i.quadrant === 'Fill-in Task')
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openInterventionDetails(item)}
                      onMouseEnter={() => setHoveredIntervention(item)}
                      onMouseLeave={() => setHoveredIntervention(null)}
                      className="cursor-pointer rounded-lg bg-[#ffffff] dark:bg-[#201B3B]/90 border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#d4be3d] dark:hover:border-[#FFE66D] p-2.5 transition-all hover:translate-x-1 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] line-clamp-1">
                          {item.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-[#7A6100] dark:text-[#FFE66D] shrink-0 mt-0.5 opacity-60" />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5e5779] dark:text-[#77738A]">
                        <span className="text-[#7A6100] dark:text-[#FFE66D] font-bold truncate max-w-[140px]">
                          {item.needTitle}
                        </span>
                        <span className="font-medium">{item.supportingEvidenceCount} quotes</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom-Right: Reconsider (Low Impact, High Effort) */}
            <div className="relative rounded-xl border border-dashed border-[#FF8066]/50 dark:border-[#FF8066]/30 bg-[#FFF0ED] dark:bg-[#FF8066]/5 p-4 flex flex-col justify-between group shadow-xs">
              <div className="flex items-center justify-between border-b border-[#FF8066]/30 dark:border-[#FF8066]/20 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-[#FF8066]/20 text-[#D9492A] dark:text-[#FF8066]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#D9492A] dark:text-[#FF8066]">Reconsider</h3>
                    <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">Low Impact • High Effort</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF8066]/20 text-[#D9492A] dark:text-[#FF8066] font-bold">
                  Deprioritize
                </span>
              </div>

              {/* Interventions in this quadrant */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] pr-1">
                {displayedInterventions
                  .filter((i) => i.quadrant === 'Reconsider')
                  .length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#5e5779] dark:text-[#77738A]">
                      <CheckSquare className="w-6 h-6 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF]">No Low-Value Projects</p>
                      <p className="text-[10px] text-[#5e5779] dark:text-[#77738A]">All proposed interventions deliver high community leverage.</p>
                    </div>
                  ) : (
                    displayedInterventions
                      .filter((i) => i.quadrant === 'Reconsider')
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openInterventionDetails(item)}
                          className="cursor-pointer rounded-lg bg-[#ffffff] dark:bg-[#201B3B]/90 border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#FF8066] p-2.5 transition-all shadow-xs"
                        >
                          <h4 className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] line-clamp-1">{item.title}</h4>
                        </div>
                      ))
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* X Axis Dedicated Footer Bar */}
        <div className="ml-11 flex items-center justify-between px-4 py-2 rounded-lg bg-[#ffffff] dark:bg-[#201B3B]/60 border border-[#cdc3dd] dark:border-[#2E2854]/60 text-[11px] text-[#5e5779] dark:text-[#77738A] shadow-xs select-none">
          <div className="flex items-center space-x-1.5 font-bold">
            <span className="text-[#7A6100] dark:text-[#FFE66D]">←</span>
            <span>Low Effort (Fast turnaround)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7934CF] dark:bg-[#9B5DE5]" />
            <span className="font-black uppercase tracking-wider text-[#7934CF] dark:text-[#9B5DE5]">Effort Dimension</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7934CF] dark:bg-[#9B5DE5]" />
          </div>
          <div className="flex items-center space-x-1.5 font-bold">
            <span>High Effort (Complex build)</span>
            <span className="text-[#D9492A] dark:text-[#FF8066]">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};
