import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z, ZodError } from 'zod';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const toggleSchema = z.object({
  jobId: z.string().uuid('jobId must be a valid UUID'),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return apiError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('bookmarks')
      .select('job_id, jobs(*, companies(name, logo_url, website))')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ bookmarks: data ?? [] });
  } catch {
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return apiError('Unauthorized', 401);

    // Role check — only CANDIDATE may bookmark
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUser?.role !== 'CANDIDATE') return apiError('Forbidden: candidate role required', 403);

    // Validate body
    const body = await req.json();
    const { jobId } = toggleSchema.parse(body);

    // Toggle: remove if exists, add if not
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', user.id)
      .single();

    if (existing) {
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id);
      if (deleteError) return apiError(deleteError.message, 500);
      return NextResponse.json({ jobId, isBookmarked: false });
    }

    // Verify job exists before bookmarking
    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();
    if (!job) return apiError('Job not found', 404);

    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert({ job_id: jobId, candidate_id: user.id });
    if (insertError) return apiError(insertError.message, 500);

    return NextResponse.json({ jobId, isBookmarked: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    }
    return apiError('Internal server error', 500);
  }
}
