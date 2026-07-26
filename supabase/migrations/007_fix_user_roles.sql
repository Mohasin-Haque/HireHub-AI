-- ============================================================
-- HireHub AI — Migration 007: Diagnose & Fix User Roles
-- ============================================================
-- Run this in Supabase SQL Editor to diagnose and fix the
-- employer/admin role issue.
-- ============================================================

-- ── STEP 1: See what's actually in public.users ───────────────
SELECT
  u.id,
  u.email,
  u.role,
  au.raw_user_meta_data->>'role' AS meta_role
FROM public.users u
JOIN auth.users au ON au.id = u.id
ORDER BY u.created_at;

-- ── STEP 2: Ensure INSERT policy exists on users table ────────
-- Needed so auth-context.tsx can self-heal missing rows client-side
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- ── STEP 3: Backfill any auth users missing from public.users ─
-- Handles the case where the trigger didn't fire for manually
-- created users in the Supabase Dashboard.
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

-- ── STEP 4: Force-set correct roles for test accounts ─────────
UPDATE public.users SET role = 'CANDIDATE', updated_at = NOW()
WHERE email = 'candidate@hirehub.test';

UPDATE public.users SET role = 'EMPLOYER', updated_at = NOW()
WHERE email = 'employer@hirehub.test';

UPDATE public.users SET role = 'ADMIN', updated_at = NOW()
WHERE email = 'admin@hirehub.test';

-- ── STEP 5: Verify ────────────────────────────────────────────
SELECT id, email, role FROM public.users
WHERE email IN ('candidate@hirehub.test', 'employer@hirehub.test', 'admin@hirehub.test');
