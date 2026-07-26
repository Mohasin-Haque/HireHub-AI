'use client';

import React from 'react';
import Link from 'next/link';
import { AIHistoryPanel } from '@/components/ai/AIHistoryPanel';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CandidateAIHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/dashboard/candidate" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">AI History</h1>
            <p className="text-xs text-slate-500">All your AI-generated content — search, copy, favorite, or delete</p>
          </div>
        </div>
        <AIHistoryPanel />
      </div>
    </div>
  );
}
