'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { applyToJob, getProfile } from '@/lib/actions/candidate';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyJobSchema, ApplyJobInput } from '@/lib/validations';
import { CheckCircle2, Sparkles, Send, AlertCircle, FileText, ExternalLink, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeResumeUrl, setActiveResumeUrl] = useState('');
  const [activeResumeFileName, setActiveResumeFileName] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const resumeUrl = watch('resumeUrl');
  const hasResume = Boolean(resumeUrl?.trim());

  // Load profile to get active resume and check for existing application
  useEffect(() => {
    if (!isOpen || !user) return;
    setProfileLoading(true);
    setAlreadyApplied(false);
    setActiveResumeUrl('');
    setActiveResumeFileName('');
    setValue('resumeUrl', '');

    getProfile().then((profile) => {
      if (profile?.resume_url) {
        setActiveResumeUrl(profile.resume_url);
        setActiveResumeFileName(profile.resume_file_name || 'Active Resume');
        setValue('resumeUrl', profile.resume_url);
      }
      setValue('fullName', profile?.full_name || user.fullName || '');
      setValue('email', user.email || '');
    }).catch(() => {}).finally(() => setProfileLoading(false));
  }, [isOpen, user, setValue, job.id]);

  const onSubmit = async (data: ApplyJobInput) => {
    setIsSubmitting(true);
    try {
      await applyToJob(job.id, data.coverLetter, data.resumeUrl);
      setIsSuccess(true);
      toast.success('Application submitted successfully!');
      if (onApplied) onApplied();
    } catch (err: any) {
      if (err.message?.includes('already applied')) {
        setAlreadyApplied(true);
      } else {
        toast.error(err.message || 'Failed to submit application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setAlreadyApplied(false);
    onClose();
  };

  const handleResumeUpload = async (file?: File) => {
    if (!file) return;
    setIsUploadingResume(true);
    const toastId = toast.loading('Uploading and parsing your resume...');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to upload resume.');

      setActiveResumeUrl(result.resumeUrl);
      setActiveResumeFileName(file.name);
      setValue('resumeUrl', result.resumeUrl, { shouldValidate: true });
      toast.success(result.parsingWarning || 'Resume uploaded and parsed successfully!', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload resume.', { id: toastId });
    } finally {
      setIsUploadingResume(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Apply for ${job.title}`}
      description={`Submit your application directly to ${job.companyName}`}
    >
      {/* Already applied state */}
      {alreadyApplied ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Already Applied</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            You have already submitted an application for <strong className="text-slate-900 dark:text-white">{job.title}</strong> at {job.companyName}.
          </p>
          <Link href="/dashboard/candidate" className="inline-block">
            <Button variant="outline" onClick={handleClose}>View My Applications</Button>
          </Link>
        </div>
      ) : isSuccess ? (
        /* Success state */
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Application Received!</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            Your profile and cover letter have been sent to the recruiters at{' '}
            <strong className="text-slate-900 dark:text-white">{job.companyName}</strong>.
          </p>
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Application submitted with your active resume</span>
          </div>
          <Button onClick={handleClose} className="w-full mt-4">
            Done & Return to Jobs
          </Button>
        </div>
      ) : (
        /* Application form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
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

          {/* Resume section */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Resume <span className="text-red-500">*</span>
            </label>

            {profileLoading ? (
              <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : activeResumeUrl ? (
              /* Show active resume with option to override */
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{activeResumeFileName}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active resume — will be submitted</p>
                  </div>
                  <a
                    href={activeResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Preview <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400">
                  Using a different resume?{' '}
                  <Link href="/dashboard/candidate/profile" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold" onClick={handleClose}>
                    Upload a new version
                  </Link>
                </p>
                {/* Hidden input keeps the value in the form */}
                <input type="hidden" {...register('resumeUrl')} />
              </div>
            ) : (
              /* No resume on profile — require URL or prompt to upload */
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700 dark:text-amber-400">
                    <p className="font-semibold">No resume on file.</p>
                    <p>
                      Upload a resume here, or paste a direct link below.
                    </p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/5 px-3 py-2.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10">
                  {isUploadingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploadingResume ? 'Uploading resume...' : 'Upload and parse resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={isUploadingResume}
                    onChange={(event) => {
                      void handleResumeUpload(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                <Input
                  label="Resume URL"
                  placeholder="https://example.com/your-resume.pdf"
                  {...register('resumeUrl')}
                  error={errors.resumeUrl?.message}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              {...register('coverLetter')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.coverLetter && (
              <p className="text-xs text-red-500 font-medium">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={profileLoading || isUploadingResume || !hasResume}
              variant="primary"
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
