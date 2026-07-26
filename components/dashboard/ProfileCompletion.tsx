'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ProfileCompletionProps {
  completion: number;
  checks: { label: string; done: boolean }[];
}

export function ProfileCompletion({ completion, checks }: ProfileCompletionProps) {
  const color =
    completion >= 80 ? 'text-emerald-500' :
    completion >= 50 ? 'text-amber-500' : 'text-red-500';

  const barColor =
    completion >= 80 ? 'bg-emerald-500' :
    completion >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="p-5 rounded-2xl glass-panel space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Completion</h4>
        <span className={`text-lg font-extrabold ${color}`}>{completion}%</span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${completion}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.done
              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            <span className={c.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
