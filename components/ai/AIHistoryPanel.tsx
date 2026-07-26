'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAIHistory, toggleAIHistoryFavorite, deleteAIHistory } from '@/lib/actions/ai';
import { formatDate } from '@/lib/utils';
import { Sparkles, Star, Trash2, Copy, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

const ACTION_LABELS: Record<string, string> = {
  GENERATE_DESCRIPTION: 'Job Description',
  IMPROVE_TITLE: 'Title Improver',
  SUGGEST_SKILLS: 'Skill Suggestions',
  COMPANY_SUMMARY: 'Company Summary',
  INTERVIEW_QUESTIONS: 'Interview Questions',
  RESUME_PARSE: 'Resume Parser',
  RESUME_ANALYZE: 'Resume Analysis',
  ATS_SCORE: 'ATS Score',
  RESUME_MATCH: 'Resume Match',
  COVER_LETTER: 'Cover Letter',
};

interface AIHistoryItem {
  id: string;
  action: string;
  input_payload: Record<string, any>;
  output_payload: Record<string, any>;
  model_name?: string;
  tokens_used?: number;
  processing_time?: number;
  status: string;
  is_favorite: boolean;
  created_at: string;
}

export function AIHistoryPanel() {
  const [items, setItems] = useState<AIHistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const data = await getAIHistory(filter || undefined, search || undefined);
      setItems(data as AIHistoryItem[]);
    });
  };

  useEffect(() => { load(); }, [filter, search]);

  const handleFavorite = async (id: string) => {
    await toggleAIHistoryFavorite(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_favorite: !i.is_favorite } : i));
  };

  const handleDelete = async (id: string) => {
    await deleteAIHistory(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Deleted from AI history');
  };

  const handleCopy = (item: AIHistoryItem) => {
    const text = JSON.stringify(item.output_payload, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isPending ? (
        <div className="text-center py-8 text-sm text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-400">No AI history yet. Start using AI features!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                    {ACTION_LABELS[item.action] || item.action}
                  </span>
                  {item.model_name && (
                    <span className="text-[10px] text-slate-400">{item.model_name}</span>
                  )}
                  {item.processing_time && (
                    <span className="text-[10px] text-slate-400">{item.processing_time}ms</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleFavorite(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${item.is_favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                    title="Favorite"
                  >
                    <Star className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button onClick={() => handleCopy(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500" title="Copy output">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Input: </span>
                {Object.entries(item.input_payload).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </div>

              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                {expanded === item.id ? 'Hide output' : 'View output'}
              </button>

              {expanded === item.id && (
                <pre className="text-xs bg-slate-50 dark:bg-slate-950 rounded-xl p-3 overflow-auto max-h-48 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(item.output_payload, null, 2)}
                </pre>
              )}

              <p className="text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
