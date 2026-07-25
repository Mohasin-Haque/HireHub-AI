'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobPostSchema, JobPostInput } from '@/lib/validations';
import { HireHubStore } from '@/lib/db/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIGeneratorModal } from '@/components/ai/AIGeneratorModal';
import { Sparkles, Wand2, ArrowLeft, Plus, X, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function NewJobPage() {
  const router = useRouter();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['React', 'TypeScript', 'Next.js', 'Tailwind CSS']);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: 'Senior AI Full-Stack Engineer',
      companyName: 'Vercel Inc.',
      companyWebsite: 'https://vercel.com',
      location: 'San Francisco, CA',
      workplaceType: 'REMOTE',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      salaryMin: 180000,
      salaryMax: 240000,
      salaryCurrency: 'USD',
      description: 'We are looking for an experienced Senior Full-Stack Engineer with deep expertise in Next.js, React 19, TypeScript, and AI integration.',
      responsibilities: '• Lead front-end and back-end architecture for enterprise cloud platforms.\n• Build low-latency real-time API integrations with LLMs.\n• Optimize web performance metrics and developer experience.',
      requirements: '• 5+ years experience in React, TypeScript, and Node.js.\n• Strong background in REST/GraphQL APIs and serverless edge functions.\n• Excellent communication skills.',
      benefits: '• Competitive base salary ($180k-$240k) + equity grants.\n• Flexible remote schedule & $3,000 annual workspace budget.\n• Full healthcare, vision, and dental coverage.',
      tags: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const updated = [...tags, tagInput.trim()];
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

  const handleAIFilled = (data: {
    title?: string;
    description: string;
    responsibilities: string | string[];
    requirements: string | string[];
    benefits?: string | string[];
  }) => {
    const ensureString = (val: any): string => {
      if (Array.isArray(val)) {
        return val.map((item: string) => item.startsWith('•') || item.startsWith('-') ? item : `• ${item}`).join('\n');
      }
      if (typeof val === 'string') {
        return val;
      }
      return '';
    };

    if (data.title) setValue('title', data.title);
    setValue('description', ensureString(data.description));
    setValue('responsibilities', ensureString(data.responsibilities));
    setValue('requirements', ensureString(data.requirements));
    if (data.benefits) setValue('benefits', ensureString(data.benefits));
    toast.success('AI content applied to form fields!');
  };

  const onSubmit = async (data: JobPostInput) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    HireHubStore.createJob({
      companyId: `comp-${Date.now()}`,
      companyName: data.companyName,
      companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(data.companyName)}`,
      companyWebsite: data.companyWebsite || 'https://example.com',
      title: data.title,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      benefits: data.benefits || 'Competitive salary & health insurance',
      location: data.location,
      workplaceType: data.workplaceType,
      jobType: data.jobType,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryCurrency: data.salaryCurrency,
      experienceLevel: data.experienceLevel,
      tags: tags,
      status: 'ACTIVE',
    });

    setIsSubmitting(false);
    toast.success('Job position published successfully!');
    router.push('/dashboard/employer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <Button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          variant="ai"
          size="sm"
          className="gap-1.5 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Generate with AI Copilot
        </Button>
      </div>

      {/* Main Form Box */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Post a New Job Position
          </h1>
          <p className="text-xs text-slate-500">
            Fill in the job details or use our AI Generator to draft descriptions instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Position Title"
              {...register('title')}
              error={errors.title?.message}
            />
            <Input
              label="Company Name"
              {...register('companyName')}
              error={errors.companyName?.message}
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA or Remote"
              {...register('location')}
              error={errors.location?.message}
            />
            <Input
              label="Company Website"
              placeholder="https://company.com"
              {...register('companyWebsite')}
              error={errors.companyWebsite?.message}
            />
          </div>

          {/* Workplace, Type, Seniority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Workplace Model
              </label>
              <select
                {...register('workplaceType')}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Employment Type
              </label>
              <select
                {...register('jobType')}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Experience Level
              </label>
              <select
                {...register('experienceLevel')}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior Level</option>
                <option value="LEAD">Lead / Architect</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>
          </div>

          {/* Salary Min & Max */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Salary ($/yr)"
              type="number"
              {...register('salaryMin', { valueAsNumber: true })}
              error={errors.salaryMin?.message}
            />
            <Input
              label="Max Salary ($/yr)"
              type="number"
              {...register('salaryMax', { valueAsNumber: true })}
              error={errors.salaryMax?.message}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Role Description
              </label>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <Wand2 className="w-3.5 h-3.5" /> Auto-fill with AI
              </button>
            </div>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Responsibilities */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Key Responsibilities
            </label>
            <textarea
              rows={4}
              {...register('responsibilities')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.responsibilities && <p className="text-xs text-red-500">{errors.responsibilities.message}</p>}
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Requirements
            </label>
            <textarea
              rows={4}
              {...register('requirements')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.requirements && <p className="text-xs text-red-500">{errors.requirements.message}</p>}
          </div>

          {/* Skills Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Skill Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type skill tag (e.g. PyTorch) and press Add"
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center gap-1.5"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" className="gap-2">
              <Send className="w-4 h-4" />
              Publish Job Listing
            </Button>
          </div>
        </form>
      </div>

      {/* AI Copilot Modal */}
      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialTitle={watch('title')}
        initialCompany={watch('companyName')}
        onGenerated={handleAIFilled}
      />
    </div>
  );
}
