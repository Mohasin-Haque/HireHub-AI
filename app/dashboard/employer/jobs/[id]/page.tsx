'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobPostSchema, JobPostInput } from '@/lib/validations';
import { updateJob } from '@/lib/actions/employer';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditJobPage({ params }: PageProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema),
  });

  useEffect(() => {
    params.then(async ({ id }) => {
      setJobId(id);
      const supabase = createClient();
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (!data) { toast.error('Job not found'); router.push('/dashboard/employer'); return; }

      setValue('title', data.title);
      setValue('companyName', '');
      setValue('location', data.location);
      setValue('workplaceType', data.workplace_type);
      setValue('jobType', data.job_type);
      setValue('experienceLevel', data.experience_level);
      setValue('salaryMin', data.salary_min || 0);
      setValue('salaryMax', data.salary_max || 0);
      setValue('salaryCurrency', data.salary_currency || 'USD');
      setValue('description', data.description);
      setValue('responsibilities', data.responsibilities || '');
      setValue('requirements', data.requirements || '');
      setValue('benefits', data.benefits || '');
      setValue('tags', data.tags || []);
      setTags(data.tags || []);
      setLoading(false);
    });
  }, [params, router, setValue]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      const updated = [...tags, t];
      setTags(updated);
      setValue('tags', updated);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    setValue('tags', updated);
  };

  const onSubmit = async (data: JobPostInput) => {
    setSaving(true);
    try {
      await updateJob(jobId, { ...data, tags });
      toast.success('Job updated successfully!');
      router.push('/dashboard/employer');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Edit Job Posting</h1>
          <p className="text-xs text-slate-500 mt-1">Update the job details below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Job Title" {...register('title')} error={errors.title?.message} />
            <Input label="Location" {...register('location')} error={errors.location?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Workplace</label>
              <select {...register('workplaceType')} className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Job Type</label>
              <select {...register('jobType')} className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Experience</label>
              <select {...register('experienceLevel')} className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior Level</option>
                <option value="LEAD">Lead</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Min Salary ($/yr)" type="number" {...register('salaryMin', { valueAsNumber: true })} error={errors.salaryMin?.message} />
            <Input label="Max Salary ($/yr)" type="number" {...register('salaryMax', { valueAsNumber: true })} error={errors.salaryMax?.message} />
          </div>

          {(['description', 'responsibilities', 'requirements', 'benefits'] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <textarea rows={4} {...register(field)} className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {errors[field] && <p className="text-xs text-red-500">{errors[field]?.message}</p>}
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Skill Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a skill tag..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
              />
              <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center gap-1.5">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={saving} variant="primary" className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
