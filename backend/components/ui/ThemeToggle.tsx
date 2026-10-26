'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (☀️)' : 'Switch to Dark Mode (🌙)'}
      className={`relative inline-flex items-center p-1 rounded-full transition-all duration-200 border select-none focus:outline-none focus:ring-2 focus:ring-[#9B5DE5]/50 cursor-pointer shadow-xs ${
        isDark
          ? 'bg-[#201B3B] border-[#2E2854]'
          : 'bg-[#ffffff] border-[#cdc3dd]'
      } ${className}`}
    >
      <span className="sr-only">{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>

      <div className="flex items-center space-x-1">
        <div
          className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${
            !isDark
              ? 'bg-[#FFE66D]/50 text-[#7A6100] shadow-xs scale-105'
              : 'text-[#77738A] opacity-50 hover:opacity-90'
          }`}
        >
          <Sun className="w-3.5 h-3.5 transition-transform duration-200" />
        </div>

        <div
          className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center ${
            isDark
              ? 'bg-[#9B5DE5]/30 text-[#FFE66D] shadow-xs scale-105'
              : 'text-[#5e5779] opacity-50 hover:opacity-90'
          }`}
        >
          <Moon className="w-3.5 h-3.5 transition-transform duration-200" />
        </div>
      </div>
    </button>
  );
};
