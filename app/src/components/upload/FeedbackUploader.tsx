'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Database 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AnalysisResult, FeedbackItem } from '@/types';
import { CSVPreview } from './CSVPreview';
import { AnalysisProgress } from './AnalysisProgress';
import { ApiClient } from '@/lib/api';
import { STUDENT_RAW_FEEDBACK, COMMUNITY_CONFIGS } from '@/data/mockData';

export const FeedbackUploader: React.FC = () => {
  const { communityType, setAnalysisResult, setActiveNav } = useApp();
  const currentConfig = COMMUNITY_CONFIGS[communityType];

  const [inputMode, setInputMode] = useState<'csv' | 'paste'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<FeedbackItem[]>([]);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const pendingResult = useRef<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw CSV string or File using PapaParse
  const handleCSVParse = (fileOrText: File | string, filename = 'custom_feedback.csv') => {
    setErrorMessage(null);

    Papa.parse(fileOrText as any, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMessage('The CSV file does not contain any readable feedback entries.');
          return;
        }

        const fields = results.meta.fields || [];
        const hasFeedbackField = fields.some((f) => 
          f.toLowerCase().includes('feedback') || 
          f.toLowerCase().includes('complaint') || 
          f.toLowerCase().includes('comment') ||
          f.toLowerCase().includes('text')
        );

        if (!hasFeedbackField && !fields.includes('feedback')) {
          setErrorMessage('CSV missing required column "feedback". Found columns: ' + fields.join(', '));
          return;
        }

        const missing: string[] = [];
        if (!fields.includes('id')) missing.push('id');
        if (!fields.includes('source')) missing.push('source');
        if (!fields.includes('group')) missing.push('group');
        setMissingCols(missing);

        const items: FeedbackItem[] = (results.data as any[]).map((row, idx) => {
          const feedbackVal = row.feedback || row.Feedback || row.complaint || row.text || row.comment || '';
          return {
            id: row.id || `FB-${String(idx + 1).padStart(3, '0')}`,
            feedback: feedbackVal,
            source: row.source || row.Source || 'CSV Upload',
            group: row.group || row.Group || 'General Cohort',
          };
        }).filter((item) => item.feedback.trim().length > 0);

        setParsedRows(items);
      },
      error: (err) => {
        setErrorMessage(`CSV Parsing Error: ${err.message}`);
      },
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      handleCSVParse(file, file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCsvFile(file);
      handleCSVParse(file, file.name);
    }
  };

  // Sample CSV template download
  const handleDownloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "id,feedback,source,group\n" +
      "FB-101,\"Wi-Fi connection drops whenever more than 30 students join in Lecture Hall 2.\",\"Campus App\",\"Engineering\"\n" +
      "FB-102,\"Hot water supply in Hostel North Wing has been erratic for two weeks.\",\"Warden Portal\",\"Hostel North\"\n" +
      "FB-103,\"Dining hall food needs healthier vegetarian protein options like paneer or tofu.\",\"Student Council\",\"Mess 1\"\n" +
      "FB-104,\"Elective course registration server crashed at 9:00 AM on Monday.\",\"Academic Form\",\"Undergrads\"\n" +
      "FB-105,\"Library study desk power outlets are non-functional on the second floor.\",\"Library Kiosk\",\"General\"\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voiz_sample_feedback.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-load verified sample data
  const handleLoadSampleData = () => {
    setParsedRows(STUDENT_RAW_FEEDBACK);
    setCsvFile({ name: 'Spring_2026_Campus_Pulse.csv' } as File);
    setMissingCols([]);
    setErrorMessage(null);
  };

  // Pre-load sample paste text
  const handleLoadSamplePaste = () => {
    setPastedText(
      "Wi-Fi keeps dropping every 15 minutes in Hostel Block B.\n" +
      "Elevator in dorm tower 2 has been broken for three weeks.\n" +
      "Mess hall food served undercooked chicken on Thursday night.\n" +
      "Course portal crashed at 9 AM during elective registration.\n" +
      "Only 1 in 4 study desks have working power outlets in the library.\n" +
      "Grievance emails sent to administration take 3 weeks to receive a reply.\n" +
      "Campus electric shuttle bus stops running too early at 6 PM.\n" +
      "Counseling center appointment waitlist is currently 5 weeks long."
    );
  };

  // Calculate detected items for paste mode
  const detectedPasteItems: FeedbackItem[] = pastedText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, idx) => ({
      id: `PST-${String(idx + 1).padStart(3, '0')}`,
      feedback: line,
      source: 'Pasted Input',
      group: 'Direct Submission',
    }));

  const activeItems = inputMode === 'csv' ? parsedRows : detectedPasteItems;

  const handleStartAnalysis = async () => {
    if (activeItems.length === 0) return;
    setAnalysisError(null);
    setIsFinished(false);
    pendingResult.current = null;
    setIsAnalyzing(true);

    // Start the real backend call immediately; the progress screen waits on it.
    const result = await ApiClient.analyzeFeedback({
      communityType,
      items: activeItems,
      datasetName: inputMode === 'csv' && csvFile ? csvFile.name : 'Pasted Community Submissions',
    });

    if (result.success && result.data) {
      pendingResult.current = result.data;
      setIsFinished(true);
    } else {
      setIsAnalyzing(false);
      setAnalysisError(result.error || 'Analysis failed. Please try again.');
    }
  };

  const handleAnalysisCompleted = () => {
    if (pendingResult.current) {
      setAnalysisResult(pendingResult.current);
      pendingResult.current = null;
    }
    setIsAnalyzing(false);
    setIsFinished(false);
    setActiveNav('overview');
  };

  if (isAnalyzing) {
    return (
      <AnalysisProgress
        datasetName={csvFile?.name || 'Community Feedback Ingestion'}
        itemCount={activeItems.length}
        isFinished={isFinished}
        onComplete={handleAnalysisCompleted}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] dark:bg-[#201B3B] p-6 rounded-2xl border border-[#cdc3dd] dark:border-[#2E2854] shadow-sm transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-[#211B38] dark:text-[#FAF7FF] tracking-tight">
              Ingest & Analyze Community Feedback
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] font-bold border border-[#FF4FA3]/30">
              {currentConfig.label}
            </span>
          </div>
          <p className="text-xs text-[#5e5779] dark:text-[#77738A] mt-1 leading-relaxed">
            Upload a CSV or paste raw comments. The Voiz backend extracts themes with verbatim evidence, then ranks them by priority.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadSampleCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#f0e7ff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] hover:border-[#9B5DE5] shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#7934CF] dark:text-[#9B5DE5]" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={handleLoadSampleData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#f0e7ff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs font-bold text-[#7A6100] dark:text-[#FFE66D] hover:border-[#d4be3d] dark:hover:border-[#FFE66D] shadow-xs transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load 45 Campus Sample</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center space-x-2 p-1.5 bg-[#ffffff] dark:bg-[#201B3B] rounded-xl border border-[#cdc3dd] dark:border-[#2E2854] w-fit shadow-xs transition-colors duration-200">
        <button
          onClick={() => {
            setInputMode('csv');
            setErrorMessage(null);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            inputMode === 'csv'
              ? 'bg-[#f0e7ff] dark:bg-[#17132B] text-[#211B38] dark:text-[#FAF7FF] shadow-xs border border-[#cdc3dd] dark:border-[#2E2854]'
              : 'text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />
          <span>Upload CSV File</span>
        </button>

        <button
          onClick={() => {
            setInputMode('paste');
            setErrorMessage(null);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            inputMode === 'paste'
              ? 'bg-[#f0e7ff] dark:bg-[#17132B] text-[#211B38] dark:text-[#FAF7FF] shadow-xs border border-[#cdc3dd] dark:border-[#2E2854]'
              : 'text-[#5e5779] dark:text-[#77738A] hover:text-[#211B38] dark:hover:text-[#FAF7FF]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#7934CF] dark:text-[#9B5DE5]" />
          <span>Paste Raw Feedback</span>
        </button>
      </div>

      {/* Backend / Analysis Error */}
      {analysisError && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Analysis failed:</span> {analysisError}
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            className="font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Invalid Input Format:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* MODE 1: CSV Upload Interface */}
      {inputMode === 'csv' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-[#ffffff] dark:bg-[#201B3B]/60 shadow-xs ${
              isDragging
                ? 'border-[#FF4FA3] bg-[#FFE4F0]/40 dark:bg-[#FF4FA3]/10'
                : 'border-[#cdc3dd] dark:border-[#2E2854] hover:border-[#9B5DE5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#f0e7ff] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] flex items-center justify-center mx-auto mb-3 text-[#D81B76] dark:text-[#FF4FA3]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#211B38] dark:text-[#FAF7FF]">
              Drag and drop your CSV file here, or <span className="text-[#D81B76] dark:text-[#FF4FA3] underline">browse files</span>
            </h3>
            <p className="text-xs text-[#5e5779] dark:text-[#77738A] mt-1.5 max-w-md mx-auto">
              Expected headers: <code className="text-[#7934CF] dark:text-[#FFE66D] font-bold font-mono">id,feedback,source,group</code>.
              Supports exports from Google Forms, Qualtrics, Typeform, or 311 portal logs.
            </p>
          </div>

          {/* Parsed CSV Preview */}
          {parsedRows.length > 0 && (
            <CSVPreview
              filename={csvFile?.name || 'feedback_dataset.csv'}
              totalRows={parsedRows.length}
              previewRows={parsedRows.slice(0, 5)}
              missingColumns={missingCols}
            />
          )}
        </div>
      )}

      {/* MODE 2: Paste Feedback Interface */}
      {inputMode === 'paste' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#5e5779] dark:text-[#77738A]">Enter one feedback or complaint per line:</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLoadSamplePaste}
                  className="text-xs text-[#7934CF] dark:text-[#9B5DE5] hover:underline font-bold"
                >
                  Load 8 Sample Complaints
                </button>
                <span className="font-mono px-2 py-0.5 rounded bg-[#f0e7ff] dark:bg-[#17132B] text-[#7A6100] dark:text-[#FFE66D] border border-[#cdc3dd] dark:border-[#2E2854] font-bold">
                  {detectedPasteItems.length} lines detected
                </span>
              </div>
            </div>

            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw comments here...
E.g.:
Campus Wi-Fi drops every 15 minutes in Hostel Block B.
Elevator in dorm tower 2 has been broken for three weeks.
Mess hall food served undercooked chicken on Thursday night."
              className="w-full p-4 rounded-xl bg-[#f7f3fc] dark:bg-[#17132B] border border-[#cdc3dd] dark:border-[#2E2854] text-xs sm:text-sm text-[#211B38] dark:text-[#FAF7FF] placeholder-[#77738A] focus:outline-none focus:border-[#FF4FA3] font-sans leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-[#5e5779] dark:text-[#77738A]">
          {activeItems.length > 0 ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ready for analysis: {activeItems.length} community submissions</span>
            </span>
          ) : (
            <span>Please select a CSV or paste feedback to begin.</span>
          )}
        </div>

        <button
          disabled={activeItems.length === 0}
          onClick={handleStartAnalysis}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
            activeItems.length > 0
              ? 'bg-gradient-to-r from-[#FF4FA3] via-[#9B5DE5] to-[#FF8066] text-white hover:opacity-95 shadow-[#FF4FA3]/25 active:scale-95 cursor-pointer'
              : 'bg-[#ede7f5] dark:bg-[#201B3B] text-[#5e5779] dark:text-[#77738A] cursor-not-allowed opacity-60 border border-[#cdc3dd] dark:border-[#2E2854]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Feedback with Voiz AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
