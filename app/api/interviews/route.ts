import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const createSchema = z.object({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  scheduled_at: z.string().min(1),
  duration_minutes: z.number().int().positive().optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  scheduled_at: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return NextResponse.json({ interviews: [] });

    const { data: jobs } = await supabase.from('jobs').select('id').eq('company_id', company.id);
    const jobIds = (jobs || []).map((j: { id: string }) => j.id);
    if (!jobIds.length) return NextResponse.json({ interviews: [] });

    const { data, error } = await supabase
      .from('interviews')
      .select('*, jobs(title), profiles!candidate_id(full_name, avatar_url)')
      .in('job_id', jobIds)
      .order('scheduled_at', { ascending: true });

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ interviews: data || [] });
  } catch {
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const body = createSchema.parse(await req.json());

    // Verify employer owns the job
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return apiError('Company not found', 404);

    const { data: job } = await supabase.from('jobs').select('id').eq('id', body.job_id).eq('company_id', company.id).single();
    if (!job) return apiError('Job not found or access denied', 404);

    const { data, error } = await supabase.from('interviews').insert(body).select().single();
    if (error) return apiError(error.message, 400);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const { id, ...updates } = patchSchema.parse(await req.json());

    // Verify employer owns the interview's job
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return apiError('Company not found', 404);

    const { data: interview } = await supabase.from('interviews').select('job_id').eq('id', id).single();
    if (!interview) return apiError('Interview not found', 404);

    const { data: job } = await supabase.from('jobs').select('id').eq('id', interview.job_id).eq('company_id', company.id).single();
    if (!job) return apiError('Access denied', 403);

    const { data, error } = await supabase
      .from('interviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return apiError(error.message, 400);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    return apiError('Internal server error', 500);
  }
}
