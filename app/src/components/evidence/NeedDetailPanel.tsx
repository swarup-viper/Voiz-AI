'use client';

import React from 'react';
import { 
  X, 
  Lightbulb, 
  Quote, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatScore, getSeverityBadge, getQuadrantColor } from '@/lib/utils';
import { EvidenceQuote } from './EvidenceQuote';
import { PriorityScoreBreakdown } from '../dashboard/PriorityScoreBreakdown';

export const NeedDetailPanel: React.FC = () => {
  const { 
    selectedNeed, 
    selectedIntervention,
    isDetailDrawerOpen, 
    setIsDetailDrawerOpen, 
    analysisResult,
    setActiveNav,
    setEvidenceFilter
  } = useApp();

  if (!isDetailDrawerOpen || (!selectedNeed && !selectedIntervention)) {
    return null;
  }

  // If opened via intervention, retrieve its need or fallback
  const need = selectedNeed || analysisResult.needs.find((n) => n.id === selectedIntervention?.needId);

  // Retrieve actual traced raw feedback items matching need's evidenceIds
  const tracedQuotes = need?.evidenceIds
    ? analysisResult.rawFeedback.filter((fb) => need.evidenceIds.includes(fb.id))
    : [];

  const severityBadge = need ? getSeverityBadge(need.severityScore) : null;

  const handleViewAllInEvidenceExplorer = () => {
    if (need) {
      setEvidenceFilter((prev) => ({ ...prev, theme: need.title, search: '' }));
      setIsDetailDrawerOpen(false);
      setActiveNav('evidence');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsDetailDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#f7f3fc] dark:bg-[#17132B] border-l border-[#cdc3dd] dark:border-[#2E2854] h-full overflow-y-auto shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-colors duration-200">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[#f7f3fc]/95 dark:bg-[#17132B]/95 backdrop-blur-md px-6 py-4 border-b border-[#cdc3dd] dark:border-[#2E2854] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] border border-[#FF4FA3]/30">
              {need ? `RANK #${need.rank}` : 'RECOMMENDATION'}
            </span>
            <span className="text-xs text-[#5e5779] dark:text-[#77738A] font-medium">Community Need Lineage</span>
          </div>

          <button
            onClick={() => setIsDetailDrawerOpen(false)}
            className="p-2 rounded-lg text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF] hover:bg-[#ede7f5] dark:hover:bg-[#201B3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Need Title & Badges */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#201B3B] text-[#7934CF] dark:text-[#9B5DE5] border border-[#cdc3dd] dark:border-[#2E2854]">
                {need?.category}
              </span>
              {severityBadge && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${severityBadge.bg} ${severityBadge.text} ${severityBadge.border}`}>
                  {severityBadge.label} Severity ({formatScore(need!.severityScore)})
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
              {need?.title}
            </h2>
            <p className="mt-2 text-sm text-[#5e5779] dark:text-[#77738A] leading-relaxed">
              {need?.summary}
            </p>
          </div>

          {/* Priority Score Breakdown Component */}
          {need && <PriorityScoreBreakdown need={need} showExplanationBanner={false} />}

          {/* Recommended Interventions for This Need */}
          {need && need.interventions && need.interventions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-[#7A6100] dark:text-[#FFE66D]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#211B38] dark:text-[#FAF7FF]">
                    Recommended Actionable Interventions ({need.interventions.length})
                  </h3>
                </div>
              </div>

              <div className="grid gap-3">
                {need.interventions.map((intv) => {
                  const quad = getQuadrantColor(intv.quadrant);
                  const isHighlighted = selectedIntervention?.id === intv.id;
                  return (
                    <div
                      key={intv.id}
                      className={`rounded-xl p-4 border transition-all shadow-xs ${
                        isHighlighted
                          ? 'bg-[#ffffff] dark:bg-[#28224A] border-[#FF4FA3] ring-2 ring-[#FF4FA3]/20'
                          : 'bg-[#ffffff] dark:bg-[#201B3B] border-[#cdc3dd] dark:border-[#2E2854]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${quad.bg} ${quad.text} ${quad.border}`}>
                              {intv.quadrant}
                            </span>
                            <span className="text-[11px] text-[#5e5779] dark:text-[#77738A] flex items-center space-x-1 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{intv.timeline}</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF]">{intv.title}</h4>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-[#5e5779] dark:text-[#77738A] leading-relaxed">
                        {intv.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-[#ede7f5] dark:border-[#2E2854]/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-3 text-[#5e5779] dark:text-[#77738A]">
                          <span>Impact: <strong className="text-[#211B38] dark:text-[#FAF7FF]">{intv.impact}/5.0</strong></span>
                          <span>Effort: <strong className="text-[#211B38] dark:text-[#FAF7FF]">{intv.effort}/5.0</strong></span>
                        </div>
                        <span className="text-[#D81B76] dark:text-[#FF4FA3] font-bold">
                          {intv.supportingEvidenceCount} Traced Feedback Records
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supporting Evidence Traceability Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Quote className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#211B38] dark:text-[#FAF7FF]">
                  Direct Supporting Feedback Evidence ({tracedQuotes.length})
                </h3>
              </div>

              {tracedQuotes.length > 0 && (
                <button
                  onClick={handleViewAllInEvidenceExplorer}
                  className="flex items-center space-x-1 text-xs text-[#D81B76] dark:text-[#FF4FA3] hover:underline font-bold"
                >
                  <span>Filter in Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
              Every priority score and recommendation is strictly traceable to authentic citizen/student submissions.
            </p>

            {/* List of Real Traced Evidence */}
            {tracedQuotes.length === 0 ? (
              <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-6 text-center text-[#5e5779] dark:text-[#77738A]">
                <ShieldAlert className="w-8 h-8 mx-auto text-[#5e5779]/60 dark:text-[#77738A]/60 mb-2" />
                <p className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF]">No supporting evidence available</p>
                <p className="text-[11px] mt-1">This need has no linked citations in the active dataset.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tracedQuotes.map((quote) => (
                  <EvidenceQuote key={quote.id} item={quote} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="sticky bottom-0 bg-[#f7f3fc] dark:bg-[#17132B] px-6 py-4 border-t border-[#cdc3dd] dark:border-[#2E2854] flex items-center justify-between">
          <button
            onClick={() => setIsDetailDrawerOpen(false)}
            className="px-4 py-2 rounded-lg bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] hover:bg-[#ede7f5] dark:hover:bg-[#28224A] shadow-xs"
          >
            Close Panel
          </button>

          <button
            onClick={handleViewAllInEvidenceExplorer}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF4FA3] to-[#9B5DE5] text-xs font-bold text-white hover:opacity-95 shadow-md shadow-[#FF4FA3]/20"
          >
            <span>Explore All Feedback Lineage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
