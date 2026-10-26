'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileSearch, 
  Search
} from 'lucide-react';
import { EvidenceQuote } from '../evidence/EvidenceQuote';

export const EvidenceExplorerView: React.FC = () => {
  const { 
    analysisResult, 
    evidenceFilter, 
    setEvidenceFilter, 
    openNeedDetails 
  } = useApp();

  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Extract unique themes present in raw feedback
  const uniqueThemes = useMemo(() => {
    const set = new Set<string>();
    analysisResult.rawFeedback.forEach((item) => {
      if (item.theme) set.add(item.theme);
    });
    return Array.from(set);
  }, [analysisResult.rawFeedback]);

  // Filter logic
  const filteredFeedback = useMemo(() => {
    return analysisResult.rawFeedback.filter((item) => {
      // Search
      const q = evidenceFilter.search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.feedback.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.group && item.group.toLowerCase().includes(q));

      // Theme
      const matchesTheme =
        evidenceFilter.theme === 'all' || item.theme === evidenceFilter.theme;

      // Sentiment
      const matchesSentiment =
        evidenceFilter.sentiment === 'all' ||
        (item.sentiment && item.sentiment.toLowerCase() === evidenceFilter.sentiment.toLowerCase());

      // Urgency
      const matchesUrgency =
        urgencyFilter === 'all' ||
        (item.urgency && item.urgency.toLowerCase() === urgencyFilter.toLowerCase());

      return matchesSearch && matchesTheme && matchesSentiment && matchesUrgency;
    });
  }, [analysisResult.rawFeedback, evidenceFilter, urgencyFilter]);

  const handleSelectTheme = (themeName: string) => {
    const relatedNeed = analysisResult.needs.find((n) => n.title === themeName);
    if (relatedNeed) {
      openNeedDetails(relatedNeed);
    } else {
      setEvidenceFilter((prev) => ({ ...prev, theme: themeName }));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#ffffff] dark:bg-[#201B3B] p-6 rounded-2xl border border-[#cdc3dd] dark:border-[#2E2854] space-y-2 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] border border-[#FF4FA3]/30">
            Ground-Truth Lineage
          </span>
          <span className="text-xs text-[#5e5779] dark:text-[#77738A] font-medium">Traceable Citations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
          Evidence Explorer & Lineage Trace
        </h1>
        <p className="text-xs sm:text-sm text-[#5e5779] dark:text-[#77738A] leading-relaxed max-w-3xl">
          Every community need and intervention in Voiz is mathematically backed by verified, raw community feedback records.
          Inspect the exact quote, source channel, urgency rating, and sentiment behind each recommendation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] dark:bg-[#201B3B] p-4 rounded-xl border border-[#cdc3dd] dark:border-[#2E2854] space-y-3 shadow-xs transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5e5779] dark:text-[#77738A]" />
            <input
              type="text"
              value={evidenceFilter.search}
              onChange={(e) => setEvidenceFilter((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search feedback text, ID (e.g. FB-001), or author source..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f7f3fc] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#211B38] dark:text-[#FAF7FF] placeholder-[#77738A] focus:outline-none focus:border-[#FF4FA3] transition-colors"
            />
          </div>

          {/* Theme Dropdown */}
          <div>
            <select
              value={evidenceFilter.theme}
              onChange={(e) => setEvidenceFilter((prev) => ({ ...prev, theme: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-[#f7f3fc] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#211B38] dark:text-[#FAF7FF] font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#ffffff] dark:bg-[#201B3B]">All Attributed Themes</option>
              {uniqueThemes.map((t) => (
                <option key={t} value={t} className="bg-[#ffffff] dark:bg-[#201B3B]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Dropdown */}
          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f7f3fc] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#211B38] dark:text-[#FAF7FF] font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#ffffff] dark:bg-[#201B3B]">All Urgency Levels</option>
              <option value="critical" className="bg-[#ffffff] dark:bg-[#201B3B]">Critical</option>
              <option value="high" className="bg-[#ffffff] dark:bg-[#201B3B]">High</option>
              <option value="medium" className="bg-[#ffffff] dark:bg-[#201B3B]">Medium</option>
              <option value="low" className="bg-[#ffffff] dark:bg-[#201B3B]">Low</option>
            </select>
          </div>
        </div>

        {/* Counter and Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ede7f5] dark:border-[#2E2854] text-xs text-[#5e5779] dark:text-[#77738A]">
          <div className="flex items-center space-x-2">
            <span>Showing <strong className="text-[#211B38] dark:text-[#FAF7FF]">{filteredFeedback.length}</strong> of {analysisResult.rawFeedback.length} feedback items</span>
            {evidenceFilter.theme !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] text-[10px] font-bold">
                <span>Theme: {evidenceFilter.theme}</span>
                <button
                  onClick={() => setEvidenceFilter((prev) => ({ ...prev, theme: 'all' }))}
                  className="ml-1 hover:text-[#211B38] dark:hover:text-[#FAF7FF]"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Sentiment Filter Toggle Buttons */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[11px] text-[#5e5779] dark:text-[#77738A] font-medium">Sentiment:</span>
            {['all', 'negative', 'neutral', 'positive'].map((s) => (
              <button
                key={s}
                onClick={() => setEvidenceFilter((prev) => ({ ...prev, sentiment: s }))}
                className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all ${
                  evidenceFilter.sentiment === s
                    ? 'bg-[#211B38] dark:bg-[#FAF7FF] text-white dark:text-[#17132B] shadow-xs'
                    : 'bg-[#f0e7ff] dark:bg-[#17132B] text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF] border border-[#cdc3dd] dark:border-[#2E2854]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Evidence Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedback.map((item) => (
          <EvidenceQuote
            key={item.id}
            item={item}
            onSelectNeed={handleSelectTheme}
          />
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <div className="rounded-2xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-12 text-center text-[#5e5779] dark:text-[#77738A] shadow-xs">
          <FileSearch className="w-8 h-8 mx-auto text-[#5e5779]/50 dark:text-[#77738A]/50 mb-2" />
          <p className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF]">No matching feedback citations found</p>
          <p className="text-xs mt-1">Try resetting your search query or theme filter.</p>
          <button
            onClick={() => {
              setEvidenceFilter({ search: '', theme: 'all', sentiment: 'all' });
              setUrgencyFilter('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-[#f0e7ff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#D81B76] dark:text-[#FF4FA3] font-bold hover:border-[#FF4FA3]"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
