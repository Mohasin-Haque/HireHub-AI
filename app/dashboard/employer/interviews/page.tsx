'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEmployerInterviews, updateInterview } from '@/lib/actions/shared';
import { ScheduleInterviewModal } from '@/components/interviews/ScheduleInterviewModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Video, Clock, FileText, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const data = await getEmployerInterviews();
      setInterviews(data);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this interview?')) return;
    try {
      await updateInterview(id, { status: 'CANCELLED' });
      toast.success('Interview cancelled');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const statusVariant: Record<string, any> = {
    SCHEDULED: 'brand', COMPLETED: 'success', CANCELLED: 'danger', RESCHEDULED: 'warning',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/dashboard/employer" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Scheduled Interviews</h1>
        <p className="mt-1 text-sm text-slate-500">Manage upcoming and past interviews for your company.</p>
      </header>

      {interviews.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No interviews scheduled yet.</p>
          <Link href="/dashboard/employer/applications" className="mt-3 inline-block text-xs font-bold text-brand-600 hover:underline">
            Go to Applications
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview: any) => (
            <div key={interview.id} className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {interview.profiles?.avatar_url && (
                    <Image
                      src={interview.profiles.avatar_url}
                      alt={interview.profiles.full_name}
                      width={40} height={40}
                      className="rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {interview.jobs?.title}
                    </h3>
                    <p className="text-xs text-slate-500">with {interview.profiles?.full_name}</p>
                  </div>
                </div>
                <Badge variant={statusVariant[interview.status] || 'default'}>{interview.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{formatDate(interview.scheduled_at)}</span>
                </div>
                {interview.duration && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{interview.duration} minutes · {interview.type}</span>
                  </div>
                )}
                {interview.meeting_link && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                      {interview.meeting_link}
                    </a>
                  </div>
                )}
                {interview.notes && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 sm:col-span-2">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs">{interview.notes}</p>
                  </div>
                )}
              </div>

              {interview.status === 'SCHEDULED' && (
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setRescheduleTarget(interview)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCancel(interview.id)}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rescheduleTarget && (
        <ScheduleInterviewModal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          applicationId={rescheduleTarget.application_id}
          jobId={rescheduleTarget.job_id}
          candidateId={rescheduleTarget.candidate_id}
          candidateName={rescheduleTarget.profiles?.full_name || 'Candidate'}
          jobTitle={rescheduleTarget.jobs?.title || 'Position'}
          existingInterview={rescheduleTarget}
          onSuccess={() => { setRescheduleTarget(null); load(); }}
        />
      )}
    </div>
  );
}
