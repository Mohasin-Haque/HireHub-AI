import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractResumeDataWithHistory } from '@/lib/actions/ai';
import { upsertProfile, addWorkExperience, addEducation } from '@/lib/actions/candidate';
import { AIService } from '@/lib/ai/ai-service';

async function apiError(message: string, status: number) {
  return new NextResponse(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return apiError('No resume file provided.', 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text;

    if (!resumeText) {
      return apiError('Could not extract text from PDF.', 400);
    }

    const extractedData: any = await extractResumeDataWithHistory(resumeText);

    if (extractedData.profile) {
      const p = extractedData.profile;
      const firstJobTitle = extractedData.workExperiences?.[0]?.title;
      const skillList: string[] = Array.isArray(p.skills) && p.skills.length > 0 ? p.skills : ['General'];
      const str = (v: unknown) => (v && typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined);
      const url = (v: unknown) => { const s = str(v); if (!s) return undefined; try { new URL(s.startsWith('http') ? s : `https://${s}`); return s.startsWith('http') ? s : `https://${s}`; } catch { return undefined; } };
      await upsertProfile({
        fullName:      p.fullName      || 'Unknown',
        headline:      p.headline      || firstJobTitle || 'Professional',
        bio:           p.bio           || p.summary     || `Experienced professional skilled in ${skillList.slice(0, 3).join(', ')}.`,
        phone:         str(p.phone),
        location:      p.location      || 'Not specified',
        resumeUrl:     url(p.resumeUrl),
        website:       url(p.website),
        githubUrl:     url(p.githubUrl),
        linkedinUrl:   url(p.linkedinUrl),
        skills:        skillList,
        experienceYrs: typeof p.experienceYrs === 'number' ? p.experienceYrs : 0,
      });
    }

    if (Array.isArray(extractedData.workExperiences)) {
      for (const exp of extractedData.workExperiences) {
        if (!exp.company || !exp.title || !exp.startDate) continue;
        await addWorkExperience({
          company:     exp.company,
          title:       exp.title,
          location:    exp.location   || undefined,
          startDate:   exp.startDate,
          endDate:     exp.endDate    || undefined,
          current:     exp.current    ?? false,
          description: exp.description || undefined,
        });
      }
    }

    if (Array.isArray(extractedData.educations)) {
      for (const edu of extractedData.educations) {
        if (!edu.institution || !edu.degree || !edu.startYear) continue;
        await addEducation({
          institution: edu.institution,
          degree:      edu.degree,
          field:       edu.field      || undefined,
          startYear:   edu.startYear,
          endYear:     edu.endYear    || undefined,
          current:     edu.current    ?? false,
          gpa:         edu.gpa        || undefined,
        });
      }
    }

    // Calculate ATS score from resume text and save to profile
    let atsScore: number | null = null;
    try {
      const atsResult: any = await AIService.calculateATSScore(resumeText, '');
      if (typeof atsResult?.score === 'number') {
        atsScore = atsResult.score;
        await supabase
          .from('profiles')
          .update({ ats_score: atsScore })
          .eq('user_id', user.id);
      }
    } catch {
      // Non-critical — don't fail the whole request
    }

    return NextResponse.json({
      message: 'Resume parsed and profile updated successfully!',
      data: { ...extractedData, atsScore },
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return apiError(`Failed to parse resume: ${errorMessage}`, 500);
  }
}
