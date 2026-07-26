'use client';

import React, { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { getPublicJobs } from '@/lib/actions/jobs';
import { saveSearch } from '@/lib/actions/candidate';
import { toast } from 'sonner';
import { Search, MapPin, ArrowUpDown, Frown, Sparkles, Briefcase, Building2, Code } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export function JobsClient({ initialJobs, trendingSkills, trendingCompanies }: any) {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'salary' | 'views'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [filters, setFilters] = useState<any>({
    workplaceType: searchParams.get('workplace') || 'ALL',
    jobType: searchParams.get('jobType') || 'ALL',
    experienceLevel: searchParams.get('experience') || 'ALL',
    minSalary: 0,
    location: '',
  });

  const [allJobs, setAllJobs] = useState<any[]>(initialJobs);
  const [isPending, startTransition] = useTransition();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      fetch(`/api/search/autocomplete?q=${debouncedQuery}`)
        .then(res => res.json())
        .then(data => setSuggestions(data.suggestions || []));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const applyFilters = (newQuery: string, newLocation: string, newFilters: any) => {
    startTransition(async () => {
      const jobs = await getPublicJobs({ q: newQuery, location: newLocation, ...newFilters });
      setAllJobs(jobs);
      setCurrentPage(1);
    });
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.length === 0 || val.length > 2) {
        // Apply filters immediately on clear or after debounce for typing
    }
  };

  useEffect(() => {
    applyFilters(debouncedQuery, locationInput, filters);
  }, [debouncedQuery, locationInput, filters]);


  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    applyFilters(suggestion, locationInput, filters);
  };

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
  };

  const handleFiltersChange = (f: any) => {
    setFilters(f);
  };

  const handleResetFilters = () => {
    const reset = { workplaceType: 'ALL', jobType: 'ALL', experienceLevel: 'ALL', minSalary: 0, location: '' };
    setQuery('');
    setLocationInput('');
    setFilters(reset);
  };

  const handleSaveSearch = async () => {
    const name = prompt('Enter a name for this search:');
    if (name) {
      try {
        const queryParams: any = { q: query, location: locationInput, ...filters };
        Object.keys(queryParams).forEach(key => {
          if (!queryParams[key] || queryParams[key] === 'ALL' || (key === 'minSalary' && queryParams[key] === 0)) {
            delete queryParams[key];
          }
        });
        if (Object.keys(queryParams).length === 0) {
          toast.info("Can't save an empty search.");
          return;
        }
        await saveSearch(name, queryParams);
        toast.success(`Search "${name}" saved!`);
      } catch (err) {
        toast.error('Failed to save search.');
      }
    }
  };

  const sortedJobs = useMemo(() => {
    return [...allJobs].sort((a, b) => {
      if (sortBy === 'salary') return (b.salary_max || 0) - (a.salary_max || 0);
      if (sortBy === 'views') return (b.views_count || 0) - (a.views_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [allJobs, sortBy]);

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage) || 1;
  const paginatedJobs = useMemo(() => sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sortedJobs, currentPage]);

  const normalizeJob = (job: any) => ({
    id: job.id,
    title: job.title,
    companyName: job.companies?.name || 'Company',
    companyLogo: job.companies?.logo_url || null,
    // ... rest of normalization
  });

  const getSuggestionIcon = (type: string) => {
    if (type === 'Job') return <Briefcase className="w-4 h-4 text-slate-400" />;
    if (type === 'Company') return <Building2 className="w-4 h-4 text-slate-400" />;
    if (type === 'Skill') return <Code className="w-4 h-4 text-slate-400" />;
    return <Search className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ... Header and Search Bars ... */}
      <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, skill..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border z-10">
                {suggestions.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleSuggestionClick(s.value)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {getSuggestionIcon(s.type)}
                    <span>{s.value}</span>
                    <span className="ml-auto text-xs text-slate-400">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4">
          <JobFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            onSave={handleSaveSearch}
            onQueryChange={handleQueryChange}
            trendingSkills={trendingSkills}
            trendingCompanies={trendingCompanies}
          />
        </aside>
        {/* ... Main content ... */}
      </div>
    </div>
  );
}
