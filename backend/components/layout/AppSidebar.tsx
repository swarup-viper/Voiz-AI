'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Grid2X2, 
  Lightbulb, 
  FileSearch, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { useApp, NavSection } from '@/context/AppContext';
import { COMMUNITY_CONFIGS } from '@/data/mockData';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const { activeNav, setActiveNav, communityType, analysisResult, loadDemoData } = useApp();
  const currentConfig = COMMUNITY_CONFIGS[communityType];

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'analyze',
      label: 'Analyze Feedback',
      icon: <UploadCloud className="w-4 h-4" />,
      badge: 'Input',
    },
    {
      id: 'opportunity-map',
      label: 'Opportunity Map',
      icon: <Grid2X2 className="w-4 h-4" />,
      badge: '2x2',
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: <Lightbulb className="w-4 h-4" />,
      badge: String(analysisResult.interventions.length),
    },
    {
      id: 'evidence',
      label: 'Evidence Explorer',
      icon: <FileSearch className="w-4 h-4" />,
      badge: String(analysisResult.rawFeedback.length),
    },
  ];

  const handleNavClick = (id: NavSection) => {
    setActiveNav(id);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#dad2e8] dark:bg-[#17132B] border-r border-[#cdc3dd] dark:border-[#2E2854] flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 border-b border-[#cdc3dd] dark:border-[#2E2854] flex items-center justify-between bg-[#dad2e8] dark:bg-[#17132B]">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9B5DE5] via-[#FF4FA3] to-[#FF8066] p-[2px] flex items-center justify-center shadow-md shadow-[#FF4FA3]/20">
              <div className="w-full h-full bg-[#211B38] dark:bg-[#17132B] rounded-[10px] flex items-center justify-center">
                <span className="text-[#FAF7FF] font-black text-lg tracking-wider">V</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#211B38] dark:text-[#FAF7FF] font-black text-lg tracking-tight">Voiz</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] border border-[#FF4FA3]/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#655e7e] dark:text-[#77738A] leading-none">Many Voices. One Clear Plan.</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-[#cdc3dd] dark:border-[#2E2854]/60 bg-[#ede7f5]/70 dark:bg-[#201B3B]/40">
          <div className="flex items-center space-x-2 text-xs text-[#655e7e] dark:text-[#77738A]">
            <Layers className="w-3.5 h-3.5 text-[#9B5DE5]" />
            <span className="truncate font-bold text-[#211B38] dark:text-[#FAF7FF]">{currentConfig.label}</span>
          </div>
          <p className="text-[11px] text-[#655e7e] dark:text-[#77738A] mt-0.5 line-clamp-1">{currentConfig.tagline}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-[#655e7e]/80 dark:text-[#77738A]/80">
            Platform Workflow
          </div>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#ffffff] dark:bg-[#2E2854] text-[#211B38] dark:text-[#FAF7FF] shadow-sm border-l-4 border-[#FF4FA3]'
                    : 'text-[#5e5779] dark:text-[#77738A] hover:bg-[#ede7f5] dark:hover:bg-[#201B3B] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${isActive ? 'text-[#FF4FA3]' : 'text-[#655e7e] dark:text-[#77738A] group-hover:text-[#211B38] dark:group-hover:text-[#FAF7FF]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#FF4FA3]/15 text-[#D81B76] dark:bg-[#FF4FA3]/20 dark:text-[#FF4FA3]'
                        : 'bg-[#ede7f5] dark:bg-[#201B3B] text-[#655e7e] dark:text-[#77738A] group-hover:text-[#211B38] dark:group-hover:text-[#FAF7FF]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#cdc3dd] dark:border-[#2E2854] bg-[#dad2e8] dark:bg-[#17132B] space-y-3">
          <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] p-3 border border-[#cdc3dd] dark:border-[#2E2854] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#E5B500] dark:bg-[#FFE66D] animate-pulse" />
                <span className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF]">Live Supabase Connected</span>
              </div>
              <button
                onClick={() => loadDemoData()}
                title="Reset to fresh demo sample"
                className="text-[11px] font-bold text-[#D81B76] dark:text-[#FF4FA3] hover:underline"
              >
                Demo
              </button>
            </div>
            <p className="text-[11px] text-[#655e7e] dark:text-[#77738A] mt-1 leading-relaxed">
              381 verified campus items with full evidence lineage.
            </p>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-[#655e7e] dark:text-[#77738A]">
            <div className="flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Backend Online</span>
            </div>
            <span className="text-[10px] text-[#655e7e]/80 dark:text-[#77738A]/60">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
