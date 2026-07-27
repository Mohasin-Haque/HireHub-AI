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

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.size > maxSize) return apiError('File size must be under 5MB.', 400);
    if (!allowedTypes.includes(file.type)) return apiError('Only PDF and Word documents are allowed.', 400);

    // Ensure a profile exists before recording the file as a resume version.
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!profile) {
      const { data: createdProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.email?.split('@')[0] || 'Candidate',
          headline: 'Professional',
          bio: 'Profile created from resume upload.',
          location: 'Not specified',
          skills: [],
          experience_yrs: 0,
        })
        .select('id')
        .single();
      if (profileError || !createdProfile) return apiError(profileError?.message || 'Failed to create profile.', 500);
      profile = createdProfile;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const objectPath = `${user.id}/${Date.now()}.${extension}`;
    const { data: uploadedFile, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(objectPath, file, { upsert: false, contentType: file.type });
    if (uploadError) return apiError(uploadError.message, 500);

    const { data: signedFile, error: signedUrlError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(uploadedFile.path, 60 * 60 * 24 * 365);
    if (signedUrlError) return apiError(signedUrlError.message, 500);

    await supabase.from('resume_versions').update({ is_active: false }).eq('profile_id', profile.id);
    const { error: versionError } = await supabase.from('resume_versions').insert({
      profile_id: profile.id,
      file_name: file.name,
      file_url: signedFile.signedUrl,
      file_size: file.size,
      is_active: true,
    });
    if (versionError) return apiError(versionError.message, 500);

    const { error: resumeUpdateError } = await supabase.from('profiles').update({
      resume_url: signedFile.signedUrl,
      resume_file_name: file.name,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    if (resumeUpdateError) return apiError(resumeUpdateError.message, 500);

    // PDF is the format currently supported by the parser. Word files are still
    // safely stored and attached to the application, but are not auto-parsed.
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        message: 'Resume uploaded successfully. Parsing is currently available for PDF files only.',
        resumeUrl: signedFile.signedUrl,
        parsingWarning: 'Upload a PDF to auto-fill your profile.',
      });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text;

    if (!resumeText) {
      return NextResponse.json({
        message: 'Resume uploaded successfully, but no text could be extracted for parsing.',
        resumeUrl: signedFile.signedUrl,
        parsingWarning: 'Your resume is attached; use a text-based PDF to auto-fill your profile.',
      });
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

    // Preserve the actual Storage object URL; parsed resume content may contain
    // an unrelated or stale link that must not replace the uploaded file.
    await supabase.from('profiles').update({
      resume_url: signedFile.signedUrl,
      resume_file_name: file.name,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    return NextResponse.json({
      message: 'Resume parsed and profile updated successfully!',
      resumeUrl: signedFile.signedUrl,
      data: { ...extractedData, atsScore },
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return apiError(`Failed to parse resume: ${errorMessage}`, 500);
  }
}
