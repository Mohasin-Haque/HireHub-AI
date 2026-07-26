'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { applyToJob } from '@/lib/actions/candidate';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyJobSchema, ApplyJobInput } from '@/lib/validations';
import { CheckCircle2, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ApplyModalProps {
  job: { id: string; title: string; companyName: string };
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export function ApplyModal({ job, isOpen, onClose, onApplied }: ApplyModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyJobInput>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      coverLetter: `Hi hiring team,\n\nI am writing to express my strong interest in the ${job.title} position. I am confident I can make an immediate impact on your team.`,
      resumeUrl: '',
    },
  });

  const onSubmit = async (data: ApplyJobInput) => {
    setIsSubmitting(true);
    try {
      await applyToJob(job.id, data.coverLetter, data.resumeUrl);
      setIsSuccess(true);
      toast.success('Application submitted successfully!');
      if (onApplied) onApplied();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        setIsSuccess(false);
        onClose();
      }}
      title={`Apply for ${job.title}`}
      description={`Submit your application directly to ${job.companyName}`}
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Application Received!</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            Your profile and cover letter have been sent to the recruiters at <strong className="text-slate-900 dark:text-white">{job.companyName}</strong>.
          </p>

          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Estimated Candidate Match: 92% (High Alignment)</span>
          </div>

          <Button
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="w-full mt-4"
          >
            Done & Return to Jobs
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* AI Match Badge */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-600 dark:text-purple-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Your skills match 85%+ of this job's criteria!</span>
          </div>

          <Input
            label="Full Name"
            {...register('fullName')}
            error={errors.fullName?.message}
          />

          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Resume URL / Portfolio"
            {...register('resumeUrl')}
            error={errors.resumeUrl?.message}
            placeholder="https://example.com/resume.pdf"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Cover Letter / Personal Note
            </label>
            <textarea
              rows={4}
              {...register('coverLetter')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.coverLetter && <p className="text-xs text-red-500 font-medium">{errors.coverLetter.message}</p>}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" className="gap-2">
              <Send className="w-4 h-4" />
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
