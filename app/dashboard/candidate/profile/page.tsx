'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@/lib/validations';
import { CandidateProfile } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const prof = HireHubStore.getProfile();
    setProfile(prof);
    setSkills(prof.skills || []);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          fullName: profile.fullName,
          headline: profile.headline,
          bio: profile.bio,
          phone: profile.phone || '',
          location: profile.location,
          resumeUrl: profile.resumeUrl || '',
          website: profile.website || '',
          githubUrl: profile.githubUrl || '',
          linkedinUrl: profile.linkedinUrl || '',
          skills: profile.skills,
          experienceYrs: profile.experienceYrs,
        }
      : undefined,
  });

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const updated = [...skills, skillInput.trim()];
      setSkills(updated);
      setValue('skills', updated);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    setValue('skills', updated);
  };

  const onSubmit = async (data: ProfileInput) => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    HireHubStore.updateProfile({
      ...data,
      skills,
    });

    setIsSaving(false);
    toast.success('Candidate profile updated successfully!');
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/candidate"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidate Hub
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-4">
          <Image
            src={profile.avatarUrl}
            alt={profile.fullName}
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30 shadow-md"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Edit Candidate Profile
            </h1>
            <p className="text-xs text-slate-500">
              Keep your bio, skills, and resume updated for maximum AI candidate match score.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Full-Stack Engineer"
              {...register('headline')}
              error={errors.headline?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Location"
              placeholder="San Francisco, CA"
              {...register('location')}
              error={errors.location?.message}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Input
              label="Years of Experience"
              type="number"
              {...register('experienceYrs', { valueAsNumber: true })}
              error={errors.experienceYrs?.message}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Professional Bio
            </label>
            <textarea
              rows={4}
              {...register('bio')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
          </div>

          <Input
            label="Resume Document URL"
            placeholder="https://example.com/resume.pdf"
            {...register('resumeUrl')}
            error={errors.resumeUrl?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Personal Website"
              placeholder="https://alexmorgan.dev"
              {...register('website')}
              error={errors.website?.message}
            />
            <Input
              label="GitHub URL"
              placeholder="https://github.com/username"
              {...register('githubUrl')}
              error={errors.githubUrl?.message}
            />
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/username"
              {...register('linkedinUrl')}
              error={errors.linkedinUrl?.message}
            />
          </div>

          {/* Skills Management */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Technical & Core Skills Taxonomy
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type skill tag (e.g. OpenAI API) and click Add"
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 border border-purple-500/20"
                >
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="submit" isLoading={isSaving} variant="primary" className="gap-2">
              <Save className="w-4 h-4" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
