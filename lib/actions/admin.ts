'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (dbUser?.role !== 'ADMIN') throw new Error('Forbidden');
  return { supabase, user };
}

export async function getAdminStats() {
  const { supabase } = await getAdminUser();
  const [usersRes, companiesRes, jobsRes, appsRes, aiRes, reviewsRes] = await Promise.all([
    supabase.from('users').select('id, role, created_at'),
    supabase.from('companies').select('id, name, industry, hiring_status, created_at'),
    supabase.from('jobs').select('id, status, created_at'),
    supabase.from('applications').select('id, status, created_at'),
    supabase.from('ai_history').select('id, action, tokens_used, created_at'),
    supabase.from('company_reviews').select('id, title, body, rating, created_at').order('created_at', { ascending: false }).limit(50),
  ]);

  return {
    users: usersRes.data || [],
    companies: companiesRes.data || [],
    jobs: jobsRes.data || [],
    applications: appsRes.data || [],
    aiHistory: aiRes.data || [],
    reviews: reviewsRes.data || [],
  };
}

export async function getAllUsers(search?: string) {
  const { supabase } = await getAdminUser();
  const { data } = await supabase
    .from('users')
    .select('*, profiles(full_name, avatar_url, headline)')
    .order('created_at', { ascending: false });
  if (!data) return [];
  if (search) {
    const s = search.toLowerCase();
    return data.filter((u: any) =>
      u.email.toLowerCase().includes(s) ||
      u.profiles?.full_name?.toLowerCase().includes(s)
    );
  }
  return data;
}

export async function updateUserRole(userId: string, role: string) {
  const { supabase } = await getAdminUser();
  await supabase.from('users').update({ role }).eq('id', userId);
  revalidatePath('/dashboard/admin');
}

export async function moderateJob(jobId: string, status: string) {
  const { supabase } = await getAdminUser();
  await supabase.from('jobs').update({ status }).eq('id', jobId);
  revalidatePath('/dashboard/admin');
}

export async function getFeatureFlags() {
  const { supabase } = await getAdminUser();
  const { data } = await supabase.from('feature_flags').select('*').order('key');
  return data || [];
}

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  const { supabase } = await getAdminUser();
  await supabase.from('feature_flags').upsert({ key, enabled, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  revalidatePath('/dashboard/admin');
}

export async function getAuditLogs(limit = 100) {
  const { supabase } = await getAdminUser();
  const { data } = await supabase
    .from('activity_logs')
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
