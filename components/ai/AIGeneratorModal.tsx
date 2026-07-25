'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Wand2, Check } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialCompany?: string;
  onGenerated: (data: {
    title?: string;
    description: string;
    responsibilities: string;
    requirements: string;
    benefits?: string;
    skills?: string[];
  }) => void;
}

export function AIGeneratorModal({
  isOpen,
  onClose,
  initialTitle = '',
  initialCompany = '',
  onGenerated,
}: AIGeneratorModalProps) {
  const [jobTitle, setJobTitle] = useState(initialTitle);
  const [companyName, setCompanyName] = useState(initialCompany);
  const [isGenerating, setIsGenerating] = useState(false);

  const [aiTitleData, setAiTitleData] = useState<{ suggestedTitles?: string[]; reasoning?: string } | null>(null);
  const [aiResult, setAiResult] = useState<{
    description: string;
    responsibilities: string;
    requirements: string;
    benefits?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!jobTitle) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, companyName }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveTitle = async () => {
    if (!jobTitle) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/improve-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle }),
      });
      const data = await res.json();
      setAiTitleData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToForm = () => {
    if (aiResult) {
      onGenerated({
        title: jobTitle,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        benefits: aiResult.benefits,
      });
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI Job Assistant Copilot"
      description="Use AI to generate professional job descriptions and high-converting titles."
      className="max-w-2xl"
    >
      <div className="space-y-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Target Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior React Developer"
          />
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Vercel Inc."
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ai"
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Generate Full Job Description
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleImproveTitle}
            isLoading={isGenerating}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            Improve Title
          </Button>
        </div>

        {/* Title Suggestions */}
        {aiTitleData && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
              AI Suggested High-Converting Titles:
            </h4>
            <div className="flex flex-wrap gap-2">
              {(aiTitleData.suggestedTitles ?? []).map((t: string) => (
                <button
                  key={t}
                  onClick={() => setJobTitle(t)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {aiTitleData.reasoning}
            </p>
          </div>
        )}

        {/* AI Preview Result */}
        {aiResult && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 max-h-72 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Generated Content Preview
              </span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Description</h5>
              <p className="text-xs text-slate-800 dark:text-slate-200">{aiResult.description}</p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Responsibilities</h5>
              <pre className="text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap">{aiResult.responsibilities}</pre>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Requirements</h5>
              <pre className="text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap">{aiResult.requirements}</pre>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {aiResult && (
            <Button type="button" variant="primary" onClick={handleApplyToForm} className="gap-2">
              <Check className="w-4 h-4" />
              Apply to Form Fields
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
