import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(num: number): string {
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
}

export function getQuadrantColor(quadrant: string) {
  switch (quadrant) {
    case 'Quick Win':
      return {
        bg: 'bg-[#FF4FA3]/15',
        text: 'text-[#D81B76]',
        border: 'border-[#FF4FA3]/40',
        dot: 'bg-[#FF4FA3]',
      };
    case 'Strategic Project':
      return {
        bg: 'bg-[#9B5DE5]/15',
        text: 'text-[#7934CF]',
        border: 'border-[#9B5DE5]/40',
        dot: 'bg-[#9B5DE5]',
      };
    case 'Fill-in Task':
      return {
        bg: 'bg-[#FFE66D]/40',
        text: 'text-[#7A6100]',
        border: 'border-[#d4be3d]/60',
        dot: 'bg-[#E5B500]',
      };
    case 'Reconsider':
    default:
      return {
        bg: 'bg-[#FF8066]/15',
        text: 'text-[#D9492A]',
        border: 'border-[#FF8066]/40',
        dot: 'bg-[#FF8066]',
      };
  }
}

export function getSeverityBadge(score: number) {
  if (score >= 4.5) {
    return { label: 'Critical', bg: 'bg-red-500/15', text: 'text-red-700', border: 'border-red-500/40' };
  } else if (score >= 3.5) {
    return { label: 'High', bg: 'bg-[#FF8066]/15', text: 'text-[#D9492A]', border: 'border-[#FF8066]/40' };
  } else if (score >= 2.5) {
    return { label: 'Medium', bg: 'bg-[#FFE66D]/40', text: 'text-[#7A6100]', border: 'border-[#d4be3d]/60' };
  } else {
    return { label: 'Low', bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-500/40' };
  }
}
