'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  Calculator, 
  Wrench, 
  Grid2X2 
} from 'lucide-react';

interface Stage {
  id: number;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

const STAGES: Stage[] = [
  {
    id: 1,
    label: 'Reading feedback entries',
    detail: 'Sanitizing input records, validating fields, and indexing source metadata...',
    icon: <BrainCircuit className="w-4 h-4" />,
  },
  {
    id: 2,
    label: 'Extracting issues & sentiment',
    detail: 'Detecting complaint intensity, distress markers, and emotional sentiment polarity...',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 3,
    label: 'Grouping recurring needs',
    detail: 'Synthesizing scattered complaints into distinct root-cause community clusters...',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 4,
    label: 'Calculating priority scores',
    detail: 'Applying Frequency (1-5) × Severity (1-5) × Urgency (1-5) ranking algorithm...',
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: 5,
    label: 'Generating actionable interventions',
    detail: 'Synthesizing evidence-backed Quick Wins and strategic policy recommendations...',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 6,
    label: 'Preparing the opportunity map',
    detail: 'Plotting 2x2 Impact vs Effort matrix and linking verified evidence citations...',
    icon: <Grid2X2 className="w-4 h-4" />,
  },
];

interface AnalysisProgressProps {
  /** Called once the backend has responded and the last stage has been shown. */
  onComplete: () => void;
  /** True when the backend request has finished successfully. */
  isFinished: boolean;
  datasetName: string;
  itemCount: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  onComplete,
  isFinished,
  datasetName,
  itemCount,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // While the backend is working, walk through the first five stages and then wait
  // on the last one until the real response arrives.
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => Math.min(prev + 1, STAGES.length - 2));
    }, 1800);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Backend responded: show the final stage briefly, then hand over.
  useEffect(() => {
    if (!isFinished) return;
    setCurrentStageIndex(STAGES.length - 1);
    const t = setTimeout(() => onCompleteRef.current(), 700);
    return () => clearTimeout(t);
  }, [isFinished]);

  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="rounded-2xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] p-6 sm:p-8 max-w-2xl mx-auto shadow-xl transition-colors duration-200">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF4FA3]/15 text-[#D81B76] dark:text-[#FF4FA3] text-xs font-bold border border-[#FF4FA3]/30">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>AI Synthesis Pipeline in Progress</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#211B38] dark:text-[#FAF7FF]">
          Analyzing {itemCount} Feedback Submissions
        </h2>
        <p className="text-xs text-[#5e5779] dark:text-[#77738A]">
          Transforming scattered community complaints into an evidence-backed, ranked action plan.
        </p>

        {/* Global Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#5e5779] dark:text-[#77738A] mb-1.5 font-mono">
            <span>Stage {currentStageIndex + 1} of {STAGES.length}</span>
            <span className="text-[#D81B76] dark:text-[#FF4FA3] font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-[#f0e7ff] dark:bg-[#17132B] rounded-full overflow-hidden border border-[#cdc3dd] dark:border-[#2E2854]">
            <div
              className="h-full bg-gradient-to-r from-[#FF4FA3] via-[#9B5DE5] to-[#FF8066] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6 Sequential Stages List */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-start space-x-3.5 p-3 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-[#f0e7ff] dark:bg-[#17132B] border-[#FF4FA3] shadow-sm'
                  : isDone
                  ? 'bg-[#f5fbf7] dark:bg-[#17132B]/50 border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              {/* Icon / Status Indicator */}
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-[#D81B76] dark:text-[#FF4FA3] animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#cdc3dd] dark:border-[#2E2854] flex items-center justify-center text-[10px] text-[#5e5779] dark:text-[#77738A]">
                    {stage.id}
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-[#211B38] dark:text-[#FAF7FF]'
                        : isDone
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-[#5e5779] dark:text-[#77738A]'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#FF4FA3]/20 text-[#D81B76] dark:text-[#FF4FA3]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5e5779] dark:text-[#77738A] mt-0.5 leading-snug">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
