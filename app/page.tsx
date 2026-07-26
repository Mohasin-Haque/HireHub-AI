import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CompanyLogos } from '@/components/landing/CompanyLogos';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { JobCard } from '@/components/jobs/JobCard';
import { getPublicJobs } from '@/lib/actions/jobs';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default async function LandingPage() {
  const allJobs = await getPublicJobs().catch(() => []);
  const featuredJobs = allJobs.slice(0, 3);

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

  return (
    <div className="w-full min-h-screen">
      <HeroSection />
      <CompanyLogos />
      <StatsSection />

      {featuredJobs.length > 0 && (
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
              View All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job: any) => (
              <JobCard key={job.id} job={normalizeJob(job)} />
            ))}
          </div>
        </section>
      )}

      <FeatureCards />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
