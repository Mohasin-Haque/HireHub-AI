'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { JobCard } from '@/components/jobs/JobCard';
import { ArrowLeft, Bookmark } from 'lucide-react';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const bookmarkedIds = HireHubStore.getBookmarks();
    const allJobs = HireHubStore.getJobs();
    const filtered = allJobs.filter((j) => bookmarkedIds.includes(j.id));
    setSavedJobs(filtered);
  }, []);

  const handleBookmarkToggle = (jobId: string, newState: boolean) => {
    if (!newState) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

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

      <div className="p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Bookmarked Jobs ({savedJobs.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500">Jobs you have saved for later review or application</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm font-semibold text-slate-500">You haven't bookmarked any jobs yet.</p>
            <Link href="/jobs" className="px-4 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl inline-block">
              Explore Available Positions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isBookmarkedInitial={true}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
