-- Allow an authenticated user to create a two-person conversation.
-- The participant policy permits only the creator followed by exactly one recipient.
DROP POLICY IF EXISTS "conversations_authenticated_insert" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_select_own" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_create_direct" ON conversation_participants;

CREATE POLICY "conversations_authenticated_insert" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "conversation_participants_select_own" ON conversation_participants
  FOR SELECT TO authenticated
  USING (user_id::text = (select auth.uid())::text);

CREATE POLICY "conversation_participants_create_direct" ON conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    (
      user_id::text = (select auth.uid())::text
      AND NOT EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
      )
    )
    OR (
      user_id::text <> (select auth.uid())::text
      -- The recipient must be added only after the creator, while they are
      -- still the only participant. This prevents a caller from adding a
      -- third (or later) participant to what is intended to be a direct chat.
      AND 1 = (
        SELECT count(*) FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
      )
      AND 1 = (
        SELECT count(*) FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
          AND cp.user_id::text = (select auth.uid())::text
      )
    )
  );
