import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (data?.role !== 'ADMIN') return null;
  return user;
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'CLOSED', 'DRAFT', 'ARCHIVED', 'EXPIRED']),
});

export async function GET() {
  try {
    const supabase = await createClient();
    if (!await requireAdmin(supabase)) return apiError('Forbidden', 403);

    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, status, created_at, companies(name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ jobs: data || [] });
  } catch {
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!await requireAdmin(supabase)) return apiError('Forbidden', 403);

    const { id, status } = patchSchema.parse(await req.json());
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id);
    if (error) return apiError(error.message, 500);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    return apiError('Internal server error', 500);
  }
}
