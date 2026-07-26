-- ============================================================
-- HireHub AI — Full Database Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('EMPLOYER', 'CANDIDATE', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT', 'SCHEDULED', 'ARCHIVED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkplaceType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'INTERVIEWING', 'ACCEPTED', 'REJECTED', 'SHORTLISTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'PANEL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'INTERVIEW_UPDATED', 'NEW_MESSAGE', 'JOB_ALERT', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AIActionType" AS ENUM ('GENERATE_DESCRIPTION', 'IMPROVE_TITLE', 'SUGGEST_SKILLS', 'COMPANY_SUMMARY', 'INTERVIEW_QUESTIONS', 'RESUME_PARSE', 'RESUME_ANALYZE', 'ATS_SCORE', 'RESUME_MATCH', 'COVER_LETTER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  role        "UserRole" NOT NULL DEFAULT 'CANDIDATE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  avatar_url          TEXT,
  headline            TEXT,
  bio                 TEXT,
  phone               TEXT,
  location            TEXT,
  resume_url          TEXT,
  resume_file_name    TEXT,
  skills              TEXT[] DEFAULT '{}',
  website             TEXT,
  github_url          TEXT,
  linkedin_url        TEXT,
  portfolio_links     TEXT[] DEFAULT '{}',
  experience_yrs      INT DEFAULT 0,
  ats_score           INT,
  profile_completion  INT DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_experiences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  title       TEXT NOT NULL,
  location    TEXT,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ,
  current     BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree      TEXT NOT NULL,
  field       TEXT,
  start_year  INT NOT NULL,
  end_year    INT,
  current     BOOLEAN DEFAULT FALSE,
  gpa         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INT,
  ats_score   INT,
  is_active   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  logo_url       TEXT,
  website        TEXT,
  description    TEXT,
  industry       TEXT,
  location       TEXT,
  size           TEXT DEFAULT '1-10 employees',
  benefits       TEXT[] DEFAULT '{}',
  tech_stack     TEXT[] DEFAULT '{}',
  hiring_status  BOOLEAN DEFAULT TRUE,
  social_links   JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  pros        TEXT,
  cons        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_followers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  responsibilities TEXT,
  requirements     TEXT,
  benefits         TEXT,
  location         TEXT NOT NULL,
  workplace_type   "WorkplaceType" NOT NULL DEFAULT 'REMOTE',
  job_type         "JobType" NOT NULL DEFAULT 'FULL_TIME',
  salary_min       INT,
  salary_max       INT,
  salary_currency  TEXT DEFAULT 'USD',
  experience_level "ExperienceLevel" NOT NULL DEFAULT 'MID',
  tags             TEXT[] DEFAULT '{}',
  status           "JobStatus" NOT NULL DEFAULT 'ACTIVE',
  views_count      INT DEFAULT 0,
  scheduled_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  cover_letter TEXT,
  status       "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  resume_url   TEXT,
  match_score  INT DEFAULT 85,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id         UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id   UUID NOT NULL,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  duration       INT DEFAULT 60,
  type           "InterviewType" NOT NULL DEFAULT 'VIDEO',
  status         "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
  meeting_link   TEXT,
  location       TEXT,
  notes          TEXT,
  feedback       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       "NotificationType" NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  last_read_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL,
  body            TEXT NOT NULL,
  attachment_url  TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action          "AIActionType" NOT NULL,
  input_payload   JSONB NOT NULL,
  output_payload  JSONB,
  model_name      TEXT,
  tokens_used     INT,
  processing_time INT,
  status          TEXT DEFAULT 'success',
  is_favorite     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  UUID,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,
  name       TEXT NOT NULL,
  query      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT UNIQUE NOT NULL,
  enabled    BOOLEAN DEFAULT FALSE,
  metadata   JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users: read own, service role manages
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Profiles: own CRUD
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Work experiences: own CRUD
CREATE POLICY "work_exp_own" ON work_experiences FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
);

-- Educations: own CRUD
CREATE POLICY "educations_own" ON educations FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
);

-- Resume versions: own CRUD
CREATE POLICY "resume_versions_own" ON resume_versions FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id::text = auth.uid()::text)
);

-- Companies: owner CRUD, public read
CREATE POLICY "companies_public_read" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_owner_write" ON companies FOR ALL USING (auth.uid()::text = owner_id::text);

-- Jobs: public read active, owner write
CREATE POLICY "jobs_public_read" ON jobs FOR SELECT USING (status = 'ACTIVE' OR company_id IN (SELECT id FROM companies WHERE owner_id::text = auth.uid()::text));
CREATE POLICY "jobs_owner_write" ON jobs FOR ALL USING (
  company_id IN (SELECT id FROM companies WHERE owner_id::text = auth.uid()::text)
);

-- Applications: candidate own, employer sees for their jobs
CREATE POLICY "applications_candidate_own" ON applications FOR ALL USING (auth.uid()::text = candidate_id::text);
CREATE POLICY "applications_employer_read" ON applications FOR SELECT USING (
  job_id IN (SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE c.owner_id::text = auth.uid()::text)
);
CREATE POLICY "applications_employer_update" ON applications FOR UPDATE USING (
  job_id IN (SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE c.owner_id::text = auth.uid()::text)
);

-- Bookmarks: own
CREATE POLICY "bookmarks_own" ON bookmarks FOR ALL USING (auth.uid()::text = candidate_id::text);

-- Interviews: candidate own, employer for their jobs
CREATE POLICY "interviews_candidate" ON interviews FOR SELECT USING (auth.uid()::text = candidate_id::text);
CREATE POLICY "interviews_employer" ON interviews FOR ALL USING (
  job_id IN (SELECT j.id FROM jobs j JOIN companies c ON j.company_id = c.id WHERE c.owner_id::text = auth.uid()::text)
);

-- Notifications: own
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid()::text = user_id::text);

-- Messages: participants only
CREATE POLICY "messages_participants" ON messages FOR ALL USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id::text = auth.uid()::text
  )
);

-- Conversations: participants
CREATE POLICY "conversations_participants" ON conversations FOR SELECT USING (
  id IN (SELECT conversation_id FROM conversation_participants WHERE user_id::text = auth.uid()::text)
);

-- AI History: own
CREATE POLICY "ai_history_own" ON ai_history FOR ALL USING (auth.uid()::text = user_id::text);

-- Activity logs: own read
CREATE POLICY "activity_logs_own" ON activity_logs FOR SELECT USING (auth.uid()::text = user_id::text);

-- Saved searches: own
CREATE POLICY "saved_searches_own" ON saved_searches FOR ALL USING (auth.uid()::text = user_id::text);

-- ============================================================
-- STORAGE BUCKETS (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true) ON CONFLICT DO NOTHING;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
