import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@/lib/supabase/server';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const patchSchema = z.object({
  id: z.string().uuid().optional(),
  markAll: z.boolean().optional(),
}).refine((d) => d.id || d.markAll, { message: 'Provide id or markAll' });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ notifications: data || [] });
  } catch {
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const { id, markAll } = patchSchema.parse(await req.json());

    if (markAll) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    } else {
      await supabase.from('notifications').update({ read: true }).eq('id', id!).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    return apiError('Internal server error', 500);
  }
}
