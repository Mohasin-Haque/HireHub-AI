-- ============================================================
-- HireHub AI — Migration 005: Test Accounts & Seed Data
-- ============================================================
-- Run this in Supabase SQL Editor AFTER migrations 001–004.
--
-- Test Credentials:
--   CANDIDATE : candidate@hirehub.test / Test@1234
--   EMPLOYER  : employer@hirehub.test  / Test@1234
--   ADMIN     : admin@hirehub.test     / Test@1234
--
-- These are created via Supabase Auth Admin API.
-- Since we cannot call auth.admin from SQL directly, this
-- migration seeds the public.users + profiles tables assuming
-- the auth users already exist (created via the app or Supabase
-- Dashboard → Authentication → Users → "Add user").
--
-- STEP 1: Create the three users in Supabase Dashboard:
--   Authentication → Users → Add user (confirm email immediately)
--   candidate@hirehub.test  password: Test@1234
--   employer@hirehub.test   password: Test@1234
--   admin@hirehub.test      password: Test@1234
--
-- STEP 2: Run this SQL to set roles and seed profile data.
-- ============================================================

-- ── Helper: get auth user id by email ────────────────────────
-- Update roles in public.users (the trigger may have set them to CANDIDATE)
UPDATE public.users
SET role = 'CANDIDATE'
WHERE email = 'candidate@hirehub.test';

UPDATE public.users
SET role = 'EMPLOYER'
WHERE email = 'employer@hirehub.test';

UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'admin@hirehub.test';

-- ── Seed candidate profile ────────────────────────────────────
INSERT INTO public.profiles (
  user_id, full_name, headline, bio, location,
  skills, github_url, linkedin_url, experience_yrs,
  profile_completion, ats_score
)
SELECT
  u.id,
  'Alex Morgan',
  'Senior Full-Stack Engineer · React · TypeScript · AI',
  'Passionate engineer with 6 years building scalable SaaS products. Love working at the intersection of great UX and robust backend systems.',
  'San Francisco, CA',
  ARRAY['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Supabase', 'OpenAI API'],
  'https://github.com/alexmorgan-dev',
  'https://linkedin.com/in/alexmorgan-dev',
  6,
  88,
  82
FROM public.users u
WHERE u.email = 'candidate@hirehub.test'
ON CONFLICT (user_id) DO UPDATE SET
  full_name          = EXCLUDED.full_name,
  headline           = EXCLUDED.headline,
  bio                = EXCLUDED.bio,
  location           = EXCLUDED.location,
  skills             = EXCLUDED.skills,
  github_url         = EXCLUDED.github_url,
  linkedin_url       = EXCLUDED.linkedin_url,
  experience_yrs     = EXCLUDED.experience_yrs,
  profile_completion = EXCLUDED.profile_completion,
  ats_score          = EXCLUDED.ats_score;

-- ── Seed work experience for candidate ───────────────────────
INSERT INTO public.work_experiences (profile_id, company, title, location, start_date, end_date, current, description)
SELECT
  p.id,
  'Vercel',
  'Senior Full-Stack Engineer',
  'Remote',
  '2022-01-01',
  NULL,
  TRUE,
  'Led development of Next.js 15 App Router migration. Built real-time collaboration features using Supabase Realtime and WebSockets.'
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email = 'candidate@hirehub.test'
ON CONFLICT DO NOTHING;

INSERT INTO public.work_experiences (profile_id, company, title, location, start_date, end_date, current, description)
SELECT
  p.id,
  'Stripe',
  'Software Engineer',
  'San Francisco, CA',
  '2020-06-01',
  '2021-12-31',
  FALSE,
  'Built payment dashboard components in React. Improved API response times by 40% through query optimization.'
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email = 'candidate@hirehub.test'
ON CONFLICT DO NOTHING;

-- ── Seed education for candidate ─────────────────────────────
INSERT INTO public.educations (profile_id, institution, degree, field, start_year, end_year, current)
SELECT
  p.id,
  'University of California, Berkeley',
  'B.S.',
  'Computer Science',
  2016,
  2020,
  FALSE
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE u.email = 'candidate@hirehub.test'
ON CONFLICT DO NOTHING;

-- ── Seed employer company ─────────────────────────────────────
INSERT INTO public.companies (
  owner_id, name, website, description, industry, location,
  size, benefits, tech_stack, hiring_status, social_links
)
SELECT
  u.id,
  'TechCorp AI',
  'https://techcorp-ai.example.com',
  'TechCorp AI is a high-growth SaaS company building the next generation of AI-powered developer tools. We are a remote-first team of 80+ engineers passionate about great software.',
  'AI / Developer Tools',
  'San Francisco, CA (Remote-first)',
  '51-200 employees',
  ARRAY['Competitive salary + equity', 'Remote-first culture', 'Health, dental & vision', '$3,000 annual learning budget', 'Unlimited PTO'],
  ARRAY['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'OpenAI API', 'Vercel', 'Tailwind CSS', 'Go'],
  TRUE,
  '{"linkedin": "https://linkedin.com/company/techcorp-ai", "twitter": "https://twitter.com/techcorpai", "github": "https://github.com/techcorp-ai"}'::jsonb
FROM public.users u
WHERE u.email = 'employer@hirehub.test'
ON CONFLICT (owner_id) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  industry       = EXCLUDED.industry,
  benefits       = EXCLUDED.benefits,
  tech_stack     = EXCLUDED.tech_stack,
  hiring_status  = EXCLUDED.hiring_status;

-- ── Seed sample job postings ──────────────────────────────────
INSERT INTO public.jobs (
  company_id, title, description, responsibilities, requirements, benefits,
  location, workplace_type, job_type, salary_min, salary_max, salary_currency,
  experience_level, tags, status
)
SELECT
  c.id,
  'Senior Full-Stack Engineer (Next.js + AI)',
  'We are looking for a Senior Full-Stack Engineer to join our core product team. You will architect and build features that power our AI-assisted developer tools used by 50,000+ engineers worldwide.',
  E'• Lead architecture decisions for our Next.js 15 App Router platform\n• Build real-time AI features using OpenAI API and Supabase Realtime\n• Mentor junior engineers and conduct code reviews\n• Collaborate with product and design on feature specifications',
  E'• 5+ years experience with React, TypeScript, and Node.js\n• Strong understanding of PostgreSQL and REST APIs\n• Experience with AI/LLM integrations (OpenAI, Anthropic)\n• Excellent communication and collaboration skills',
  E'• $180,000–$240,000 base + equity\n• Remote-first with optional SF office\n• Full healthcare, dental, vision\n• $3,000 annual learning budget',
  'Remote (US)',
  'REMOTE',
  'FULL_TIME',
  180000,
  240000,
  'USD',
  'SENIOR',
  ARRAY['Next.js', 'TypeScript', 'React', 'Node.js', 'OpenAI API', 'Supabase'],
  'ACTIVE'
FROM public.companies c
JOIN public.users u ON c.owner_id = u.id
WHERE u.email = 'employer@hirehub.test'
ON CONFLICT DO NOTHING;

INSERT INTO public.jobs (
  company_id, title, description, responsibilities, requirements, benefits,
  location, workplace_type, job_type, salary_min, salary_max, salary_currency,
  experience_level, tags, status
)
SELECT
  c.id,
  'AI/ML Engineer',
  'Join our AI team to build and fine-tune the models that power our intelligent code suggestions, resume matching, and candidate scoring systems.',
  E'• Design and implement ML pipelines for candidate-job matching\n• Fine-tune LLMs for domain-specific tasks\n• Build evaluation frameworks for AI model quality\n• Collaborate with product engineers on AI feature integration',
  E'• 3+ years experience in Python and ML frameworks (PyTorch, scikit-learn)\n• Experience with LLM fine-tuning and prompt engineering\n• Familiarity with vector databases (Pinecone, pgvector)\n• Strong mathematical foundations in statistics and linear algebra',
  E'• $160,000–$210,000 base + equity\n• Remote-first\n• Full benefits package\n• GPU compute budget for experiments',
  'Remote (Worldwide)',
  'REMOTE',
  'FULL_TIME',
  160000,
  210000,
  'USD',
  'MID',
  ARRAY['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'PostgreSQL', 'FastAPI'],
  'ACTIVE'
FROM public.companies c
JOIN public.users u ON c.owner_id = u.id
WHERE u.email = 'employer@hirehub.test'
ON CONFLICT DO NOTHING;

INSERT INTO public.jobs (
  company_id, title, description, responsibilities, requirements, benefits,
  location, workplace_type, job_type, salary_min, salary_max, salary_currency,
  experience_level, tags, status
)
SELECT
  c.id,
  'Frontend Engineer (React + Tailwind)',
  'We are hiring a Frontend Engineer to craft beautiful, accessible, and performant UI components for our developer-facing product suite.',
  E'• Build and maintain our component library in React + Tailwind CSS\n• Implement pixel-perfect designs from Figma\n• Optimize Core Web Vitals and accessibility (WCAG 2.1)\n• Write unit and integration tests with Vitest and Testing Library',
  E'• 2+ years experience with React and TypeScript\n• Strong CSS skills and experience with Tailwind CSS\n• Eye for design and attention to detail\n• Experience with Framer Motion or similar animation libraries',
  E'• $120,000–$160,000 base + equity\n• Remote-first\n• Full benefits\n• $2,000 home office setup budget',
  'Remote (US/EU)',
  'REMOTE',
  'FULL_TIME',
  120000,
  160000,
  'USD',
  'MID',
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vitest'],
  'DRAFT'
FROM public.companies c
JOIN public.users u ON c.owner_id = u.id
WHERE u.email = 'employer@hirehub.test'
ON CONFLICT DO NOTHING;

-- ── Seed feature flags (if not already seeded) ────────────────
INSERT INTO public.feature_flags (key, enabled) VALUES
  ('ai_cover_letter', true),
  ('ai_ats_score', true),
  ('resume_parser', true),
  ('company_reviews', true),
  ('saved_searches', true),
  ('messaging', true)
ON CONFLICT (key) DO NOTHING;

-- ── Summary ───────────────────────────────────────────────────
-- After running this migration:
--
-- CANDIDATE LOGIN:
--   Email    : candidate@hirehub.test
--   Password : Test@1234
--   Profile  : Alex Morgan, Senior Full-Stack Engineer
--   Skills   : React, TypeScript, Next.js, Node.js, etc.
--
-- EMPLOYER LOGIN:
--   Email    : employer@hirehub.test
--   Password : Test@1234
--   Company  : TechCorp AI
--   Jobs     : 2 ACTIVE + 1 DRAFT
--
-- ADMIN LOGIN:
--   Email    : admin@hirehub.test
--   Password : Test@1234
--   Access   : Full admin panel
-- ============================================================
