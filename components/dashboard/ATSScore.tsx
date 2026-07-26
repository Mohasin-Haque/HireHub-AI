'use client';

import React from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface ATSScoreProps {
  score: number | null;
  previousScore?: number | null;
}

export function ATSScore({ score, previousScore }: ATSScoreProps) {
  const display = score ?? 0;
  const diff = previousScore != null ? display - previousScore : null;

  const color =
    display >= 80 ? 'text-emerald-500' :
    display >= 60 ? 'text-amber-500' : 'text-red-500';

  const ringColor =
    display >= 80 ? 'stroke-emerald-500' :
    display >= 60 ? 'stroke-amber-500' : 'stroke-red-500';

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="p-5 rounded-2xl glass-panel flex items-center gap-5">
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" />
          <circle
            cx="44" cy="44" r={radius}
            fill="none" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-extrabold ${color}`}>{display}</span>
          <span className="text-[10px] text-slate-400 font-semibold">ATS</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">ATS Score</h4>
        </div>
        <p className="text-xs text-slate-500">
          {display >= 80 ? 'Excellent — your resume is highly optimized' :
           display >= 60 ? 'Good — a few improvements can boost your score' :
           score == null ? 'Upload a resume to get your ATS score' :
           'Needs work — optimize keywords and formatting'}
        </p>
        {diff != null && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {diff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {diff >= 0 ? '+' : ''}{diff} from last scan
          </div>
        )}
      </div>
    </div>
  );
}
