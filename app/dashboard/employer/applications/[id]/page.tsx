import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getApplicationById, getApplicationStatusHistory } from '@/lib/actions/employer';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InterviewTimeline } from '@/components/dashboard/InterviewTimeline';
import { MessageCandidateButton } from '@/components/chat/MessageCandidateButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ApplicationData({ id }: { id: string }) {
  const [application, history] = await Promise.all([
    getApplicationById(id),
    getApplicationStatusHistory(id),
  ]);

  if (!application) {
    notFound();
  }

  const profile = application.profiles as any;
  const job = application.jobs as any;

  return (
    <div className="space-y-6">
       <Link href="/dashboard/employer/applications" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to All Applications
        </Link>
      <div className="p-8 rounded-3xl glass-panel">
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={80}
              height={80}
              className="rounded-2xl"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 text-2xl font-bold text-slate-500">
              {profile.full_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-sm text-slate-500">{profile.headline}</p>
            <p className="text-sm mt-2">Applied for: <strong className="font-semibold">{job.title}</strong></p>
            <div className="mt-4 flex items-center gap-4">
              <Badge>{application.status}</Badge>
              <div className="flex items-center gap-1.5 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">{application.match_score}% Match</span>
              </div>
              <MessageCandidateButton candidateId={application.candidate_id} candidateName={profile.full_name} />
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="font-semibold mb-2">Cover Letter</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{application.cover_letter}</p>
        </div>
         {profile.resume_url && (
            <div className="mt-6">
                <a href={profile.resume_url} target="_blank" rel="noreferrer" className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" /> View Full Resume
                </a>
            </div>
        )}
      </div>
      <InterviewTimeline history={history} />
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Suspense fallback={<p>Loading application...</p>}>
        <ApplicationData id={id} />
      </Suspense>
    </div>
  );
}
