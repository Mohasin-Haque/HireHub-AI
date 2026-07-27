-- Bring the remote messages schema in line with the chat attachment payload.
-- Both columns are nullable so existing messages and text-only messages remain
-- unchanged.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_type text,
  ADD COLUMN IF NOT EXISTS attachment_name text;
