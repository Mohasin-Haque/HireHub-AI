'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Job } from '@/lib/db/mock-data';
import { formatSalary, formatDate } from '@/lib/utils';
import { Bookmark, MapPin, DollarSign, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HireHubStore } from '@/lib/db/store';

interface JobCardProps {
  job: Job;
  isBookmarkedInitial?: boolean;
  onBookmarkToggle?: (jobId: string, newState: boolean) => void;
}

export function JobCard({ job, isBookmarkedInitial = false, onBookmarkToggle }: JobCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = HireHubStore.toggleBookmark(job.id);
    setIsBookmarked(newState);
    if (onBookmarkToggle) {
      onBookmarkToggle(job.id, newState);
    }
  };

  const workplaceVariant =
    job.workplaceType === 'REMOTE'
      ? 'success'
      : job.workplaceType === 'HYBRID'
      ? 'brand'
      : 'default';

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 backdrop-blur-md transition-all duration-200 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-center">
            <Image
              src={job.companyLogo || `https://avatar.vercel.sh/${encodeURIComponent(job.companyName)}`}
              alt={job.companyName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-contain border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1"
            />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {job.companyName}
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </p>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 fill-amber-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Save job'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={workplaceVariant}>{job.workplaceType}</Badge>
          <Badge variant="outline">{job.jobType.replace('_', ' ')}</Badge>
          <Badge variant="brand">{job.experienceLevel}</Badge>
        </div>

        {/* Description Excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
              +{job.tags.length - 4} more
            </span>
          )}
        </div>

        {/* Footer info: Salary & Date */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Posted {formatDate(job.createdAt)}</span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold group-hover:underline flex items-center gap-1">
              View Details <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
