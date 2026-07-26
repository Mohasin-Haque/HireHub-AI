'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@/lib/validations';
import {
  getProfile, upsertProfile, getResumeVersions,
  setActiveResume, deleteResumeVersion,
  addWorkExperience, deleteWorkExperience,
  addEducation, deleteEducation,
} from '@/lib/actions/candidate';
import { uploadAvatar } from '@/lib/actions/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeUpload } from '@/components/dashboard/ResumeUpload';
import { ArrowLeft, Plus, X, Save, Upload, Briefcase, GraduationCap, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [resumeVersions, setResumeVersions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'experience' | 'education'>('profile');
  const [isPending, startTransition] = useTransition();

  // Work experience form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' });

  // Education form state
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field: '', startYear: '', endYear: '', current: false, gpa: '' });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const loadProfile = () => {
    startTransition(async () => {
      const [prof, versions] = await Promise.all([getProfile(), getResumeVersions()]);
      if (prof) {
        setProfile(prof);
        setSkills(prof.skills || []);
        setValue('fullName', prof.full_name || '');
        setValue('headline', prof.headline || '');
        setValue('bio', prof.bio || '');
        setValue('phone', prof.phone || '');
        setValue('location', prof.location || '');
        setValue('resumeUrl', prof.resume_url || '');
        setValue('website', prof.website || '');
        setValue('githubUrl', prof.github_url || '');
        setValue('linkedinUrl', prof.linkedin_url || '');
        setValue('skills', prof.skills || []);
        setValue('experienceYrs', prof.experience_yrs || 0);
      }
      setResumeVersions(versions);
    });
  };

  useEffect(() => { loadProfile(); }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const url = await uploadAvatar(fd);
      setProfile((prev: any) => ({ ...prev, avatar_url: url }));
      toast.success('Avatar updated!');
    } catch (err: any) { toast.error(err.message); }
    finally { setUploadingAvatar(false); }
  };

  const onSubmit = async (data: ProfileInput) => {
    setIsSaving(true);
    try {
      await upsertProfile({ ...data, skills });
      toast.success('Profile saved!');
      loadProfile();
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSaving(false); }
  };

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      const updated = [...skills, s];
      setSkills(updated);
      setValue('skills', updated);
      setSkillInput('');
    }
  };

  const handleAddExp = async () => {
    if (!expForm.company || !expForm.title || !expForm.startDate) { toast.error('Company, title, and start date are required'); return; }
    try {
      await addWorkExperience({ ...expForm, startDate: expForm.startDate, endDate: expForm.endDate || undefined });
      toast.success('Work experience added');
      setShowExpForm(false);
      setExpForm({ company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' });
      loadProfile();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddEdu = async () => {
    if (!eduForm.institution || !eduForm.degree || !eduForm.startYear) { toast.error('Institution, degree, and start year are required'); return; }
    try {
      await addEducation({ ...eduForm, startYear: Number(eduForm.startYear), endYear: eduForm.endYear ? Number(eduForm.endYear) : undefined });
      toast.success('Education added');
      setShowEduForm(false);
      setEduForm({ institution: '', degree: '', field: '', startYear: '', endYear: '', current: false, gpa: '' });
      loadProfile();
    } catch (err: any) { toast.error(err.message); }
  };

  const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'resume', label: 'Resume' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/dashboard/candidate" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel flex items-center gap-4">
        <div className="relative">
          <Image
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Avatar"
            width={72} height={72}
            className="w-18 h-18 rounded-2xl object-cover border-2 border-brand-500/30"
          />
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer">
            {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{profile?.full_name || 'Your Profile'}</h1>
          <p className="text-xs text-slate-500">{profile?.headline || 'Add a professional headline'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
              <Input label="Professional Headline" placeholder="e.g. Senior Full-Stack Engineer" {...register('headline')} error={errors.headline?.message} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Location" {...register('location')} error={errors.location?.message} />
              <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
              <Input label="Years of Experience" type="number" {...register('experienceYrs', { valueAsNumber: true })} error={errors.experienceYrs?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Bio</label>
              <textarea rows={4} {...register('bio')} className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Website" placeholder="https://yoursite.dev" {...register('website')} error={errors.website?.message} />
              <Input label="GitHub URL" placeholder="https://github.com/..." {...register('githubUrl')} error={errors.githubUrl?.message} />
              <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register('linkedinUrl')} error={errors.linkedinUrl?.message} />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type a skill and press Enter or Add"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                />
                <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 border border-purple-500/20">
                    {s}
                    <button type="button" onClick={() => { const u = skills.filter((x) => x !== s); setSkills(u); setValue('skills', u); }}>
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" isLoading={isSaving} variant="primary" className="gap-2">
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resume Management</h2>
          <ResumeUpload
            versions={resumeVersions}
            onUploadSuccess={loadProfile}
            onSetActive={async (id) => { await setActiveResume(id); loadProfile(); toast.success('Active resume updated'); }}
            onDelete={async (id) => { await deleteResumeVersion(id); loadProfile(); toast.success('Version deleted'); }}
          />
        </div>
      )}

      {/* Work Experience Tab */}
      {activeTab === 'experience' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Work Experience</h2>
            <Button variant="outline" size="sm" onClick={() => setShowExpForm(!showExpForm)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {showExpForm && (
            <div className="p-4 rounded-2xl border border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Company" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} />
                <Input label="Job Title" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
                <Input label="Location" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} />
                <Input label="Start Date" type="date" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} />
                {!expForm.current && (
                  <Input label="End Date" type="date" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} />
                )}
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={expForm.current} onChange={(e) => setExpForm({ ...expForm, current: e.target.checked })} className="rounded" />
                Currently working here
              </label>
              <textarea rows={3} value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Describe your role and achievements..." className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleAddExp}>Save</Button>
                <Button variant="outline" size="sm" onClick={() => setShowExpForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(profile?.work_experiences || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No work experience added yet</p>
            ) : (
              profile.work_experiences.map((exp: any) => (
                <div key={exp.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500 shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                      <p className="text-xs text-slate-500">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(exp.start_date).getFullYear()} — {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}
                      </p>
                      {exp.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.description}</p>}
                    </div>
                  </div>
                  <button onClick={async () => { await deleteWorkExperience(exp.id); loadProfile(); }} className="p-1.5 text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Education</h2>
            <Button variant="outline" size="sm" onClick={() => setShowEduForm(!showEduForm)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {showEduForm && (
            <div className="p-4 rounded-2xl border border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Institution" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} />
                <Input label="Degree" placeholder="e.g. B.S. Computer Science" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} />
                <Input label="Field of Study" value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} />
                <Input label="GPA (optional)" value={eduForm.gpa} onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })} />
                <Input label="Start Year" type="number" value={eduForm.startYear} onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })} />
                {!eduForm.current && (
                  <Input label="End Year" type="number" value={eduForm.endYear} onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })} />
                )}
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={eduForm.current} onChange={(e) => setEduForm({ ...eduForm, current: e.target.checked })} className="rounded" />
                Currently enrolled
              </label>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleAddEdu}>Save</Button>
                <Button variant="outline" size="sm" onClick={() => setShowEduForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(profile?.educations || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No education added yet</p>
            ) : (
              profile.educations.map((edu: any) => (
                <div key={edu.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                      <p className="text-xs text-slate-500">{edu.institution}</p>
                      <p className="text-xs text-slate-400">
                        {edu.start_year} — {edu.current ? 'Present' : edu.end_year || ''}
                        {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </p>
                    </div>
                  </div>
                  <button onClick={async () => { await deleteEducation(edu.id); loadProfile(); }} className="p-1.5 text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
