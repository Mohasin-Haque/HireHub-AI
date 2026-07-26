'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@supabase/ssr';

// Public client — no cookies needed, safe to call from client components
function createPublicClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getPublicJobs(filters?: {
  q?: string;
  location?: string;
  workplaceType?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: number;
}) {
  const supabase = createPublicClient();

  let query = supabase
    .from('jobs')
    .select('*, companies(name, logo_url, website)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (filters?.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.workplaceType && filters.workplaceType !== 'ALL') {
    query = query.eq('workplace_type', filters.workplaceType);
  }
  if (filters?.jobType && filters.jobType !== 'ALL') {
    query = query.eq('job_type', filters.jobType);
  }
  if (filters?.experienceLevel && filters.experienceLevel !== 'ALL') {
    query = query.eq('experience_level', filters.experienceLevel);
  }
  if (filters?.minSalary && filters.minSalary > 0) {
    query = query.gte('salary_max', filters.minSalary);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPublicJobById(id: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url, website, description)')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function incrementJobViews(id: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from('jobs').select('views_count').eq('id', id).single();
  if (data) {
    await supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
  }
}

export async function getPublicCompanyById(id: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function getJobsForCompany(companyId: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('jobs')
    .select('*, companies(name, logo_url, website)')
    .eq('company_id', companyId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
  return data || [];
}

