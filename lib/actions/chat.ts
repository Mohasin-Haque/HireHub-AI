'use server';

import { createClient } from '@/lib/supabase/server';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function uploadChatAttachment(formData: FormData, conversationId: string) {
  const { supabase, user } = await getAuthUser();
  const file = formData.get('attachment') as File;
  if (!file) throw new Error('No file provided');

  // Basic validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) throw new Error('File size must be under 10MB');

  const ext = file.name.split('.').pop();
  const path = `${conversationId}/${user.id}-${Date.now()}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('chat-attachments')
    .getPublicUrl(uploadData.path);

  return {
    url: publicUrl,
    type: file.type,
    name: file.name,
    size: file.size,
  };
}
