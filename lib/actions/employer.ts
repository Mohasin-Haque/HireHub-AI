'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { jobPostSchema, type JobPostInput } from '@/lib/validations';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

async function getEmployerCompany(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('companies').select('*').eq('owner_id', userId).single();
  return data;
}

// ── Company ───────────────────────────────────────────────────

export async function getCompany() {
  const { supabase, user } = await getAuthUser();
  return getEmployerCompany(supabase, user.id);
}

export async function upsertCompany(input: {
  name: string; website?: string; description?: string; industry?: string;
  location?: string; size?: string; benefits?: string[]; techStack?: string[];
  hiringStatus?: boolean; socialLinks?: Record<string, string>;
}) {
  const { supabase, user } = await getAuthUser();
  const { data, error } = await supabase
    .from('companies')
    .upsert({
      owner_id: user.id,
      name: input.name,
      website: input.website || null,
      description: input.description || null,
      industry: input.industry || null,
      location: input.location || null,
      size: input.size || '1-10 employees',
      benefits: input.benefits || [],
      tech_stack: input.techStack || [],
      hiring_status: input.hiringStatus ?? true,
      social_links: input.socialLinks || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
  return data;
}

export async function uploadCompanyLogo(logoUrl: string) {
  const { supabase, user } = await getAuthUser();
  const { error } = await supabase
    .from('companies')
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq('owner_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
}

// ── Jobs ──────────────────────────────────────────────────────

export async function getEmployerJobs(status?: string) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) return [];

  let query = supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data } = await query;
  return data || [];
}

export async function createJob(input: JobPostInput & { status?: string; scheduledAt?: string }) {
  const { supabase, user } = await getAuthUser();
  const validated = jobPostSchema.parse(input);

  let company = await getEmployerCompany(supabase, user.id);
  if (!company) {
    const { data: newCompany } = await supabase
      .from('companies')
      .insert({ owner_id: user.id, name: validated.companyName, website: validated.companyWebsite || null })
      .select()
      .single();
    company = newCompany;
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: company!.id,
      title: validated.title,
      description: validated.description,
      responsibilities: validated.responsibilities,
      requirements: validated.requirements,
      benefits: validated.benefits || null,
      location: validated.location,
      workplace_type: validated.workplaceType,
      job_type: validated.jobType,
      salary_min: validated.salaryMin,
      salary_max: validated.salaryMax,
      salary_currency: validated.salaryCurrency || 'USD',
      experience_level: validated.experienceLevel,
      tags: validated.tags,
      status: input.status || 'ACTIVE',
      scheduled_at: input.scheduledAt || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
  return data;
}

export async function updateJob(id: string, updates: Partial<JobPostInput> & { status?: string }) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) throw new Error('Company not found');

  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', company.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
  return data;
}

export async function deleteJob(id: string) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) throw new Error('Company not found');

  const { error } = await supabase.from('jobs').delete().eq('id', id).eq('company_id', company.id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
}

export async function duplicateJob(id: string) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) throw new Error('Company not found');

  const { data: original } = await supabase.from('jobs').select('*').eq('id', id).single();
  if (!original) throw new Error('Job not found');

  const { id: _id, created_at: _created_at, updated_at: _updated_at, views_count: _views_count, ...rest } = original;
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...rest, title: `${rest.title} (Copy)`, status: 'DRAFT', views_count: 0 })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer');
  return data;
}

// ── Applications ──────────────────────────────────────────────

async function logApplicationStatusChange(supabase: any, applicationId: string, status: string, notes?: string) {
  await supabase.from('application_status_history').insert({
    application_id: applicationId,
    status,
    notes: notes || null,
  });
}

export async function getJobApplications(jobId?: string) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) return [];

  let query = supabase
    .from('applications')
    .select('*, jobs(title, company_id), profiles!candidate_id(full_name, avatar_url, headline, resume_url, skills)')
    .order('created_at', { ascending: false });

  if (jobId) {
    query = query.eq('job_id', jobId);
  } else {
    const { data: companyJobs } = await supabase.from('jobs').select('id').eq('company_id', company.id);
    const jobIds = (companyJobs || []).map((j: any) => j.id);
    if (!jobIds.length) return [];
    query = query.in('job_id', jobIds);
  }

  const { data } = await query;
  return data || [];
}

export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  const { supabase, user } = await getAuthUser();

  // Verify the application belongs to a job owned by this employer
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) throw new Error('Company not found');

  const { data: application } = await supabase
    .from('applications')
    .select('job_id, jobs(company_id)')
    .eq('id', id)
    .single();

  if (!application) throw new Error('Application not found');
  const jobCompanyId = (application.jobs as any)?.company_id;
  if (jobCompanyId !== company.id) throw new Error('Forbidden');

  const { data, error } = await supabase
    .from('applications')
    .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logApplicationStatusChange(supabase, id, status, notes);

  revalidatePath('/dashboard/employer/applications');
  return data;
}

export async function getApplicationStatusHistory(applicationId: string) {
    const { supabase } = await getAuthUser();
    const { data } = await supabase
        .from('application_status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });
    return data || [];
}

export async function getApplicationById(id: string) {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) throw new Error('Company not found');

  const { data: application } = await supabase
    .from('applications')
    .select('*, jobs(*), profiles!candidate_id(*)')
    .eq('id', id)
    .single();

  if (!application) throw new Error('Application not found');

  // Security check: ensure the job belongs to the employer's company
  if ((application.jobs as any)?.company_id !== company.id) {
    throw new Error('Forbidden');
  }

  return application;
}

// ── Analytics ─────────────────────────────────────────────────

export async function getEmployerAnalytics() {
  const { supabase, user } = await getAuthUser();
  const company = await getEmployerCompany(supabase, user.id);
  if (!company) return null;

  const [jobsRes, appsRes] = await Promise.all([
    supabase.from('jobs').select('id, status, views_count, created_at').eq('company_id', company.id),
    supabase.from('applications')
      .select('id, status, created_at, job_id')
      .in('job_id', (await supabase.from('jobs').select('id').eq('company_id', company.id)).data?.map((j: any) => j.id) || []),
  ]);

  const jobs = jobsRes.data || [];
  const apps = appsRes.data || [];

  const funnel = {
    total: apps.length,
    reviewing: apps.filter((a: any) => a.status === 'REVIEWING').length,
    interviewing: apps.filter((a: any) => a.status === 'INTERVIEWING').length,
    shortlisted: apps.filter((a: any) => a.status === 'SHORTLISTED').length,
    accepted: apps.filter((a: any) => a.status === 'ACCEPTED').length,
    rejected: apps.filter((a: any) => a.status === 'REJECTED').length,
  };

  // Weekly trend (last 7 days)
  const now = new Date();
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      applications: apps.filter((a: any) => a.created_at.startsWith(dateStr)).length,
      views: jobs.reduce((sum: number, j: any) => sum + (j.created_at.startsWith(dateStr) ? j.views_count : 0), 0),
    };
  });

  return {
    activeJobs: jobs.filter((j: any) => j.status === 'ACTIVE').length,
    totalJobs: jobs.length,
    totalApplications: apps.length,
    totalViews: jobs.reduce((sum: number, j: any) => sum + (j.views_count || 0), 0),
    funnel,
    weeklyTrend,
  };
}
