import { notFound } from 'next/navigation';
import { getPublicJobById } from '@/lib/actions/jobs';
import { trackRecentlyViewed } from '@/lib/actions/candidate';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getPublicJobById(id);

  if (!job) notFound();

  // Fire-and-forget — non-blocking, silently ignored if unauthenticated
  void trackRecentlyViewed(id);

  return <JobDetailClient job={job} />;
}
