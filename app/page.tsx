import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CompanyLogos } from '@/components/landing/CompanyLogos';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { JobCard } from '@/components/jobs/JobCard';
import { INITIAL_JOBS } from '@/lib/db/mock-data';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const featuredJobs = INITIAL_JOBS.slice(0, 3);

  return (
    <div className="w-full min-h-screen">
      <HeroSection />
      <CompanyLogos />
      <StatsSection />

      {/* Featured Jobs Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Fresh Opportunity Feed
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured High-Paying Remote Roles
            </h2>
          </div>

          <Link
            href="/jobs"
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
          >
            View All {INITIAL_JOBS.length}+ Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <FeatureCards />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
