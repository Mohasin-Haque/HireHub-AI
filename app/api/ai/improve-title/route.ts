import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { AIService } from '@/lib/ai/ai-service';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  title: z.string().min(1, 'title is required'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!rateLimit(user.id, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = schema.parse(await req.json());
    const data = await AIService.improveJobTitle(body);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    return NextResponse.json({ error: 'AI Improvement Error' }, { status: 500 });
  }
}
