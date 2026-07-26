'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null };
  return { supabase, user };
}

export async function getCompanyReviews(companyId: string) {
  const { supabase } = await getAuthUser();
  const { data } = await supabase
    .from('company_reviews')
    .select('*, profiles(full_name, avatar_url, headline)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addCompanyReview(companyId: string, review: { rating: number; title: string; body: string }) {
  const { supabase, user } = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  await supabase.from('company_reviews').insert({
    company_id: companyId,
    reviewer_id: user.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
  });
  revalidatePath(`/companies/${companyId}`);
}

export async function getCompanyFollowerCount(companyId: string) {
  const { supabase } = await getAuthUser();
  const { count } = await supabase
    .from('company_followers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  return count || 0;
}

export async function isFollowingCompany(companyId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) return false;

  const { data } = await supabase
    .from('company_followers')
    .select('company_id')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single();
  return !!data;
}

export async function toggleFollowCompany(companyId: string) {
  const { supabase, user } = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const following = await isFollowingCompany(companyId);

  if (following) {
    await supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', user.id);
  } else {
    await supabase.from('company_followers').insert({
      company_id: companyId,
      user_id: user.id,
    });
  }
  revalidatePath(`/companies/${companyId}`);
  return !following;
}
