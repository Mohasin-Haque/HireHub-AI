import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, companyName, location, skills } = body;

    if (!title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    const data = await AIService.generateJobDescription({ title, companyName, location, skills });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Generation Error' }, { status: 500 });
  }
}
