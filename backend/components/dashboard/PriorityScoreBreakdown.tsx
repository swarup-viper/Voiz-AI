'use client';

import React from 'react';
import { Calculator, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import { CommunityNeed } from '@/types';
import { formatScore } from '@/lib/utils';

interface PriorityScoreBreakdownProps {
  need?: CommunityNeed | null;
  showExplanationBanner?: boolean;
}

export const PriorityScoreBreakdown: React.FC<PriorityScoreBreakdownProps> = ({
  need,
  showExplanationBanner = true,
}) => {
  return (
    <div className="space-y-4">
      {showExplanationBanner && (
        <div className="rounded-xl bg-[#f0e7ff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-4 text-xs shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#211B38] dark:text-[#FAF7FF] font-bold">
              <Calculator className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />
              <span>Objective Ranking Formula</span>
            </div>
            <span className="text-[11px] font-mono text-[#7A6100] dark:text-[#FFE66D] bg-[#FFE66D]/40 dark:bg-[#FFE66D]/10 px-2 py-0.5 rounded border border-[#d4be3d]/60 dark:border-[#FFE66D]/20 font-bold">
              Score = Freq × Sev × Urg
            </span>
          </div>
          <p className="mt-2 text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            Every community need is ranked using three normalized dimensions (1.0 to 5.0).
            Multiplying avoids arbitrary weighting and balances broad sentiment frequency against high-distress life-safety emergencies.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#ffffff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <span className="text-[#D81B76] dark:text-[#FF4FA3] font-bold">Frequency (1–5):</span>
              <p className="text-[#5e5779] dark:text-[#77738A] mt-0.5">Normalized cluster volume against total dataset.</p>
            </div>
            <div className="p-2 rounded-lg bg-[#ffffff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <span className="text-[#7934CF] dark:text-[#9B5DE5] font-bold">Severity (1–5):</span>
              <p className="text-[#5e5779] dark:text-[#77738A] mt-0.5">Depth of harm or functional obstruction caused.</p>
            </div>
            <div className="p-2 rounded-lg bg-[#ffffff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <span className="text-[#D9492A] dark:text-[#FF8066] font-bold">Urgency (1–5):</span>
              <p className="text-[#5e5779] dark:text-[#77738A] mt-0.5">Immediate time-sensitivity and risk of escalation.</p>
            </div>
          </div>
        </div>
      )}

      {need && (
        <div className="rounded-xl bg-[#ffffff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] p-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-[#5e5779] dark:text-[#77738A]">
              Score Breakdown for: <span className="text-[#211B38] dark:text-[#FAF7FF]">{need.title}</span>
            </span>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#FF4FA3]/15 border border-[#FF4FA3]/40 text-xs font-black text-[#D81B76] dark:text-[#FF4FA3]">
              <Flame className="w-3.5 h-3.5" />
              <span>Priority: {formatScore(need.priorityScore)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#f0e7ff]/60 dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <div className="flex items-center justify-center space-x-1 text-xs text-[#D81B76] dark:text-[#FF4FA3] font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Frequency</span>
              </div>
              <div className="text-xl font-black text-[#211B38] dark:text-[#FAF7FF]">{formatScore(need.frequencyScore)}</div>
              <span className="text-[10px] text-[#5e5779] dark:text-[#77738A]">({need.feedbackCount} reports)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#f0e7ff]/60 dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <div className="flex items-center justify-center space-x-1 text-xs text-[#7934CF] dark:text-[#9B5DE5] font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Severity</span>
              </div>
              <div className="text-xl font-black text-[#211B38] dark:text-[#FAF7FF]">{formatScore(need.severityScore)}</div>
              <span className="text-[10px] text-[#5e5779] dark:text-[#77738A]">(out of 5.0)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#f0e7ff]/60 dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854]">
              <div className="flex items-center justify-center space-x-1 text-xs text-[#D9492A] dark:text-[#FF8066] font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Urgency</span>
              </div>
              <div className="text-xl font-black text-[#211B38] dark:text-[#FAF7FF]">{formatScore(need.urgencyScore)}</div>
              <span className="text-[10px] text-[#5e5779] dark:text-[#77738A]">(out of 5.0)</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center text-[11px] text-[#5e5779] dark:text-[#77738A] font-mono">
            <span>{formatScore(need.frequencyScore)} (Freq) × {formatScore(need.severityScore)} (Sev) × {formatScore(need.urgencyScore)} (Urg) = </span>
            <span className="ml-1 text-[#7934CF] dark:text-[#FFE66D] font-black">{formatScore(need.priorityScore)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
