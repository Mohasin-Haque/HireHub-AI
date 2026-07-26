'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { getPublicJobs } from '@/lib/actions/jobs';
import { saveSearch } from '@/lib/actions/candidate';
import { toast } from 'sonner';
import { Search, MapPin, ArrowUpDown, Frown, Briefcase, Building2, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from 'use-debounce';

const ITEMS_PER_PAGE = 6;

function normalizeJob(job: any) {
  return {
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
  };
}

export function JobsClient({ initialJobs, trendingSkills, trendingCompanies }: {
  initialJobs: any[];
  trendingSkills: string[];
  trendingCompanies: any[];
}) {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'salary' | 'views'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [allJobs, setAllJobs] = useState<any[]>(initialJobs);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<{ type: string; value: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState({
    workplaceType: searchParams.get('workplace') || 'ALL',
    jobType: searchParams.get('jobType') || 'ALL',
    experienceLevel: searchParams.get('experience') || 'ALL',
    minSalary: 0,
    location: '',
  });

  const [debouncedQuery] = useDebounce(query, 300);
  const [debouncedLocation] = useDebounce(locationInput, 300);

  // Autocomplete
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      fetch(`/api/search/autocomplete?q=${encodeURIComponent(debouncedQuery)}`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d.suggestions || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Fetch jobs when filters/query/location change
  useEffect(() => {
    startTransition(async () => {
      const jobs = await getPublicJobs({
        q: debouncedQuery,
        location: debouncedLocation,
        workplaceType: filters.workplaceType,
        jobType: filters.jobType,
        experienceLevel: filters.experienceLevel,
        minSalary: filters.minSalary,
      });
      setAllJobs(jobs);
      setCurrentPage(1);
    });
  }, [debouncedQuery, debouncedLocation, filters]);

  const sortedJobs = useMemo(() => {
    return [...allJobs].sort((a, b) => {
      if (sortBy === 'salary') return (b.salary_max || 0) - (a.salary_max || 0);
      if (sortBy === 'views') return (b.views_count || 0) - (a.views_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [allJobs, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / ITEMS_PER_PAGE));
  const paginatedJobs = useMemo(
    () => sortedJobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [sortedJobs, currentPage]
  );

  const handleSuggestionClick = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSaveSearch = async () => {
    const name = prompt('Name this search:');
    if (!name) return;
    const params: Record<string, unknown> = {};
    if (query) params.q = query;
    if (locationInput) params.location = locationInput;
    if (filters.workplaceType !== 'ALL') params.workplaceType = filters.workplaceType;
    if (filters.jobType !== 'ALL') params.jobType = filters.jobType;
    if (filters.experienceLevel !== 'ALL') params.experienceLevel = filters.experienceLevel;
    if (filters.minSalary > 0) params.minSalary = filters.minSalary;
    if (Object.keys(params).length === 0) { toast.info("Can't save an empty search."); return; }
    try {
      await saveSearch(name, params);
      toast.success(`Search "${name}" saved!`);
    } catch {
      toast.error('Failed to save search. Sign in first.');
    }
  };

  const handleReset = () => {
    setQuery('');
    setLocationInput('');
    setSortBy('newest');
    setFilters({ workplaceType: 'ALL', jobType: 'ALL', experienceLevel: 'ALL', minSalary: 0, location: '' });
    setCurrentPage(1);
  };

  const getSuggestionIcon = (type: string) => {
    if (type === 'Job') return <Briefcase className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'Company') return <Building2 className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'Skill') return <Code className="w-3.5 h-3.5 text-slate-400" />;
    return <Search className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-purple-950 text-white shadow-xl space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Find Your Next Role</h1>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Query input with autocomplete */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Job title, skill, or keyword..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.value}
                    onMouseDown={() => handleSuggestionClick(s.value)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {getSuggestionIcon(s.type)}
                    <span>{s.value}</span>
                    <span className="ml-auto text-xs text-slate-400">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location input */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-white/50 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="City, state, or remote..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>

          {/* Sort */}
          <div className="md:col-span-2">
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-white/50 absolute left-3 top-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full h-12 pl-9 pr-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm appearance-none"
              >
                <option value="newest" className="text-slate-900">Newest</option>
                <option value="salary" className="text-slate-900">Salary</option>
                <option value="views" className="text-slate-900">Popular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{allJobs.length} positions found</span>
          <button onClick={handleReset} className="hover:text-white transition-colors">Reset filters</button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar filters */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <JobFilters
            filters={filters}
            onChange={(f) => setFilters(f)}
            onReset={handleReset}
            onSave={handleSaveSearch}
            onQueryChange={(q) => setQuery(q)}
            trendingSkills={trendingSkills}
            trendingCompanies={trendingCompanies.filter(Boolean)}
          />
        </aside>

        {/* Job grid */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : paginatedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Frown className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">No jobs found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
              </div>
              <button onClick={handleReset} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={normalizeJob(job)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                            currentPage === p
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
