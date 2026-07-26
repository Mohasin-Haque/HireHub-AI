import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jobPostSchema } from '@/lib/validations';
import { ZodError } from 'zod';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, companies(name, logo_url, website, description)')
      .eq('id', id)
      .single();

    if (error || !job) return apiError('Job not found', 404);

    // Increment view count (fire-and-forget, non-blocking)
    supabase
      .from('jobs')
      .update({ views_count: (job.views_count ?? 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return NextResponse.json(job);
  } catch {
    return apiError('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return apiError('Unauthorized', 401);

    // Role check
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUser?.role !== 'EMPLOYER') return apiError('Forbidden: employer role required', 403);

    // Ownership check — job must belong to a company owned by this user
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (!company) return apiError('Company not found', 404);

    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .eq('company_id', company.id)
      .single();
    if (!existing) return apiError('Job not found or access denied', 404);

    // Validate body (partial — only validate fields that are present)
    const body = await req.json();
    const partial = jobPostSchema.partial().parse(body);

    const { data: updated, error: updateError } = await supabase
      .from('jobs')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', company.id)
      .select()
      .single();

    if (updateError) return apiError(updateError.message, 500);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    }
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return apiError('Unauthorized', 401);

    // Role check
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUser?.role !== 'EMPLOYER') return apiError('Forbidden: employer role required', 403);

    // Ownership check
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (!company) return apiError('Company not found', 404);

    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('company_id', company.id);

    if (deleteError) return apiError(deleteError.message, 500);
    return NextResponse.json({ success: true });
  } catch {
    return apiError('Internal server error', 500);
  }
}
