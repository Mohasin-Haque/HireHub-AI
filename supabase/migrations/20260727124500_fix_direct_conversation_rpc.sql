-- A row policy cannot inspect conversation_participants while authorizing an
-- INSERT into that same table: PostgreSQL detects that as recursive. Keep all
-- direct table writes denied and expose one tightly-scoped, atomic operation.
DROP POLICY IF EXISTS "conversations_authenticated_insert" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_create_direct" ON conversation_participants;

CREATE OR REPLACE FUNCTION public.start_direct_conversation(recipient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  creator_id uuid := auth.uid();
  direct_conversation_id uuid;
BEGIN
  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  IF recipient_id IS NULL OR recipient_id = creator_id THEN
    RAISE EXCEPTION 'A different recipient is required' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = recipient_id) THEN
    RAISE EXCEPTION 'Recipient not found' USING ERRCODE = '23503';
  END IF;

  SELECT mine.conversation_id
    INTO direct_conversation_id
  FROM public.conversation_participants AS mine
  JOIN public.conversation_participants AS theirs
    ON theirs.conversation_id = mine.conversation_id
   AND theirs.user_id = recipient_id
  WHERE mine.user_id = creator_id
    AND 2 = (
      SELECT count(*)
      FROM public.conversation_participants AS members
      WHERE members.conversation_id = mine.conversation_id
    )
  LIMIT 1;

  IF direct_conversation_id IS NOT NULL THEN
    RETURN direct_conversation_id;
  END IF;

  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO direct_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES
    (direct_conversation_id, creator_id),
    (direct_conversation_id, recipient_id);

  RETURN direct_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM service_role;
GRANT EXECUTE ON FUNCTION public.start_direct_conversation(uuid) TO authenticated;
