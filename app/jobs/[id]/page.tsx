'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Job, INITIAL_JOBS } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { formatSalary, formatDate } from '@/lib/utils';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  DollarSign,
  Bookmark,
  Send,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{ category: string; question: string; evalCriteria: string }>>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const loadedJob = HireHubStore.getJobById(id) || INITIAL_JOBS.find((j) => j.id === id);
    if (loadedJob) {
      setJob(loadedJob);
      HireHubStore.incrementViews(id);
      const bms = HireHubStore.getBookmarks();
      setIsBookmarked(bms.includes(id));
    }
  }, [id]);

  const handleBookmarkToggle = () => {
    if (!job) return;
    const newState = HireHubStore.toggleBookmark(job.id);
    setIsBookmarked(newState);
  };

  const handleGenerateQuestions = async () => {
    if (!job) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/ai/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: job.title }),
      });
      const data = await res.json();
      setInterviewQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Position Not Found</h2>
        <p className="text-slate-500">The position you are looking for may have expired or been removed.</p>
        <Link href="/jobs" className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl inline-block">
          Return to Job Board
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
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
          <span>{job.viewsCount} total views</span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Image
              src={job.companyLogo || `https://avatar.vercel.sh/${encodeURIComponent(job.companyName)}`}
              alt={job.companyName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-contain border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="text-slate-900 dark:text-white font-bold">{job.companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span>Posted {formatDate(job.createdAt)}</span>
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
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workplace</span>
            <div>
              <Badge variant="brand">{job.workplaceType}</Badge>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employment</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.jobType.replace('_', ' ')}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seniority</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.experienceLevel}</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Job Overview & Description */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Role Overview & Impact
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            {job.responsibilities && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Key Responsibilities
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {job.requirements && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Requirements & Qualifications
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.benefits && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Benefits & Perks
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.benefits}
                </p>
              </div>
            )}
          </div>

          {/* AI Feature: Interactive Interview Questions Copilot */}
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

              <Button
                onClick={handleGenerateQuestions}
                isLoading={loadingQuestions}
                variant="ai"
                size="sm"
                className="gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                Generate Questions
              </Button>
            </div>

            {interviewQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                {interviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-500/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        {q.category}
                      </span>
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

        {/* Right Sidebar: Company Card & Apply Box */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Apply Box */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Ready to Apply?</h4>
            <p className="text-xs text-slate-500">
              Submit your application in 1-click. Our AI matches your profile score directly with the hiring lead.
            </p>
            <Button onClick={() => setIsApplyOpen(true)} variant="primary" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Apply for this Position
            </Button>
          </div>

          {/* Company Card */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Company</h4>
            <div className="flex items-center gap-3">
              <Image
                src={job.companyLogo || `https://avatar.vercel.sh/${encodeURIComponent(job.companyName)}`}
                alt={job.companyName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white p-1"
              />
              <div>
                <h5 className="font-bold text-base text-slate-900 dark:text-white">{job.companyName}</h5>
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Leading technology startup building software solutions for modern developer tools and web applications.
            </p>
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />
    </div>
  );
}
