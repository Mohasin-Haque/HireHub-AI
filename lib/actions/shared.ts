'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

// ── Notifications ─────────────────────────────────────────────

export async function getNotificationPreferences() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('user_id', user.id)
    .single();
  return (data?.notification_preferences || {}) as Record<string, boolean>;
}

export async function updateNotificationPreferences(prefs: Record<string, boolean>) {
  const { supabase, user } = await getAuthUser();
  await supabase
    .from('profiles')
    .update({ notification_preferences: prefs, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);
  revalidatePath('/dashboard/settings');
}

export async function getNotifications(limit = 20) {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function markNotificationRead(id: string) {
  const { supabase, user } = await getAuthUser();
  await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
  revalidatePath('/');
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await getAuthUser();
  await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  revalidatePath('/');
}

export async function deleteNotification(id: string) {
  const { supabase, user } = await getAuthUser();
  await supabase.from('notifications').delete().eq('id', id).eq('user_id', user.id);
}

export async function createNotification(userId: string, data: {
  type: string; title: string; body?: string; link?: string;
}) {
  const supabase = await createClient();

  // Check user's notification preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('user_id', userId)
    .single();

  const prefs = (profile?.notification_preferences || {}) as Record<string, boolean>;

  // Map notification type to preference key
  const prefKeyMap: Record<string, string> = {
    'APPLICATION_UPDATE': 'application_updates',
    'NEW_MESSAGE': 'new_messages',
    'INTERVIEW_SCHEDULED': 'interview_scheduled',
    'INTERVIEW_UPDATED': 'interview_scheduled',
    'INTERVIEW_CANCELLED': 'interview_scheduled',
  };

  const preferenceKey = prefKeyMap[data.type];
  // If a preference for this type exists and is set to false, do not send notification.
  // Default to sending if no specific preference is set.
  if (preferenceKey && prefs[preferenceKey] === false) {
    return; // User has opted out of this notification type
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    type: data.type,
    title: data.title,
    body: data.body || null,
    link: data.link || null,
  });
}

// ── Interviews ────────────────────────────────────────────────

export async function getInterviews() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('interviews')
    .select('*, jobs(title, companies(name, logo_url)), applications(cover_letter, match_score)')
    .eq('candidate_id', user.id)
    .order('scheduled_at', { ascending: true });
  return data || [];
}

export async function getEmployerInterviews() {
  const { supabase, user } = await getAuthUser();
  const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
  if (!company) return [];

  const { data: jobs } = await supabase.from('jobs').select('id').eq('company_id', company.id);
  const jobIds = (jobs || []).map((j: any) => j.id);
  if (!jobIds.length) return [];

  const { data } = await supabase
    .from('interviews')
    .select('*, jobs(title), profiles!candidate_id(full_name, avatar_url, headline)')
    .in('job_id', jobIds)
    .order('scheduled_at', { ascending: true });
  return data || [];
}

export async function scheduleInterview(data: {
  applicationId: string; jobId: string; candidateId: string;
  scheduledAt: string; duration?: number; type?: string;
  meetingLink?: string; location?: string; notes?: string;
}) {
  const { supabase } = await getAuthUser();
  const { data: interview, error } = await supabase
    .from('interviews')
    .insert({
      application_id: data.applicationId,
      job_id: data.jobId,
      candidate_id: data.candidateId,
      scheduled_at: data.scheduledAt,
      duration: data.duration || 60,
      type: data.type || 'VIDEO',
      status: 'SCHEDULED',
      meeting_link: data.meetingLink || null,
      location: data.location || null,
      notes: data.notes || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Notify candidate
  await createNotification(data.candidateId, {
    type: 'INTERVIEW_SCHEDULED',
    title: 'Interview Scheduled',
    body: `Your interview has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
    link: '/dashboard/candidate',
  });

  revalidatePath('/dashboard/employer/applications');
  return interview;
}

export async function updateInterview(id: string, updates: {
  scheduledAt?: string; status?: string; meetingLink?: string;
  notes?: string; feedback?: string;
}) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase
    .from('interviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/employer/applications');
  return data;
}

// ── Activity Feed ─────────────────────────────────────────────

export async function getActivityFeed(limit = 20) {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function logActivity(action: string, entity?: string, entityId?: string, metadata?: Record<string, unknown>) {
  const { supabase, user } = await getAuthUser();
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action,
    entity: entity || null,
    entity_id: entityId || null,
    metadata: metadata || null,
  });
}

// ── Messages ──────────────────────────────────────────────────

export async function getConversations() {
  const { supabase, user } = await getAuthUser();
  const { data } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations(*, messages(body, created_at, sender_id))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getMessages(conversationId: string) {
  const { supabase } = await getAuthUser();
  const { data } = await supabase
    .from('messages')
    .select('*, users!sender_id(email)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return data || [];
}

export async function sendMessage(
  conversationId: string,
  body: string,
  attachmentUrl?: string,
  attachmentType?: string,
  attachmentName?: string
) {
  const { supabase, user } = await getAuthUser();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
      attachment_name: attachmentName || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

export async function markMessagesRead(conversationId: string) {
  const { supabase, user } = await getAuthUser();
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);
}

export async function getConversationParticipants(conversationId: string) {
  const { supabase } = await getAuthUser();
  const { data } = await supabase
    .from('conversation_participants')
    .select('user_id, last_read_at, profiles!user_id(full_name, avatar_url, headline)')
    .eq('conversation_id', conversationId);
  return data || [];
}

export async function startConversation(otherUserId: string) {
  const { supabase, user } = await getAuthUser();

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (existing?.length) {
    const myConvIds = existing.map((p: any) => p.conversation_id);
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', myConvIds);
    if (shared?.length) return shared[0].conversation_id;
  }

  const { data: conv } = await supabase.from('conversations').insert({}).select().single();
  if (!conv) throw new Error('Failed to create conversation');

  await supabase.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);

  return conv.id;
}
