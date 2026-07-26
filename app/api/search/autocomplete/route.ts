import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = await createClient();

  // This is a simplified implementation. A real-world scenario would use a
  // more optimized full-text search or a dedicated search service.
  const [jobsRes, companiesRes] = await Promise.all([
    supabase.from('jobs').select('title, tags').ilike('title', `%${query}%`).limit(5),
    supabase.from('companies').select('name').ilike('name', `%${query}%`).limit(3),
  ]);

  const jobTitles = jobsRes.data?.map(j => ({ type: 'Job', value: j.title })) || [];
  const skills = jobsRes.data?.flatMap(j => j.tags || [])
    .filter(t => t.toLowerCase().includes(query.toLowerCase()))
    .map(t => ({ type: 'Skill', value: t })) || [];
  const companies = companiesRes.data?.map(c => ({ type: 'Company', value: c.name })) || [];

  // Deduplicate and combine
  const allSuggestions = [...jobTitles, ...skills, ...companies];
  const uniqueSuggestions = Array.from(new Map(allSuggestions.map(item => [item.value, item])).values());

  return NextResponse.json({ suggestions: uniqueSuggestions.slice(0, 8) });
}
