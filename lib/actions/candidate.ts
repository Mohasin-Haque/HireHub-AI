'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { applyJobSchema, profileSchema, type ProfileInput } from '@/lib/validations';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

// ── Profile ──────────────────────────────────────────────────

export async function getProfile() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('profiles')
    .select('*, work_experiences(*), educations(*), resume_versions(*)')
    .eq('user_id', user.id)
    .single();
  return data;
}

export async function upsertProfile(input: ProfileInput & { portfolioLinks?: string[] }) {
  const { supabase, user } = await getAuthUser();
  const validated = profileSchema.parse(input);

  const completion = calculateProfileCompletion(validated);

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      full_name: validated.fullName,
      headline: validated.headline,
      bio: validated.bio,
      phone: validated.phone || null,
      location: validated.location,
      resume_url: validated.resumeUrl || null,
      website: validated.website || null,
      github_url: validated.githubUrl || null,
      linkedin_url: validated.linkedinUrl || null,
      skills: validated.skills,
      experience_yrs: validated.experienceYrs,
      portfolio_links: input.portfolioLinks || [],
      profile_completion: completion,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate');
  revalidatePath('/dashboard/candidate/profile');
  return data;
}

function calculateProfileCompletion(profile: Partial<ProfileInput>): number {
  const fields = [
    profile.fullName, profile.headline, profile.bio, profile.location,
    profile.resumeUrl, profile.githubUrl, profile.linkedinUrl,
    profile.skills?.length, profile.experienceYrs,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── Work Experience ───────────────────────────────────────────

export async function addWorkExperience(data: {
  company: string; title: string; location?: string;
  startDate: string; endDate?: string; current: boolean; description?: string;
}) {
  const { supabase, user } = await getAuthUser();
  const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile.data) throw new Error('Profile not found');

  const { error } = await supabase.from('work_experiences').insert({
    profile_id: profile.data.id,
    company: data.company,
    title: data.title,
    location: data.location || null,
    start_date: data.startDate,
    end_date: data.current ? null : (data.endDate || null),
    current: data.current,
    description: data.description || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate/profile');
}

export async function deleteWorkExperience(id: string) {
  const { supabase } = await getAuthUser();
  const { error } = await supabase.from('work_experiences').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate/profile');
}

// ── Education ─────────────────────────────────────────────────

export async function addEducation(data: {
  institution: string; degree: string; field?: string;
  startYear: number; endYear?: number; current: boolean; gpa?: string;
}) {
  const { supabase, user } = await getAuthUser();
  const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile.data) throw new Error('Profile not found');

  const { error } = await supabase.from('educations').insert({
    profile_id: profile.data.id,
    institution: data.institution,
    degree: data.degree,
    field: data.field || null,
    start_year: data.startYear,
    end_year: data.current ? null : (data.endYear || null),
    current: data.current,
    gpa: data.gpa || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate/profile');
}

export async function deleteEducation(id: string) {
  const { supabase } = await getAuthUser();
  const { error } = await supabase.from('educations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate/profile');
}

// ── Resume Versions ───────────────────────────────────────────

export async function getResumeVersions() {
  const { supabase, user } = await getAuthUser();
  const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile.data) return [];

  const { data } = await supabase
    .from('resume_versions')
    .select('*')
    .eq('profile_id', profile.data.id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function setActiveResume(versionId: string) {
  const { supabase, user } = await getAuthUser();
  const profile = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile.data) throw new Error('Profile not found');

  await supabase.from('resume_versions').update({ is_active: false }).eq('profile_id', profile.data.id);
  const { data, error } = await supabase
    .from('resume_versions')
    .update({ is_active: true })
    .eq('id', versionId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase.from('profiles').update({ resume_url: data.file_url, resume_file_name: data.file_name }).eq('user_id', user.id);
  revalidatePath('/dashboard/candidate/profile');
  return data;
}

export async function deleteResumeVersion(id: string) {
  const { supabase } = await getAuthUser();
  const { error } = await supabase.from('resume_versions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate/profile');
}

// ── Bookmarks ─────────────────────────────────────────────────

export async function toggleBookmark(jobId: string) {
  const { supabase, user } = await getAuthUser();
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('job_id', jobId)
    .eq('candidate_id', user.id)
    .single();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('bookmarks').insert({ job_id: jobId, candidate_id: user.id });
    return true;
  }
}

export async function getBookmarkedJobs() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('bookmarks')
    .select('job_id, jobs(*)')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false });
  return (data || []).map((b: any) => b.jobs).filter(Boolean);
}

// ── Applications ──────────────────────────────────────────────

export async function getCandidateApplications() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('applications')
    .select('*, jobs(title, location, workplace_type, companies(name, logo_url))')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function applyToJob(jobId: string, coverLetter: string, resumeUrl?: string) {
  const { supabase, user } = await getAuthUser();

  const resumeValidation = applyJobSchema.shape.resumeUrl.safeParse(resumeUrl);
  if (!resumeValidation.success) {
    throw new Error(resumeValidation.error.issues[0]?.message || 'A valid resume URL is required to apply.');
  }

  // Prevent duplicate applications
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('candidate_id', user.id)
    .maybeSingle();
  if (existing) throw new Error('You have already applied to this job.');

  // Verify job is still active
  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('status', 'ACTIVE')
    .maybeSingle();
  if (!job) throw new Error('This job is no longer accepting applications.');

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      cover_letter: coverLetter,
      resume_url: resumeValidation.data,
      status: 'PENDING',
      match_score: null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate');
  return data;
}

// ── Saved Searches ────────────────────────────────────────────

export async function getSavedSearches() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function saveSearch(name: string, query: Record<string, unknown>) {
  const { supabase, user } = await getAuthUser();
  const { error } = await supabase.from('saved_searches').insert({ user_id: user.id, name, query });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/candidate');
}

export async function deleteSavedSearch(id: string) {
  const { supabase } = await getAuthUser();
  await supabase.from('saved_searches').delete().eq('id', id);
}

// ── Recently Viewed ───────────────────────────────────────────

export async function trackRecentlyViewed(jobId: string) {
  try {
    const { supabase, user } = await getAuthUser();
    // Upsert into activity_logs — deduplicate by deleting old entry first
    await supabase
      .from('activity_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('action', 'VIEW_JOB')
      .eq('entity_id', jobId);
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'VIEW_JOB',
      entity: 'job',
      entity_id: jobId,
    });
  } catch {
    // Non-critical — silently ignore if unauthenticated
  }
}

export async function getRecentlyViewedJobs(limit = 6) {
  const { supabase, user } = await getAuthUser();
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('entity_id')
    .eq('user_id', user.id)
    .eq('action', 'VIEW_JOB')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!logs?.length) return [];
  const jobIds = logs.map((l: any) => l.entity_id).filter(Boolean);

  const { data } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url, website)')
    .in('id', jobIds);
  return data || [];
}
