'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Filter, RotateCcw, MapPin, Briefcase, DollarSign, Layers, Bookmark, Zap, Building2 } from 'lucide-react';

export interface FilterState {
  workplaceType: string;
  jobType: string;
  experienceLevel: string;
  minSalary: number;
  location: string;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  onSave: () => void;
  onQueryChange: (query: string) => void;
  trendingSkills: string[];
  trendingCompanies: any[];
}

export function JobFilters({
  filters,
  onChange,
  onReset,
  onSave,
  onQueryChange,
  trendingSkills,
  trendingCompanies,
}: JobFiltersProps) {
  const { isAuthenticated } = useAuth();

  const handleSelect = (key: keyof FilterState, value: string | number) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-500" />
          Filter Jobs
        </h3>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button onClick={onSave} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
              <Bookmark className="w-3 h-3" /> Save
            </button>
          )}
          <button onClick={onReset} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Trending Skills */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Trending Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {trendingSkills.map(skill => (
            <button key={skill} onClick={() => onQueryChange(skill)} className="px-2 py-1 text-xs font-medium rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20">
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Companies */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Trending Companies
        </label>
        <div className="space-y-2">
          {trendingCompanies.map(company => (
            <button key={company.id} onClick={() => onQueryChange(company.name)} className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Image src={company.logo_url} alt={company.name} width={24} height={24} className="rounded-md" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{company.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workplace Type */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Workplace
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['ALL', 'REMOTE', 'HYBRID', 'ONSITE'].map(type => (
            <button key={type} onClick={() => handleSelect('workplaceType', type)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${filters.workplaceType === type ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

       {/* Employment Type */}
       <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Employment Type
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ALL', label: 'All Job Types' },
            { id: 'FULL_TIME', label: 'Full-Time' },
            { id: 'PART_TIME', label: 'Part-Time' },
            { id: 'CONTRACT', label: 'Contract' },
            { id: 'INTERNSHIP', label: 'Internship' },
          ].map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type.id}
                onChange={() => handleSelect('jobType', type.id)}
                className="w-4 h-4 text-brand-600 focus:ring-brand-500 rounded-full"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Experience Level
        </label>
        <select
          value={filters.experienceLevel}
          onChange={(e) => handleSelect('experienceLevel', e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="ALL">All Experience Levels</option>
          <option value="ENTRY">Entry Level (0-2 yrs)</option>
          <option value="MID">Mid Level (2-5 yrs)</option>
          <option value="SENIOR">Senior (5+ yrs)</option>
          <option value="LEAD">Lead / Architect</option>
          <option value="EXECUTIVE">Executive / VP</option>
        </select>
      </div>

      {/* Minimum Salary Slider */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Min Base Salary
          </label>
          <span className="font-extrabold text-brand-600 dark:text-brand-400">
            ${filters.minSalary.toLocaleString()}/yr
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={250000}
          step={10000}
          value={filters.minSalary}
          onChange={(e) => handleSelect('minSalary', Number(e.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>$0</span>
          <span>$100k</span>
          <span>$250k+</span>
        </div>
      </div>
    </div>
  );
}
