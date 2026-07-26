'use server';

import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/ai-service';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

async function saveAIHistory(
  supabase: any,
  userId: string,
  action: string,
  input: Record<string, unknown>,
  output: unknown,
  meta: { modelName?: string; tokensUsed?: number; processingTime?: number; status?: string }
) {
  await supabase.from('ai_history').insert({
    user_id: userId,
    action,
    input_payload: input,
    output_payload: output,
    model_name: meta.modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    tokens_used: meta.tokensUsed || null,
    processing_time: meta.processingTime || null,
    status: meta.status || 'success',
  });
}

// ── AI Actions with History ───────────────────────────────────

export async function generateJobDescription(payload: { title: string; companyName: string; location?: string; skills?: string[] }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.generateJobDescription(payload);
  await saveAIHistory(supabase, user.id, 'GENERATE_DESCRIPTION', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function improveJobTitle(payload: { title: string }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.improveJobTitle(payload);
  await saveAIHistory(supabase, user.id, 'IMPROVE_TITLE', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function suggestSkills(payload: { title: string }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.suggestSkills(payload);
  await saveAIHistory(supabase, user.id, 'SUGGEST_SKILLS', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function generateCompanySummary(payload: { companyName: string; industry?: string }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.generateCompanySummary(payload);
  await saveAIHistory(supabase, user.id, 'COMPANY_SUMMARY', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function generateInterviewQuestions(payload: { title: string }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.generateInterviewQuestions(payload);
  await saveAIHistory(supabase, user.id, 'INTERVIEW_QUESTIONS', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function generateCoverLetter(payload: { jobTitle: string; companyName: string; candidateName: string; skills: string[] }) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.generateCoverLetter(payload);
  await saveAIHistory(supabase, user.id, 'COVER_LETTER', payload, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function analyzeResume(resumeText: string) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.analyzeResume(resumeText);
  await saveAIHistory(supabase, user.id, 'RESUME_ANALYZE', { resumeLength: resumeText.length }, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function calculateATSScore(resumeText: string, jobDescription: string) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.calculateATSScore(resumeText, jobDescription);
  await saveAIHistory(supabase, user.id, 'ATS_SCORE', { resumeLength: resumeText.length }, result, {
    processingTime: Date.now() - start,
  });

  // Update profile ats_score
  await supabase.from('profiles').update({ ats_score: (result as any).score }).eq('user_id', user.id);
  revalidatePath('/dashboard/candidate');
  return result;
}

export async function extractResumeDataWithHistory(resumeText: string) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.extractResumeData(resumeText);
  await saveAIHistory(supabase, user.id, 'RESUME_EXTRACT', { resumeLength: resumeText.length }, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function getCareerRecommendationsWithHistory(profile: any) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.getCareerRecommendations(profile);
  await saveAIHistory(supabase, user.id, 'CAREER_RECOMMENDATIONS', { profileId: profile.id }, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

export async function getCompanyRecommendationsWithHistory(profile: any) {
  const { supabase, user } = await getAuthUser();
  const start = Date.now();
  const result = await AIService.getCompanyRecommendations(profile);
  await saveAIHistory(supabase, user.id, 'COMPANY_RECOMMENDATIONS', { profileId: profile.id }, result, {
    processingTime: Date.now() - start,
  });
  return result;
}

// ── AI History CRUD ───────────────────────────────────────────

export async function getAIHistory(action?: string, search?: string) {
  const { supabase, user } = await getAuthUser();
  let query = supabase
    .from('ai_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (action) query = query.eq('action', action);

  const { data } = await query;
  if (!data) return [];

  if (search) {
    const s = search.toLowerCase();
    return data.filter((h: any) =>
      JSON.stringify(h.input_payload).toLowerCase().includes(s) ||
      JSON.stringify(h.output_payload).toLowerCase().includes(s)
    );
  }
  return data;
}

export async function toggleAIHistoryFavorite(id: string) {
  const { supabase, user } = await getAuthUser();
  const { data: current } = await supabase.from('ai_history').select('is_favorite').eq('id', id).eq('user_id', user.id).single();
  await supabase.from('ai_history').update({ is_favorite: !current?.is_favorite }).eq('id', id).eq('user_id', user.id);
}

export async function deleteAIHistory(id: string) {
  const { supabase, user } = await getAuthUser();
  await supabase.from('ai_history').delete().eq('id', id).eq('user_id', user.id);
}
