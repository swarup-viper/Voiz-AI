'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnalysisResult, CommunityType, CommunityNeed, Intervention } from '@/types';
import { ApiClient } from '@/lib/api';

export type NavSection = 'overview' | 'analyze' | 'opportunity-map' | 'recommendations' | 'evidence';
export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  communityType: CommunityType;
  setCommunityType: (type: CommunityType) => void;
  activeNav: NavSection;
  setActiveNav: (nav: NavSection) => void;
  analysisResult: AnalysisResult;
  setAnalysisResult: (result: AnalysisResult) => void;
  selectedNeed: CommunityNeed | null;
  setSelectedNeed: (need: CommunityNeed | null) => void;
  selectedIntervention: Intervention | null;
  setSelectedIntervention: (intervention: Intervention | null) => void;
  isDetailDrawerOpen: boolean;
  setIsDetailDrawerOpen: (open: boolean) => void;
  openNeedDetails: (need: CommunityNeed) => void;
  openInterventionDetails: (intervention: Intervention) => void;
  loadDemoData: (type?: CommunityType) => void;
  loadSavedResults: () => Promise<boolean>;
  isLoadingSaved: boolean;
  savedResultsError: string | null;
  evidenceFilter: {
    search: string;
    theme: string;
    sentiment: string;
  };
  setEvidenceFilter: React.Dispatch<React.SetStateAction<{ search: string; theme: string; sentiment: string }>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [communityType, setCommunityTypeState] = useState<CommunityType>('students');
  const [activeNav, setActiveNav] = useState<NavSection>('overview');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(() =>
    ApiClient.getDemoDataset('students')
  );
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedResultsError, setSavedResultsError] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<CommunityNeed | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState({
    search: '',
    theme: 'all',
    sentiment: 'all',
  });

  // Initialize theme from localStorage without hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voiz-theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Default to light as requested
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // localStorage may fail in restricted sandboxes
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('voiz-theme', newTheme);
    } catch (e) {}

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const setCommunityType = (type: CommunityType) => {
    setCommunityTypeState(type);
    const newDataset = ApiClient.getDemoDataset(type);
    setAnalysisResult(newDataset);
    setSelectedNeed(null);
    setSelectedIntervention(null);
    setIsDetailDrawerOpen(false);
  };

  const loadDemoData = (type: CommunityType = communityType) => {
    const freshData = ApiClient.getDemoDataset(type);
    setAnalysisResult(freshData);
    setSavedResultsError(null);
  };

  // Pull everything the backend has stored (GET /api/opportunities).
  const loadSavedResults = async (): Promise<boolean> => {
    setIsLoadingSaved(true);
    setSavedResultsError(null);
    const res = await ApiClient.getSavedResults(communityType);
    setIsLoadingSaved(false);
    if (res.success && res.data) {
      setAnalysisResult(res.data);
      setSelectedNeed(null);
      setSelectedIntervention(null);
      setIsDetailDrawerOpen(false);
      return true;
    }
    setSavedResultsError(res.error || 'Could not load saved results.');
    return false;
  };

  const openNeedDetails = (need: CommunityNeed) => {
    setSelectedNeed(need);
    setSelectedIntervention(null);
    setIsDetailDrawerOpen(true);
  };

  const openInterventionDetails = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    const relatedNeed = analysisResult.needs.find((n) => n.id === intervention.needId) || null;
    setSelectedNeed(relatedNeed);
    setIsDetailDrawerOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        communityType,
        setCommunityType,
        activeNav,
        setActiveNav,
        analysisResult,
        setAnalysisResult,
        selectedNeed,
        setSelectedNeed,
        selectedIntervention,
        setSelectedIntervention,
        isDetailDrawerOpen,
        setIsDetailDrawerOpen,
        openNeedDetails,
        openInterventionDetails,
        loadDemoData,
        loadSavedResults,
        isLoadingSaved,
        savedResultsError,
        evidenceFilter,
        setEvidenceFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
