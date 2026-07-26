'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
  candidateName?: string;
  skills?: string[];
  onApply?: (text: string) => void;
}

export function CoverLetterModal({
  isOpen, onClose, jobTitle = '', companyName = '',
  candidateName = '', skills = [], onApply,
}: CoverLetterModalProps) {
  const [form, setForm] = useState({ jobTitle, companyName, candidateName, skills: skills.join(', ') });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: form.jobTitle,
          companyName: form.companyName,
          candidateName: form.candidateName,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setResult(data.coverLetter || '');
    } catch {
      toast.error('Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI Cover Letter Generator"
      description="Generate a personalized cover letter tailored to the job."
      className="max-w-2xl"
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          <Input label="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Your Name" value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} />
          <Input label="Key Skills (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>

        <Button variant="ai" onClick={generate} isLoading={loading} className="gap-2 w-full">
          <Sparkles className="w-4 h-4" />
          Generate Cover Letter
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Generated Cover Letter</span>
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              rows={10}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {onApply && (
                <Button variant="primary" onClick={() => { onApply(result); onClose(); }}>
                  Use This Cover Letter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
