'use client';

import React from 'react';
import { Quote, Clock } from 'lucide-react';
import { FeedbackItem } from '@/types';

interface EvidenceQuoteProps {
  item: FeedbackItem;
  highlightTheme?: string;
  onSelectNeed?: (theme: string) => void;
}

export const EvidenceQuote: React.FC<EvidenceQuoteProps> = ({
  item,
  highlightTheme,
  onSelectNeed,
}) => {
  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30';
      case 'high':
        return 'bg-[#FF8066]/15 text-[#D9492A] dark:text-[#FF8066] border-[#FF8066]/40';
      case 'medium':
        return 'bg-[#FFE66D]/40 dark:bg-[#FFE66D]/15 text-[#7A6100] dark:text-[#FFE66D] border-[#d4be3d]/60 dark:border-[#FFE66D]/30';
      default:
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'negative':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-[#ede7f5] dark:bg-[#77738A]/15 text-[#5e5779] dark:text-[#77738A] border-[#cdc3dd] dark:border-[#2E2854]';
    }
  };

  return (
    <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#9B5DE5] p-4 transition-all duration-150 shadow-xs group">
      {/* Header: ID, Source, Group */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#ede7f5] dark:border-[#2E2854]/60">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#17132B] text-[#7934CF] dark:text-[#FFE66D] border border-[#cdc3dd] dark:border-[#2E2854]">
            {item.id}
          </span>
          {item.source && (
            <span className="text-[11px] text-[#5e5779] dark:text-[#77738A]">
              via <strong className="text-[#211B38] dark:text-[#FAF7FF] font-bold">{item.source}</strong>
            </span>
          )}
          {item.group && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#ede7f5] dark:bg-[#2E2854] text-[#211B38] dark:text-[#FAF7FF] font-medium">
              {item.group}
            </span>
          )}
        </div>

        {/* Badges: Urgency & Sentiment */}
        <div className="flex items-center space-x-1.5 text-[10px] font-bold">
          {item.urgency && (
            <span className={`px-2 py-0.5 rounded-full border ${getUrgencyBadge(item.urgency)}`}>
              {item.urgency.toUpperCase()}
            </span>
          )}
          {item.sentiment && (
            <span className={`px-2 py-0.5 rounded-full border capitalize ${getSentimentBadge(item.sentiment)}`}>
              {item.sentiment}
            </span>
          )}
        </div>
      </div>

      {/* Quote Body */}
      <div className="mt-3 flex items-start space-x-2.5">
        <Quote className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3] shrink-0 mt-0.5 opacity-70" />
        <p className="text-xs sm:text-sm text-[#211B38] dark:text-[#FAF7FF] leading-relaxed italic font-medium">
          "{item.feedback}"
        </p>
      </div>

      {/* Footer: Theme Attribution & Timestamp */}
      <div className="mt-3.5 pt-2 border-t border-[#ede7f5] dark:border-[#2E2854]/40 flex flex-wrap items-center justify-between text-[11px] text-[#5e5779] dark:text-[#77738A]">
        {item.theme && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-[#5e5779] dark:text-[#77738A]">Attributed Theme:</span>
            <button
              onClick={() => onSelectNeed && onSelectNeed(item.theme!)}
              className="text-xs font-bold text-[#D81B76] dark:text-[#FF4FA3] hover:underline"
            >
              {item.theme}
            </button>
          </div>
        )}

        {item.timestamp && (
          <div className="flex items-center space-x-1 text-[10px]">
            <Clock className="w-3 h-3 text-[#5e5779] dark:text-[#77738A]" />
            <span>{item.timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
};
