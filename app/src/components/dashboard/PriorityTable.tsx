'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  Filter, 
  Info, 
  Flame,
  MessageSquare,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatScore, getSeverityBadge } from '@/lib/utils';
import { PriorityScoreBreakdown } from './PriorityScoreBreakdown';

interface PriorityTableProps {
  limit?: number;
  showFilters?: boolean;
}

export const PriorityTable: React.FC<PriorityTableProps> = ({
  limit,
  showFilters = true,
}) => {
  const { analysisResult, openNeedDetails } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'feedback' | 'rank'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const filteredNeeds = useMemo(() => {
    let list = [...analysisResult.needs];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      list = list.filter((n) => {
        const badge = getSeverityBadge(n.severityScore);
        return badge.label.toLowerCase() === severityFilter.toLowerCase();
      });
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        comparison = a.priorityScore - b.priorityScore;
      } else if (sortBy === 'feedback') {
        comparison = a.feedbackCount - b.feedbackCount;
      } else if (sortBy === 'rank') {
        comparison = a.rank - b.rank;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    if (limit && limit > 0) {
      return list.slice(0, limit);
    }

    return list;
  }, [analysisResult.needs, searchTerm, severityFilter, sortBy, sortOrder, limit]);

  const toggleSort = (type: 'priority' | 'feedback' | 'rank') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Formula Toggle */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#655e7e] dark:text-[#77738A]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search needs, keywords, or categories..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#211B38] dark:text-[#FAF7FF] placeholder-[#77738A] focus:outline-none focus:border-[#FF4FA3] shadow-sm transition-colors"
            />
          </div>

          {/* Severity Filter & Formula Explainer Button */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#655e7e] dark:text-[#77738A] shadow-sm">
              <Filter className="w-3.5 h-3.5 text-[#7934CF] dark:text-[#9B5DE5]" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-xs text-[#211B38] dark:text-[#FAF7FF] font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#ffffff] dark:bg-[#201B3B]">All Severities</option>
                <option value="critical" className="bg-[#ffffff] dark:bg-[#201B3B]">Critical (≥4.5)</option>
                <option value="high" className="bg-[#ffffff] dark:bg-[#201B3B]">High (3.5–4.4)</option>
                <option value="medium" className="bg-[#ffffff] dark:bg-[#201B3B]">Medium (&lt;3.5)</option>
              </select>
            </div>

            <button
              onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                showFormulaInfo
                  ? 'bg-[#FF4FA3]/15 border-[#FF4FA3] text-[#D81B76] dark:text-[#FF4FA3]'
                  : 'bg-[#ffffff] dark:bg-[#201B3B] border-[#cdc3dd] dark:border-[#2E2854] text-[#655e7e] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ranking Formula</span>
            </button>
          </div>
        </div>
      )}

      {/* Optional Formula Explainer Collapsible */}
      {showFormulaInfo && (
        <div className="animate-in fade-in duration-150">
          <PriorityScoreBreakdown />
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] overflow-hidden shadow-sm transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-[#f0e7ff]/80 dark:bg-[#17132B] text-[#655e7e] dark:text-[#77738A] uppercase font-bold text-[11px] border-b border-[#cdc3dd] dark:border-[#2E2854] select-none">
              <tr>
                <th 
                  onClick={() => toggleSort('rank')} 
                  className="py-3 px-4 cursor-pointer hover:text-[#211B38] dark:hover:text-[#FAF7FF] w-14"
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Community Need</th>
                <th 
                  onClick={() => toggleSort('feedback')} 
                  className="py-3 px-4 cursor-pointer hover:text-[#211B38] dark:hover:text-[#FAF7FF] text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Feedback</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-center">Urgency</th>
                <th 
                  onClick={() => toggleSort('priority')} 
                  className="py-3 px-4 cursor-pointer hover:text-[#211B38] dark:hover:text-[#FAF7FF] text-center"
                >
                  <div className="flex items-center justify-center space-x-1 text-[#D81B76] dark:text-[#FF4FA3]">
                    <span>Priority Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Interventions</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#ede7f5] dark:divide-[#2E2854]">
              {filteredNeeds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#655e7e] dark:text-[#77738A]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#655e7e]/60 dark:text-[#77738A]/60" />
                    <p className="font-bold text-[#211B38] dark:text-[#FAF7FF]">No matching community needs found</p>
                    <p className="text-[11px] mt-1">Try adjusting your search query or severity filter.</p>
                  </td>
                </tr>
              ) : (
                filteredNeeds.map((need) => {
                  const severityBadge = getSeverityBadge(need.severityScore);
                  return (
                    <tr
                      key={need.id}
                      onClick={() => openNeedDetails(need)}
                      className="group cursor-pointer hover:bg-[#f6f2fc] dark:hover:bg-[#28224A]/70 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#211B38] dark:text-[#FAF7FF]">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          need.rank === 1
                            ? 'bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3] border border-[#FF4FA3]/40'
                            : need.rank <= 3
                            ? 'bg-[#9B5DE5]/20 text-[#7934CF] dark:text-[#9B5DE5] border border-[#9B5DE5]/40'
                            : 'bg-[#ede7f5] dark:bg-[#17132B] text-[#655e7e] dark:text-[#77738A]'
                        }`}>
                          #{need.rank}
                        </span>
                      </td>

                      {/* Title & Summary */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#211B38] dark:text-[#FAF7FF] group-hover:text-[#D81B76] dark:group-hover:text-[#FF4FA3] transition-colors">
                            {need.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#17132B] text-[#7934CF] dark:text-[#77738A] border border-[#cdc3dd] dark:border-[#2E2854] font-semibold">
                            {need.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5e5779] dark:text-[#77738A] mt-1 line-clamp-1">
                          {need.summary}
                        </p>
                      </td>

                      {/* Feedback Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#f0e7ff] dark:bg-[#17132B] text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] border border-[#cdc3dd] dark:border-[#2E2854]">
                          <MessageSquare className="w-3 h-3 text-[#7934CF] dark:text-[#FFE66D]" />
                          <span>{need.feedbackCount}</span>
                        </span>
                      </td>

                      {/* Severity Gauge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${severityBadge.bg} ${severityBadge.text} ${severityBadge.border}`}>
                          {severityBadge.label} ({formatScore(need.severityScore)})
                        </span>
                      </td>

                      {/* Urgency Score */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#211B38] dark:text-[#FAF7FF]">
                        {formatScore(need.urgencyScore)}/5.0
                      </td>

                      {/* Priority Score Breakdown */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#FF4FA3]/15 border border-[#FF4FA3]/40 text-[#D81B76] dark:text-[#FF4FA3] font-black font-mono text-sm">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{formatScore(need.priorityScore)}</span>
                        </div>
                      </td>

                      {/* Suggested Interventions */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 text-xs text-[#5e5779] dark:text-[#77738A]">
                          <Wrench className="w-3 h-3 text-[#7934CF] dark:text-[#9B5DE5]" />
                          <span className="font-bold text-[#211B38] dark:text-[#FAF7FF]">{need.interventionCount}</span>
                          <span className="text-[10px]">plans</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openNeedDetails(need);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#f0e7ff] dark:bg-[#17132B] hover:bg-[#e6ddf5] dark:hover:bg-[#2E2854] text-[#211B38] dark:text-[#FAF7FF] text-xs font-bold border border-[#cdc3dd] dark:border-[#2E2854] group-hover:border-[#FF4FA3] transition-colors"
                        >
                          <span>Evidence</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#D81B76] dark:text-[#FF4FA3]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
