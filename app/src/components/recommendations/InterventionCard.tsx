'use client';

import React from 'react';
import { 
  Clock, 
  Quote, 
  ArrowRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Intervention } from '@/types';
import { formatScore, getQuadrantColor } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface InterventionCardProps {
  intervention: Intervention;
}

export const InterventionCard: React.FC<InterventionCardProps> = ({ intervention }) => {
  const { openInterventionDetails } = useApp();
  const quadStyle = getQuadrantColor(intervention.quadrant);

  return (
    <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#FF4FA3] p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm group">
      <div>
        {/* Header: Badges & Timeline */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${quadStyle.bg} ${quadStyle.text} ${quadStyle.border}`}>
              {intervention.quadrant}
            </span>
            <span className="text-xs text-[#5e5779] dark:text-[#77738A] flex items-center space-x-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{intervention.timeline}</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#5e5779] dark:text-[#77738A] bg-[#f0e7ff] dark:bg-[#17132B] px-2 py-0.5 rounded border border-[#cdc3dd] dark:border-[#2E2854] font-bold">
            {intervention.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#211B38] dark:text-[#FAF7FF] group-hover:text-[#D81B76] dark:group-hover:text-[#FF4FA3] transition-colors leading-snug">
          {intervention.title}
        </h3>

        {/* Related Community Need */}
        <div className="mt-2 flex items-center space-x-1.5 text-xs text-[#5e5779] dark:text-[#77738A]">
          <span>Addresses:</span>
          <strong className="text-[#7934CF] dark:text-[#9B5DE5] font-bold">{intervention.needTitle}</strong>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed line-clamp-3">
          {intervention.description}
        </p>
      </div>

      {/* Footer: Impact & Effort Metrics + Traceable Evidence CTA */}
      <div className="mt-5 pt-3 border-t border-[#ede7f5] dark:border-[#2E2854] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[#5e5779] dark:text-[#77738A]">
            <TrendingUp className="w-3.5 h-3.5 text-[#D81B76] dark:text-[#FF4FA3]" />
            <span>Impact: <strong className="text-[#211B38] dark:text-[#FAF7FF] font-bold">{formatScore(intervention.impact)}/5</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#5e5779] dark:text-[#77738A]">
            <BarChart2 className="w-3.5 h-3.5 text-[#7934CF] dark:text-[#9B5DE5]" />
            <span>Effort: <strong className="text-[#211B38] dark:text-[#FAF7FF] font-bold">{formatScore(intervention.effort)}/5</strong></span>
          </div>
        </div>

        <button
          onClick={() => openInterventionDetails(intervention)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#f0e7ff] dark:bg-[#17132B] hover:bg-[#e6ddf5] dark:hover:bg-[#2E2854] border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#FF4FA3] text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] transition-all"
        >
          <Quote className="w-3 h-3 text-[#7934CF] dark:text-[#FFE66D]" />
          <span>{intervention.supportingEvidenceCount} Evidence Quotes</span>
          <ArrowRight className="w-3 h-3 text-[#D81B76] dark:text-[#FF4FA3]" />
        </button>
      </div>
    </div>
  );
};
