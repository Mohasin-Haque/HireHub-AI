-- ============================================================
-- HireHub AI — Migration 003: Schema Fixes & Enhancements
-- ============================================================

-- 1. Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Add notification_preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';

-- 3. Add application_status_history table (referenced in employer actions)
CREATE TABLE IF NOT EXISTS application_status_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status         "ApplicationStatus" NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_history_employer" ON application_status_history
  FOR ALL USING (
    application_id IN (
      SELECT a.id FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "app_history_candidate" ON application_status_history
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE candidate_id::text = auth.uid()::text
    )
  );

-- 4. Add updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Add missing foreign key constraints
ALTER TABLE applications
  ADD CONSTRAINT IF NOT EXISTS fk_applications_candidate
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bookmarks
  ADD CONSTRAINT IF NOT EXISTS fk_bookmarks_candidate
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE interviews
  ADD CONSTRAINT IF NOT EXISTS fk_interviews_candidate
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE company_reviews
  ADD CONSTRAINT IF NOT EXISTS fk_reviews_reviewer
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE company_followers
  ADD CONSTRAINT IF NOT EXISTS fk_followers_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE saved_searches
  ADD CONSTRAINT IF NOT EXISTS fk_saved_searches_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversation_participants
  ADD CONSTRAINT IF NOT EXISTS fk_conv_participants_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages
  ADD CONSTRAINT IF NOT EXISTS fk_messages_sender
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Seed default feature flags
INSERT INTO feature_flags (key, enabled, metadata) VALUES
  ('ai_cover_letter', true, '{"description": "Enable AI cover letter generation"}'),
  ('ai_ats_score', true, '{"description": "Enable ATS score calculation"}'),
  ('resume_parser', true, '{"description": "Enable AI resume parsing"}'),
  ('company_reviews', true, '{"description": "Enable company reviews"}'),
  ('saved_searches', true, '{"description": "Enable saved job searches"}'),
  ('messaging', true, '{"description": "Enable in-app messaging"}')
ON CONFLICT (key) DO NOTHING;

-- 7. Add company_reviews RLS policies
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "reviews_public_read" ON company_reviews
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "reviews_own_insert" ON company_reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);

CREATE POLICY IF NOT EXISTS "reviews_own_delete" ON company_reviews
  FOR DELETE USING (auth.uid()::text = reviewer_id::text);

-- 8. Add company_followers RLS policies
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "followers_public_read" ON company_followers
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "followers_own" ON company_followers
  FOR ALL
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- 9. Enable realtime for application_status_history
ALTER PUBLICATION supabase_realtime ADD TABLE application_status_history;

-- 10. Add chat-attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-attachments', 'chat-attachments', false, 10485760)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "chat_attachments_participants" ON storage.objects;
CREATE POLICY "chat_attachments_participants" ON storage.objects
  FOR ALL USING (
    bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL
  );
