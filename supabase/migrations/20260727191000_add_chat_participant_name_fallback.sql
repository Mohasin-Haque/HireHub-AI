CREATE OR REPLACE FUNCTION public.get_direct_conversation_participants(
  p_conversation_id uuid
)
RETURNS TABLE (
  user_id uuid,
  last_read_at timestamptz,
  full_name text,
  avatar_url text,
  headline text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.conversation_participants AS self_participant
    WHERE self_participant.conversation_id = p_conversation_id
      AND self_participant.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a conversation participant' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT cp.user_id,
         cp.last_read_at,
         COALESCE(p.full_name, split_part(u.email, '@', 1)),
         p.avatar_url,
         p.headline
  FROM public.conversation_participants AS cp
  LEFT JOIN public.profiles AS p ON p.user_id = cp.user_id
  JOIN public.users AS u ON u.id = cp.user_id
  WHERE cp.conversation_id = p_conversation_id
  ORDER BY cp.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.get_direct_conversation_participants(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_direct_conversation_participants(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_direct_conversation_participants(uuid) FROM service_role;
GRANT EXECUTE ON FUNCTION public.get_direct_conversation_participants(uuid) TO authenticated;
