'use client';

import React from 'react';
import { OpportunityMatrix } from '../opportunity/OpportunityMatrix';
import { useApp } from '@/context/AppContext';
import { Zap, Rocket, CheckSquare, AlertCircle } from 'lucide-react';
import { InterventionCard } from '../recommendations/InterventionCard';

export const OpportunityMapView: React.FC = () => {
  const { analysisResult } = useApp();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="bg-[#ffffff] dark:bg-[#201B3B] p-6 rounded-2xl border border-[#cdc3dd] dark:border-[#2E2854] space-y-2 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] border border-[#9B5DE5]/30">
            Strategic Prioritization
          </span>
          <span className="text-xs text-[#5e5779] dark:text-[#77738A] font-medium">2×2 Opportunity Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
          Opportunity Map: Impact vs. Effort
        </h1>
        <p className="text-xs sm:text-sm text-[#5e5779] dark:text-[#77738A] leading-relaxed max-w-3xl">
          Actionable interventions mapped onto a classic 2×2 decision matrix. High-impact Quick Wins
          build immediate campus momentum, while Strategic Projects drive fundamental long-term reform.
        </p>
      </div>

      {/* The Interactive 2x2 Matrix */}
      <OpportunityMatrix compact={false} />

      {/* Quadrants Breakdown & Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#FFE4F0]/80 dark:bg-[#FF4FA3]/10 border border-[#FF4FA3]/40 dark:border-[#FF4FA3]/30 p-4 space-y-2 shadow-xs transition-colors duration-200">
          <div className="flex items-center space-x-2 text-[#D81B76] dark:text-[#FF4FA3]">
            <Zap className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">Quick Wins</h3>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            High impact, low effort. Prioritize for rapid deployment (within 1–3 weeks) to prove tangible progress to community members.
          </p>
        </div>

        <div className="rounded-xl bg-[#F0E7FF]/90 dark:bg-[#9B5DE5]/10 border border-[#9B5DE5]/40 dark:border-[#9B5DE5]/30 p-4 space-y-2 shadow-xs transition-colors duration-200">
          <div className="flex items-center space-x-2 text-[#7934CF] dark:text-[#9B5DE5]">
            <Rocket className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">Strategic Projects</h3>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            High impact, high effort. Core infrastructural overhauls requiring administrative allocation, vendor RFPs, or committee review.
          </p>
        </div>

        <div className="rounded-xl bg-[#FFF9F5] dark:bg-[#FFE66D]/10 border border-[#FFE66D]/70 dark:border-[#FFE66D]/30 p-4 space-y-2 shadow-xs transition-colors duration-200">
          <div className="flex items-center space-x-2 text-[#7A6100] dark:text-[#FFE66D]">
            <CheckSquare className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">Fill-in Tasks</h3>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            Low impact, low effort. Incremental maintenance tickets and simple policy communications handled alongside normal operations.
          </p>
        </div>

        <div className="rounded-xl bg-[#FFF0ED] dark:bg-[#FF8066]/10 border border-[#FF8066]/40 dark:border-[#FF8066]/30 p-4 space-y-2 shadow-xs transition-colors duration-200">
          <div className="flex items-center space-x-2 text-[#D9492A] dark:text-[#FF8066]">
            <AlertCircle className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">Reconsider</h3>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed">
            Low impact, high effort. Excessive complexity with limited user satisfaction. Should be descoped, automated, or discarded.
          </p>
        </div>
      </div>

      {/* Complete List of Interventions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#211B38] dark:text-[#FAF7FF]">All Prioritized Interventions</h2>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
            Trace every intervention back to its supporting quotes in student and community feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisResult.interventions.map((intv) => (
            <InterventionCard key={intv.id} intervention={intv} />
          ))}
        </div>
      </div>
    </div>
  );
};
