REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.start_direct_conversation(uuid) FROM service_role;
GRANT EXECUTE ON FUNCTION public.start_direct_conversation(uuid) TO authenticated;
