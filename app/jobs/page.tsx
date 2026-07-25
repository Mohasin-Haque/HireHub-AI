'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters, FilterState } from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { Job } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { Search, MapPin, ArrowUpDown, Frown, Sparkles } from 'lucide-react';

function JobsListContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'salary' | 'views'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [filters, setFilters] = useState<FilterState>({
    workplaceType: searchParams.get('workplace') || 'ALL',
    jobType: searchParams.get('jobType') || 'ALL',
    experienceLevel: searchParams.get('experience') || 'ALL',
    minSalary: 0,
    location: searchParams.get('location') || '',
  });

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loadedJobs = HireHubStore.getJobs();
    const loadedBookmarks = HireHubStore.getBookmarks();
    setAllJobs(loadedJobs);
    setBookmarks(loadedBookmarks);
    setIsLoading(false);
  }, []);

  // Filter and Sort Logic
  const filteredJobs = useMemo(() => {
    return allJobs
      .filter((j) => {
        // Search query
        if (query) {
          const q = query.toLowerCase();
          const matchTitle = j.title.toLowerCase().includes(q);
          const matchCompany = j.companyName.toLowerCase().includes(q);
          const matchTags = j.tags.some((t) => t.toLowerCase().includes(q));
          const matchDesc = j.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchTags && !matchDesc) return false;
        }

        // Location
        if (locationInput) {
          const loc = locationInput.toLowerCase();
          if (!j.location.toLowerCase().includes(loc)) return false;
        }

        // Workplace
        if (filters.workplaceType !== 'ALL' && j.workplaceType !== filters.workplaceType) {
          return false;
        }

        // Job Type
        if (filters.jobType !== 'ALL' && j.jobType !== filters.jobType) {
          return false;
        }

        // Experience
        if (filters.experienceLevel !== 'ALL' && j.experienceLevel !== filters.experienceLevel) {
          return false;
        }

        // Salary Min
        if (filters.minSalary > 0 && (j.salaryMax || 0) < filters.minSalary) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'salary') {
          return (b.salaryMax || 0) - (a.salaryMax || 0);
        }
        if (sortBy === 'views') {
          return b.viewsCount - a.viewsCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allJobs, query, locationInput, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage]);

  const handleResetFilters = () => {
    setQuery('');
    setLocationInput('');
    setFilters({
      workplaceType: 'ALL',
      jobType: 'ALL',
      experienceLevel: 'ALL',
      minSalary: 0,
      location: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300">Live AI Search Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Explore Software & Engineering Jobs</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. Next.js, AI)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Location or Remote..."
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleResetFilters}
              className="w-full h-12 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-sm transition-all"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-4">
          <JobFilters
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Right Job Results Column */}
        <main className="lg:col-span-8 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Showing <span className="text-brand-600 dark:text-brand-400 font-extrabold">{filteredJobs.length}</span> positions
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'newest' | 'salary' | 'views')}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Newest First</option>
                <option value="salary">Highest Base Salary</option>
                <option value="views">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Job List */}
          {isLoading ? (
            <div className="space-y-4">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : paginatedJobs.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl glass-panel space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Frown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Jobs Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No active job postings matched your search criteria. Try clearing your filters or searching for different tech keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isBookmarkedInitial={bookmarks.includes(job.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs font-semibold px-4 text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Job Board...</div>}>
      <JobsListContent />
    </Suspense>
  );
}
