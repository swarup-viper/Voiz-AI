'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { OverviewView } from '@/components/views/OverviewView';
import { FeedbackUploader } from '@/components/upload/FeedbackUploader';
import { OpportunityMapView } from '@/components/views/OpportunityMapView';
import { RecommendationsView } from '@/components/views/RecommendationsView';
import { EvidenceExplorerView } from '@/components/views/EvidenceExplorerView';
import { NeedDetailPanel } from '@/components/evidence/NeedDetailPanel';

export default function Home() {
  const { activeNav } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewView />;
      case 'analyze':
        return <FeedbackUploader />;
      case 'opportunity-map':
        return <OpportunityMapView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'evidence':
        return <EvidenceExplorerView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e0f0] dark:bg-[#17132B] flex text-[#211B38] dark:text-[#FAF7FF] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-[#e6e0f0] dark:bg-[#17132B] transition-colors duration-200">
        {/* Sticky Topbar */}
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#e6e0f0] dark:bg-[#17132B] transition-colors duration-200">
          {renderActiveView()}
        </main>

        {/* Slide-out Need & Evidence Lineage Detail Drawer */}
        <NeedDetailPanel />
      </div>
    </div>
  );
}
