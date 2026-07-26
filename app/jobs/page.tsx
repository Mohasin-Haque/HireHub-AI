import { Suspense } from 'react';
import { getPublicJobs } from '@/lib/actions/jobs';
import { getTrendingSkills, getTrendingCompanies } from '@/lib/actions/analytics';
import { JobsClient } from '@/components/jobs/JobsClient';

export const dynamic = 'force-dynamic';

async function JobsData() {
  const [initialJobs, trendingSkills, trendingCompanies] = await Promise.all([
    getPublicJobs().catch(() => []),
    getTrendingSkills(),
    getTrendingCompanies(),
  ]);

  return (
    <JobsClient
      initialJobs={initialJobs}
      trendingSkills={trendingSkills}
      trendingCompanies={trendingCompanies}
    />
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Job Board...</div>}>
      <JobsData />
    </Suspense>
  );
}
