import { NextRequest, NextResponse } from 'next/server';
import { HireHubStore } from '@/lib/db/store';
import { jobPostSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();
  const location = searchParams.get('location')?.toLowerCase();
  const workplace = searchParams.get('workplace');
  const jobType = searchParams.get('jobType');
  const experience = searchParams.get('experience');

  let jobs = HireHubStore.getJobs();

  if (q) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)) ||
        j.description.toLowerCase().includes(q)
    );
  }

  if (location) {
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(location));
  }

  if (workplace && workplace !== 'ALL') {
    jobs = jobs.filter((j) => j.workplaceType === workplace);
  }

  if (jobType && jobType !== 'ALL') {
    jobs = jobs.filter((j) => j.jobType === jobType);
  }

  if (experience && experience !== 'ALL') {
    jobs = jobs.filter((j) => j.experienceLevel === experience);
  }

  return NextResponse.json({ jobs, total: jobs.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = jobPostSchema.parse(body);

    const created = HireHubStore.createJob({
      companyId: `comp-${Date.now()}`,
      companyName: validated.companyName,
      companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(validated.companyName)}`,
      companyWebsite: validated.companyWebsite || 'https://example.com',
      title: validated.title,
      description: validated.description,
      responsibilities: validated.responsibilities,
      requirements: validated.requirements,
      benefits: validated.benefits || 'Health insurance, competitive salary, flexible PTO.',
      location: validated.location,
      workplaceType: validated.workplaceType,
      jobType: validated.jobType,
      salaryMin: validated.salaryMin,
      salaryMax: validated.salaryMax,
      salaryCurrency: validated.salaryCurrency || 'USD',
      experienceLevel: validated.experienceLevel,
      tags: validated.tags,
      status: 'ACTIVE',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message || 'Validation error' }, { status: 400 });
  }
}
