'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toggleBookmark } from '@/lib/actions/candidate';
import { startConversation } from '@/lib/actions/shared';
import { formatSalary, formatDate } from '@/lib/utils';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, DollarSign, Bookmark, Send, Sparkles,
  ExternalLink, ChevronLeft, HelpCircle, Eye, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

export function JobDetailClient({ job }: { job: any }) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{ category: string; question: string; evalCriteria: string }>>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [messagingEmployer, setMessagingEmployer] = useState(false);

  const employerOwnerId = job.companies?.owner_id ?? null;

  const handleMessageEmployer = async () => {
    if (!employerOwnerId) return toast.error('Employer contact not available');
    setMessagingEmployer(true);
    try {
      const convId = await startConversation(employerOwnerId);
      router.push(`/dashboard/messages/${convId}`);
    } catch {
      toast.error('Sign in to message the employer');
    } finally {
      setMessagingEmployer(false);
    }
  };

  const normalized = {
    id: job.id,
    title: job.title,
    companyName: job.companies?.name || 'Company',
    companyLogo: job.companies?.logo_url || null,
    companyWebsite: job.companies?.website || '#',
    companyDescription: job.companies?.description,
    location: job.location,
    workplaceType: job.workplace_type,
    jobType: job.job_type,
    experienceLevel: job.experience_level,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency || 'USD',
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    tags: job.tags || [],
    viewsCount: job.views_count || 0,
    createdAt: job.created_at,
  };

  const handleBookmarkToggle = async () => {
    try {
      const newState = await toggleBookmark(normalized.id);
      setIsBookmarked(newState);
      toast.success(newState ? 'Job saved' : 'Bookmark removed');
    } catch {
      toast.error('Sign in to save jobs');
    }
  };

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/ai/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: normalized.title }),
      });
      const data = await res.json();
      setInterviewQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Eye className="w-4 h-4" />
          <span>{normalized.viewsCount} total views</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Image
              src={normalized.companyLogo || `https://avatar.vercel.sh/${encodeURIComponent(normalized.companyName)}`}
              alt={normalized.companyName}
              width={64} height={64}
              className="w-16 h-16 rounded-2xl object-contain border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {normalized.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="text-slate-900 dark:text-white font-bold">{normalized.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {normalized.location}
                </span>
                <span>•</span>
                <span>Posted {formatDate(normalized.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              className={`p-3 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save Position'}
            </button>
            <Button
              onClick={handleMessageEmployer}
              isLoading={messagingEmployer}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button onClick={() => setIsApplyOpen(true)} variant="primary" size="lg" className="gap-2">
              <Send className="w-4 h-4" />
              Apply Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compensation</span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              {formatSalary(normalized.salaryMin, normalized.salaryMax, normalized.salaryCurrency)}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workplace</span>
            <div><Badge variant="brand">{normalized.workplaceType}</Badge></div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employment</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{normalized.jobType.replace('_', ' ')}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seniority</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{normalized.experienceLevel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Role Overview & Impact
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{normalized.description}</p>
            {normalized.responsibilities && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Key Responsibilities</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{normalized.responsibilities}</div>
              </div>
            )}
            {normalized.requirements && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Requirements & Qualifications</h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{normalized.requirements}</div>
              </div>
            )}
            {normalized.benefits && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Benefits & Perks</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{normalized.benefits}</p>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/10 via-slate-900/5 to-brand-900/10 border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">AI Interview Prep Assistant</h4>
                  <p className="text-xs text-slate-500">Generate likely technical questions for this exact role</p>
                </div>
              </div>
              <Button onClick={handleGenerateQuestions} isLoading={loadingQuestions} variant="ai" size="sm" className="gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Generate Questions
              </Button>
            </div>
            {interviewQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                {interviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-500/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{q.category}</span>
                      <span className="text-slate-400">Question #{idx + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.question}</p>
                    <p className="text-xs text-slate-500 italic">Criteria: {q.evalCriteria}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Ready to Apply?</h4>
            <p className="text-xs text-slate-500">Submit your application in 1-click. Our AI matches your profile score directly with the hiring lead.</p>
            <Button onClick={() => setIsApplyOpen(true)} variant="primary" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Apply for this Position
            </Button>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Company</h4>
            <div className="flex items-center gap-3">
              <Image
                src={normalized.companyLogo || `https://avatar.vercel.sh/${encodeURIComponent(normalized.companyName)}`}
                alt={normalized.companyName}
                width={48} height={48}
                className="w-12 h-12 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
              />
              <div>
                <h5 className="font-bold text-base text-slate-900 dark:text-white">{normalized.companyName}</h5>
                <a href={normalized.companyWebsite} target="_blank" rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {normalized.companyDescription || 'Leading technology company building innovative software solutions.'}
            </p>
          </div>
        </aside>
      </div>

      <ApplyModal job={normalized} isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </div>
  );
}
