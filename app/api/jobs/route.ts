import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jobPostSchema } from '@/lib/validations';
import { ZodError } from 'zod';

function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q');
    const location = searchParams.get('location');
    const workplace = searchParams.get('workplace');
    const jobType = searchParams.get('jobType');
    const experience = searchParams.get('experience');
    const minSalary = searchParams.get('minSalary');

    let query = supabase
      .from('jobs')
      .select('*, companies(name, logo_url, website)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (workplace && workplace !== 'ALL') query = query.eq('workplace_type', workplace);
    if (jobType && jobType !== 'ALL') query = query.eq('job_type', jobType);
    if (experience && experience !== 'ALL') query = query.eq('experience_level', experience);
    if (minSalary && Number(minSalary) > 0) query = query.gte('salary_max', Number(minSalary));

    const { data, error } = await query;
    if (error) return apiError(error.message, 500);

    return NextResponse.json({ jobs: data ?? [], total: data?.length ?? 0 });
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

    // Role check — only EMPLOYER may create jobs
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (dbUser?.role !== 'EMPLOYER') return apiError('Forbidden: employer role required', 403);

    // Validate body
    const body = await req.json();
    const validated = jobPostSchema.parse(body);

    // Resolve or create company owned by this user
    let { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!company) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          owner_id: user.id,
          name: validated.companyName,
          website: validated.companyWebsite || null,
        })
        .select('id')
        .single();
      if (companyError) return apiError(companyError.message, 500);
      company = newCompany;
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: company!.id,
        title: validated.title,
        description: validated.description,
        responsibilities: validated.responsibilities,
        requirements: validated.requirements,
        benefits: validated.benefits || null,
        location: validated.location,
        workplace_type: validated.workplaceType,
        job_type: validated.jobType,
        salary_min: validated.salaryMin,
        salary_max: validated.salaryMax,
        salary_currency: validated.salaryCurrency || 'USD',
        experience_level: validated.experienceLevel,
        tags: validated.tags,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (jobError) return apiError(jobError.message, 500);
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 422 });
    }
    return apiError('Internal server error', 500);
  }
}
