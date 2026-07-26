'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookmarkedJobs, getSavedSearches, deleteSavedSearch } from '@/lib/actions/candidate';
import { JobCard } from '@/components/jobs/JobCard';
import { ArrowLeft, Bookmark, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SavedItemsPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'searches'>('jobs');
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      getBookmarkedJobs().catch(() => []),
      getSavedSearches().catch(() => []),
    ]).then(([jobs, searches]) => {
      setSavedJobs(jobs);
      setSavedSearches(searches);
      setIsLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleBookmarkToggle = (jobId: string, newState: boolean) => {
    if (!newState) setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      toast.success('Saved search deleted');
      loadData();
    } catch {
      toast.error('Failed to delete saved search');
    }
  };

  const normalizeJob = (job: any) => ({
    id: job.id,
    title: job.title,
    companyName: job.companies?.name || 'Company',
    companyLogo: job.companies?.logo_url || null,
    companyWebsite: job.companies?.website || '#',
    location: job.location,
    workplaceType: job.workplace_type,
    jobType: job.job_type,
    experienceLevel: job.experience_level,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency || 'USD',
    description: job.description,
    tags: job.tags || [],
    viewsCount: job.views_count || 0,
    createdAt: job.created_at,
  });

  const TABS = [
    { key: 'jobs', label: 'Saved Jobs', icon: Bookmark },
    { key: 'searches', label: 'Saved Searches', icon: Search },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/candidate"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidate Hub
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2',
                activeTab === key
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'jobs' ? (
          savedJobs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">You haven&apos;t bookmarked any jobs yet.</p>
              <Link href="/jobs" className="px-4 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl inline-block">
                Explore Available Positions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={normalizeJob(job)}
                  isBookmarkedInitial={true}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>
          )
        ) : (
          savedSearches.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">You haven&apos;t saved any searches yet.</p>
              <p className="text-xs text-slate-400">Save a search from the Jobs page to get notified about new listings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => {
                const query = new URLSearchParams(search.query).toString();
                return (
                  <div key={search.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <Link href={`/jobs?${query}`} className="font-semibold text-brand-600 hover:underline">
                        {search.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(search.query).map(([key, value]) => (
                          <span key={key}><strong className="capitalize">{key}:</strong> {String(value)}</span>
                        ))}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteSearch(search.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
