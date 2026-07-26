import { Suspense } from 'react';
import { getEmployerInterviews } from '@/lib/actions/shared';
import { Calendar, Video, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

async function InterviewsList() {
  const interviews = await getEmployerInterviews();

  if (!interviews || interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No Upcoming Interviews</h3>
        <p className="text-sm text-slate-500">You have no interviews scheduled at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {interviews.map((interview: any) => (
        <Card key={interview.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Interview for {interview.jobs.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {interview.profiles?.avatar_url && (
                    <Image
                      src={interview.profiles.avatar_url}
                      alt={interview.profiles.full_name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <CardDescription>
                    With {interview.profiles?.full_name}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={interview.status === 'COMPLETED' ? 'success' : interview.status === 'CANCELLED' ? 'warning' : 'brand'}
              >
                {interview.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{formatDate(interview.scheduled_at)}</span>
            </div>
            {interview.meeting_link && (
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-slate-500" />
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Join Meeting
                </a>
              </div>
            )}
            {interview.duration && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{interview.duration} minutes</span>
              </div>
            )}
            {interview.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-400">{interview.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" disabled>Reschedule</Button>
            <Button variant="danger" disabled>Cancel</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function EmployerInterviewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Scheduled Interviews
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here are the upcoming and past interviews for your company.
        </p>
      </header>
      <Suspense fallback={<p>Loading interviews...</p>}>
        <InterviewsList />
      </Suspense>
    </div>
  );
}
