-- ============================================================
-- HireHub AI — Migration 004: Least-Privilege RLS Policies
-- ============================================================

-- ============================================================
-- 1. NOTIFICATIONS RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "notifications_own" ON notifications;
DROP POLICY IF EXISTS "notifications_service_insert" ON notifications;

-- Read own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Mark own notifications as read or delete
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Allow server actions/service role to insert notifications
CREATE POLICY "notifications_service_insert" ON notifications
  FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- 2. MESSAGES RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "messages_participants" ON messages;

-- Read messages in conversation if participant
CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id::text = auth.uid()::text
    )
  );

-- Send messages to conversation if participant
CREATE POLICY "messages_insert_sender" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender_id::text
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.user_id::text = auth.uid()::text
    )
  );

-- No direct client update/delete of chat messages for audit integrity


-- ============================================================
-- 3. INTERVIEWS RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "interviews_candidate" ON interviews;
DROP POLICY IF EXISTS "interviews_employer" ON interviews;

-- Candidates can view their own scheduled interviews
CREATE POLICY "interviews_select_candidate" ON interviews
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = candidate_id::text);

-- Employers can manage interviews for their jobs
CREATE POLICY "interviews_employer_manage" ON interviews
  FOR ALL
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  );


-- ============================================================
-- 4. APPLICATIONS RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "applications_candidate_own" ON applications;
DROP POLICY IF EXISTS "applications_employer_read" ON applications;
DROP POLICY IF EXISTS "applications_employer_update" ON applications;

-- Candidates: SELECT and INSERT own applications
CREATE POLICY "applications_candidate_select" ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = candidate_id::text);

CREATE POLICY "applications_candidate_insert" ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = candidate_id::text);

-- Employers: SELECT applications for their jobs
CREATE POLICY "applications_employer_select" ON applications
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  );

-- Employers: UPDATE application status/notes
CREATE POLICY "applications_employer_update" ON applications
  FOR UPDATE
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.owner_id::text = auth.uid()::text
    )
  );


-- ============================================================
-- 5. ACTIVITY LOGS RLS POLICIES (IMMUTABLE AUDIT)
-- ============================================================
DROP POLICY IF EXISTS "activity_logs_own" ON activity_logs;

-- Read own logs
CREATE POLICY "activity_logs_select_own" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Write logs (immutable, no update/delete allowed)
CREATE POLICY "activity_logs_insert_own" ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);
