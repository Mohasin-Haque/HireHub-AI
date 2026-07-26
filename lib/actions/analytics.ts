'use server';

import { createClient as createServerClient } from '@supabase/supabase-js';
import { unstable_cache as cache } from 'next/cache';

// Use a cookie-free anon client for public cached queries
function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-hirehub-ai.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-hirehub-ai-2026';
  return createServerClient(url, key);
}

export const getTrendingSkills = cache(
  async () => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('jobs')
      .select('tags')
      .eq('status', 'ACTIVE');

    if (!data) return [];

    const skillCounts = data
      .flatMap((job: { tags: string[] | null }) => job.tags || [])
      .reduce((acc: Record<string, number>, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(skillCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 10)
      .map(([skill]) => skill);
  },
  ['trending-skills'],
  { revalidate: 60 * 60 }
);

export const getTrendingCompanies = cache(
  async () => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('jobs')
      .select('company_id, companies(id, name, logo_url)')
      .eq('status', 'ACTIVE');

    if (!data) return [];

    const companyCounts = data
      .reduce((acc: Record<string, number>, job: { company_id: string }) => {
        if (job.company_id) {
          acc[job.company_id] = (acc[job.company_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    const uniqueCompanies = (data as any[]).reduce((acc: Record<string, { id: string; name: string; logo_url: string | null }>, job: any) => {
      const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
      if (company && !acc[company.id]) {
        acc[company.id] = company;
      }
      return acc;
    }, {} as Record<string, { id: string; name: string; logo_url: string | null }>);

    return Object.entries(companyCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 5)
      .map(([companyId]) => uniqueCompanies[companyId]);
  },
  ['trending-companies'],
  { revalidate: 60 * 60 }
);
