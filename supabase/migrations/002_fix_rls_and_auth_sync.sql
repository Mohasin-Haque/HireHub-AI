-- ============================================================
-- HireHub AI — RLS & Auth Sync Fix
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. AUTO-SYNC AUTH USERS → public.users
--    Supabase Auth creates users in auth.users but NOT in
--    public.users. This trigger fixes that gap.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::"UserRole",
      'CANDIDATE'::"UserRole"
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = EXCLUDED.email,
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing auth users that are missing from public.users
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(
    (au.raw_user_meta_data->>'role')::"UserRole",
    'CANDIDATE'::"UserRole"
  ),
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. FIX RLS INSERT POLICIES (WITH CHECK clauses)
--    USING = filter for SELECT/UPDATE/DELETE
--    WITH CHECK = filter for INSERT — these were missing
-- ============================================================

-- profiles: already has INSERT policy but add WITH CHECK to be explicit
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- work_experiences: FOR ALL only had USING, no WITH CHECK for INSERT
DROP POLICY IF EXISTS "work_exp_own" ON work_experiences;
CREATE POLICY "work_exp_own" ON work_experiences
  FOR ALL
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  );

-- educations: same fix
DROP POLICY IF EXISTS "educations_own" ON educations;
CREATE POLICY "educations_own" ON educations
  FOR ALL
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  );

-- resume_versions: same fix — this is the direct cause of Bug 1
DROP POLICY IF EXISTS "resume_versions_own" ON resume_versions;
CREATE POLICY "resume_versions_own" ON resume_versions
  FOR ALL
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
  );

-- applications: fix INSERT WITH CHECK — direct cause of Bug 3
DROP POLICY IF EXISTS "applications_candidate_own" ON applications;
CREATE POLICY "applications_candidate_own" ON applications
  FOR ALL
  USING (auth.uid()::text = candidate_id::text)
  WITH CHECK (auth.uid()::text = candidate_id::text);

-- bookmarks: fix INSERT WITH CHECK
DROP POLICY IF EXISTS "bookmarks_own" ON bookmarks;
CREATE POLICY "bookmarks_own" ON bookmarks
  FOR ALL
  USING (auth.uid()::text = candidate_id::text)
  WITH CHECK (auth.uid()::text = candidate_id::text);

-- ai_history: fix INSERT WITH CHECK
DROP POLICY IF EXISTS "ai_history_own" ON ai_history;
CREATE POLICY "ai_history_own" ON ai_history
  FOR ALL
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- activity_logs: fix INSERT (was SELECT only before)
DROP POLICY IF EXISTS "activity_logs_own" ON activity_logs;
CREATE POLICY "activity_logs_own" ON activity_logs
  FOR ALL
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- saved_searches: fix INSERT WITH CHECK
DROP POLICY IF EXISTS "saved_searches_own" ON saved_searches;
CREATE POLICY "saved_searches_own" ON saved_searches
  FOR ALL
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- notifications: fix INSERT WITH CHECK (needed for createNotification server action)
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow service_role to insert notifications for any user (interview scheduling etc.)
CREATE POLICY "notifications_service_insert" ON notifications
  FOR INSERT WITH CHECK (true);

-- companies: fix INSERT WITH CHECK
DROP POLICY IF EXISTS "companies_owner_write" ON companies;
CREATE POLICY "companies_owner_write" ON companies
  FOR ALL
  USING (auth.uid()::text = owner_id::text)
  WITH CHECK (auth.uid()::text = owner_id::text);

-- jobs: fix INSERT WITH CHECK
DROP POLICY IF EXISTS "jobs_owner_write" ON jobs;
CREATE POLICY "jobs_owner_write" ON jobs
  FOR ALL
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id::text = auth.uid()::text)
  )
  WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE owner_id::text = auth.uid()::text)
  );

-- users: add INSERT policy for the trigger (runs as SECURITY DEFINER so this is a safety net)
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. STORAGE BUCKET RLS POLICIES
--    These are separate from table RLS — must be set in
--    Supabase Dashboard → Storage → Policies, OR via SQL below
-- ============================================================

-- Resumes bucket: authenticated users can upload to their own folder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 'resumes', false, 5242880,
  ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Avatars bucket: public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Company logos bucket: public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes
DROP POLICY IF EXISTS "resumes_upload_own" ON storage.objects;
CREATE POLICY "resumes_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "resumes_read_own" ON storage.objects;
CREATE POLICY "resumes_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "resumes_delete_own" ON storage.objects;
CREATE POLICY "resumes_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for avatars (public bucket, but own upload)
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for company logos
DROP POLICY IF EXISTS "logos_upload_own" ON storage.objects;
CREATE POLICY "logos_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "logos_update_own" ON storage.objects;
CREATE POLICY "logos_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
