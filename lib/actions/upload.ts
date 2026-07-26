'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function uploadResume(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  const file = formData.get('resume') as File;
  if (!file) throw new Error('No file provided');

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) throw new Error('File size must be under 5MB');

  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) throw new Error('Only PDF and Word documents are allowed');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data: signedData, error: signedError } = await supabase.storage
    .from('resumes')
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);
  if (signedError) throw new Error(signedError.message);
  const fileUrl = signedData.signedUrl;

  // Get or create profile
  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) throw new Error('Profile not found. Please create your profile first.');

  // Deactivate previous active versions
  await supabase.from('resume_versions').update({ is_active: false }).eq('profile_id', profile.id);

  // Insert new version
  const { data: version, error: versionError } = await supabase
    .from('resume_versions')
    .insert({
      profile_id: profile.id,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      is_active: true,
    })
    .select()
    .single();

  if (versionError) throw new Error(versionError.message);

  // Update profile resume_url
  await supabase.from('profiles').update({
    resume_url: fileUrl,
    resume_file_name: file.name,
    updated_at: new Date().toISOString(),
  }).eq('user_id', user.id);

  revalidatePath('/dashboard/candidate/profile');
  return version;
}

export async function uploadAvatar(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  const file = formData.get('avatar') as File;
  if (!file) throw new Error('No file provided');

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) throw new Error('Only image files are allowed');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/avatar.${ext}`;

  const { data: uploadData, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: signedData, error: signedError } = await supabase.storage
    .from('avatars')
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);
  if (signedError) throw new Error(signedError.message);
  const avatarUrl = signedData.signedUrl;

  await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id);
  await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });

  revalidatePath('/dashboard/candidate/profile');
  return avatarUrl;
}

export async function uploadCompanyLogo(formData: FormData) {
  const { supabase, user } = await getAuthUser();
  const file = formData.get('logo') as File;
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop();
  const path = `${user.id}/logo.${ext}`;

  const { data: uploadData, error } = await supabase.storage
    .from('company-logos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: signedData, error: signedError } = await supabase.storage
    .from('company-logos')
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);
  if (signedError) throw new Error(signedError.message);
  const logoUrl = signedData.signedUrl;

  await supabase.from('companies').update({ logo_url: logoUrl }).eq('owner_id', user.id);

  revalidatePath('/dashboard/employer');
  return logoUrl;
}
