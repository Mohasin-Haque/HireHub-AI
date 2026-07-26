import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as pdfParse from 'pdf-parse';
import { extractResumeDataWithHistory } from '@/lib/actions/ai';
import { upsertProfile, addWorkExperience, addEducation } from '@/lib/actions/candidate';

const pdf = (pdfParse as any).default ?? pdfParse;

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

    const fileBuffer = await file.arrayBuffer();
    const pdfData = await pdf(fileBuffer);
    const resumeText = pdfData.text;

    if (!resumeText) {
      return apiError('Could not extract text from PDF.', 400);
    }

    const extractedData: any = await extractResumeDataWithHistory(resumeText);

    if (extractedData.profile) {
      await upsertProfile(extractedData.profile);
    }

    if (extractedData.workExperiences && Array.isArray(extractedData.workExperiences)) {
      for (const exp of extractedData.workExperiences) {
        await addWorkExperience(exp);
      }
    }

    if (extractedData.educations && Array.isArray(extractedData.educations)) {
      for (const edu of extractedData.educations) {
        await addEducation(edu);
      }
    }

    return NextResponse.json({
      message: 'Resume parsed and profile updated successfully!',
      data: extractedData,
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return apiError(`Failed to parse resume: ${errorMessage}`, 500);
  }
}
