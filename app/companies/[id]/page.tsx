import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublicCompanyById, getJobsForCompany } from '@/lib/actions/jobs';
import { getCompanyReviews, getCompanyFollowerCount, isFollowingCompany, toggleFollowCompany } from '@/lib/actions/company';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Building2, Globe, MapPin, Users, Briefcase, Rss, Plus } from 'lucide-react';
import { CompanyReviews } from '@/components/companies/CompanyReviews';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function FollowButton({ companyId }: { companyId: string }) {
  const isFollowing = await isFollowingCompany(companyId);
  return (
    <form action={async () => {
      'use server';
      await toggleFollowCompany(companyId);
    }}>
      <Button variant={isFollowing ? 'primary' : 'outline'} className="gap-2">
        {isFollowing ? <Rss className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </form>
  );
}

async function CompanyData({ id }: { id: string }) {
  const [company, jobs, reviews, followerCount] = await Promise.all([
    getPublicCompanyById(id),
    getJobsForCompany(id),
    getCompanyReviews(id),
    getCompanyFollowerCount(id),
  ]);

  if (!company) {
    notFound();
  }

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
    <div className="space-y-8">
      {/* Company Header */}
      <div className="p-8 rounded-3xl glass-panel flex flex-col md:flex-row items-start gap-6">
        {company.logo_url ? (
          <Image
            src={company.logo_url}
            alt={`${company.name} Logo`}
            width={96}
            height={96}
            className="w-24 h-24 rounded-2xl object-contain border bg-white"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-slate-200 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-slate-400" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{company.name}</h1>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                <span>{followerCount} Followers</span>
                <span>{reviews.length} Reviews</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <FollowButton companyId={id} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">{company.description}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
            {company.industry && (
              <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {company.industry}</div>
            )}
            {company.location && (
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {company.location}</div>
            )}
            {company.size && (
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {company.size}</div>
            )}
            {company.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-brand-600">{company.website}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Open Positions ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p className="text-center py-8 text-slate-500">This company has no active job postings.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={normalizeJob(job)} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <CompanyReviews companyId={id} reviews={reviews} />
    </div>
  );
}


export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<p>Loading company profile...</p>}>
        <CompanyData id={id} />
      </Suspense>
    </div>
  );
}
