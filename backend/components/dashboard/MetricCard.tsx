'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  accentColor: 'pink' | 'purple' | 'coral' | 'yellow';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  accentColor,
  onClick,
}) => {
  const colorStyles = {
    pink: {
      border: 'hover:border-[#FF4FA3]',
      badge: 'bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] border-[#FF4FA3]/40',
      glow: 'hover:shadow-[#FF4FA3]/15',
    },
    purple: {
      border: 'hover:border-[#9B5DE5]',
      badge: 'bg-[#9B5DE5]/15 text-[#7934CF] dark:text-[#9B5DE5] border-[#9B5DE5]/40',
      glow: 'hover:shadow-[#9B5DE5]/15',
    },
    coral: {
      border: 'hover:border-[#FF8066]',
      badge: 'bg-[#FF8066]/15 text-[#D9492A] dark:text-[#FF8066] border-[#FF8066]/40',
      glow: 'hover:shadow-[#FF8066]/15',
    },
    yellow: {
      border: 'hover:border-[#d4be3d] dark:hover:border-[#FFE66D]',
      badge: 'bg-[#FFE66D]/40 dark:bg-[#FFE66D]/15 text-[#7A6100] dark:text-[#FFE66D] border-[#d4be3d]/60 dark:border-[#FFE66D]/30',
      glow: 'hover:shadow-[#FFE66D]/15',
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${colorStyles.border} ${colorStyles.glow} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-[#655e7e] dark:text-[#77738A] uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">{value}</span>
          </div>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorStyles.badge}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#655e7e] dark:text-[#77738A] leading-relaxed line-clamp-2">
        {description}
      </p>
    </div>
  );
};
