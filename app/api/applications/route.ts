import { NextRequest, NextResponse } from 'next/server';
import { HireHubStore } from '@/lib/db/store';
import { applyJobSchema } from '@/lib/validations';

export async function GET() {
  const applications = HireHubStore.getApplications();
  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, ...rest } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const validated = applyJobSchema.parse(rest);
    const app = HireHubStore.applyToJob({
      jobId,
      candidateName: validated.fullName,
      candidateEmail: validated.email,
      coverLetter: validated.coverLetter,
      resumeUrl: validated.resumeUrl,
    });

    return NextResponse.json(app, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 });
  }
}
