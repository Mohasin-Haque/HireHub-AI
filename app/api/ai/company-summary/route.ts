import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, industry } = body;

    const data = await AIService.generateCompanySummary({ companyName, industry });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Company Summary Error' }, { status: 500 });
  }
}
