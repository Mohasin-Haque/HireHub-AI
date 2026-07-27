import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z, ZodError } from 'zod';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const applySchema = z.object({
  jobId: z.string().uuid('jobId must be a valid UUID'),
  coverLetter: z.string().min(30, 'Cover letter must be at least 30 characters'),
  resumeUrl: z.string().url('A valid resume URL is required'),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return apiError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(title, location, workplace_type, companies(name, logo_url))')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ applications: data ?? [] });
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

    // Role check — only CANDIDATE may apply
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUser?.role !== 'CANDIDATE') return apiError('Forbidden: candidate role required', 403);

    // Validate body
    const body = await req.json();
    const { jobId, coverLetter, resumeUrl } = applySchema.parse(body);

    // Verify the job exists and is active
    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('status', 'ACTIVE')
      .single();
    if (!job) return apiError('Job not found or no longer active', 404);

    // Prevent duplicate applications
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', user.id)
      .single();
    if (existing) return apiError('You have already applied to this job', 409);

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: user.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl || null,
        status: 'PENDING',
        match_score: null,
      })
      .select()
      .single();

    if (insertError) return apiError(insertError.message, 500);
    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    }
    return apiError('Internal server error', 500);
  }
}
