'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { FeedbackItem } from '@/types';

interface CSVPreviewProps {
  filename: string;
  totalRows: number;
  previewRows: FeedbackItem[];
  missingColumns: string[];
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({
  filename,
  totalRows,
  previewRows,
  missingColumns,
}) => {
  return (
    <div className="rounded-xl bg-[#ffffff] dark:bg-[#201B3B] border border-[#cdc3dd] dark:border-[#2E2854] overflow-hidden shadow-xs transition-colors duration-200">
      {/* Header bar */}
      <div className="px-4 py-3 bg-[#f0e7ff] dark:bg-[#17132B] border-b border-[#cdc3dd] dark:border-[#2E2854] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#D81B76] dark:text-[#FF4FA3]" />
          <span className="text-xs font-bold text-[#211B38] dark:text-[#FAF7FF] truncate max-w-xs">{filename}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            {totalRows} Entries Detected
          </span>
        </div>

        {missingColumns.length > 0 ? (
          <div className="flex items-center space-x-1.5 text-[11px] text-[#7A6100] dark:text-[#FFE66D]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Optional columns omitted: {missingColumns.join(', ')}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Format Validated (id, feedback, source, group)</span>
          </div>
        )}
      </div>

      {/* Table Preview */}
      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#ede7f5]/70 dark:bg-[#17132B]/80 text-[#5e5779] dark:text-[#77738A] uppercase font-bold text-[10px] border-b border-[#cdc3dd] dark:border-[#2E2854]">
            <tr>
              <th className="py-2.5 px-3 w-16">ID</th>
              <th className="py-2.5 px-3">Feedback Text</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">Group / Cohort</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ede7f5] dark:divide-[#2E2854]/60">
            {previewRows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-[#f6f2fc] dark:hover:bg-[#28224A]/40 text-[#211B38] dark:text-[#FAF7FF]">
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7934CF] dark:text-[#FFE66D] font-bold">
                  {row.id || `FB-${idx + 1}`}
                </td>
                <td className="py-2.5 px-3 max-w-md truncate text-xs text-[#211B38] dark:text-[#FAF7FF]">
                  {row.feedback}
                </td>
                <td className="py-2.5 px-3 text-[#5e5779] dark:text-[#77738A] text-xs">
                  {row.source || 'Direct'}
                </td>
                <td className="py-2.5 px-3 text-[#5e5779] dark:text-[#77738A] text-xs">
                  {row.group || 'General'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-[#f0e7ff]/40 dark:bg-[#17132B]/60 border-t border-[#cdc3dd] dark:border-[#2E2854] text-[11px] text-[#5e5779] dark:text-[#77738A]">
        Showing preview of first {previewRows.length} rows. Full dataset will be analyzed.
      </div>
    </div>
  );
};
