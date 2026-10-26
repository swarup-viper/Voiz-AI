'use client';

import React from 'react';
import { 
  Menu, 
  ChevronDown, 
  Database, 
  PlusCircle, 
  School, 
  Building2, 
  Laptop,
  Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommunityType } from '@/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { 
    communityType, 
    setCommunityType, 
    activeNav, 
    setActiveNav, 
    analysisResult 
  } = useApp();

  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = React.useState(false);

  const getPageTitle = () => {
    switch (activeNav) {
      case 'overview':
        return 'Overview Dashboard';
      case 'analyze':
        return 'Feedback Upload & Analysis Engine';
      case 'opportunity-map':
        return 'Opportunity Map: Impact vs. Effort';
      case 'recommendations':
        return 'Actionable Interventions & Recommendations';
      case 'evidence':
        return 'Evidence Explorer & Lineage Trace';
      default:
        return 'Voiz Dashboard';
    }
  };

  const communityOptions: { id: CommunityType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'students',
      label: 'Student Community',
      icon: <School className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />,
      desc: 'Campus life, hostels, wi-fi, academic friction',
    },
    {
      id: 'public_services',
      label: 'Public Services',
      icon: <Building2 className="w-4 h-4 text-[#7934CF] dark:text-[#9B5DE5]" />,
      desc: 'Transit, sanitation, municipal citizen reports',
    },
    {
      id: 'product_team',
      label: 'Product Team',
      icon: <Laptop className="w-4 h-4 text-[#D9492A] dark:text-[#FF8066]" />,
      desc: 'SaaS user bugs, feature requests, churn signals',
    },
  ];

  const currentOption = communityOptions.find((c) => c.id === communityType) || communityOptions[0];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#e6e0f0]/95 dark:bg-[#17132B]/95 backdrop-blur-md border-b border-[#cdc3dd] dark:border-[#2E2854] px-4 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 -ml-2 rounded-lg text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF] hover:bg-[#ded7ec] dark:hover:bg-[#201B3B] lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#655e7e] dark:text-[#77738A] uppercase font-bold tracking-wider hidden sm:inline">
              Voiz
            </span>
            <span className="text-xs text-[#655e7e]/50 dark:text-[#77738A]/50 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-extrabold text-[#211B38] dark:text-[#FAF7FF] truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Community Selector, Dataset Badge, CTA */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Light / Dark Mode Toggle Button */}
        <ThemeToggle />

        {/* Community Type Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#9B5DE5] text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] shadow-sm transition-all"
          >
            {currentOption.icon}
            <span className="hidden md:inline font-bold">{currentOption.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#655e7e] dark:text-[#77738A]" />
          </button>

          {isCommunityDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsCommunityDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] shadow-2xl z-40 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#655e7e] dark:text-[#77738A] border-b border-[#ede7f5] dark:border-[#2E2854]">
                  Switch Community Lens
                </div>
                {communityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setCommunityType(opt.id);
                      setIsCommunityDropdownOpen(false);
                    }}
                    className={`w-full flex items-start space-x-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-all ${
                      communityType === opt.id
                        ? 'bg-[#f0e7ff] dark:bg-[#2E2854] text-[#211B38] dark:text-[#FAF7FF]'
                        : 'text-[#211B38] dark:text-[#FAF7FF] hover:bg-[#ede7f5] dark:hover:bg-[#17132B]'
                    }`}
                  >
                    <div className="mt-0.5">{opt.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{opt.label}</span>
                        {communityType === opt.id && (
                          <Check className="w-3.5 h-3.5 text-[#D81B76] dark:text-[#FF4FA3]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#655e7e] dark:text-[#77738A] mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dataset Label Badge */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs text-[#655e7e] dark:text-[#77738A] shadow-sm">
          <Database className="w-3.5 h-3.5 text-[#E5B500] dark:text-[#FFE66D]" />
          <span className="truncate max-w-[170px] text-[#211B38] dark:text-[#FAF7FF] font-bold">
            {analysisResult.datasetName}
          </span>
        </div>

        {/* Demo-Data Indicator */}
        {analysisResult.isDemoMode && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FFE66D]/40 dark:bg-[#FFE66D]/15 border border-[#d4be3d] dark:border-[#FFE66D]/30 text-[11px] font-bold text-[#7A6100] dark:text-[#FFE66D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5B500] dark:bg-[#FFE66D]" />
            <span className="hidden sm:inline">Demo Dataset</span>
            <span className="sm:hidden">Demo</span>
          </div>
        )}

        {/* Primary CTA: Analyze Feedback */}
        <button
          onClick={() => setActiveNav('analyze')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF4FA3] to-[#9B5DE5] hover:opacity-95 text-[#ffffff] text-xs font-bold shadow-md shadow-[#FF4FA3]/25 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Analyze Feedback</span>
        </button>
      </div>
    </header>
  );
};
