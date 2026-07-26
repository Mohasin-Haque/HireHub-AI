# 🚀 HireHub AI — Next-Gen AI-Powered Job Board & Hiring Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**HireHub AI** is a production-grade, full-stack AI-assisted job discovery and candidate recruitment platform. Built with a modern SaaS aesthetic (Linear / Stripe / Vercel style), it automates job description creation, candidate match scoring, title optimization, and interview preparation using an OpenAI-compatible modular AI engine with a smart local fallback.

---

## 🌟 Features

### 🏢 Employer Portal
- **AI Job Description Generator** — Generate structured job specs with responsibilities, qualifications, and benefits in seconds via `AIGeneratorModal`
- **AI Title Improver & Skill Suggester** — Optimize job titles to boost qualified applicant click-through rates
- **Recruiter Analytics Dashboard** — Live metrics: Active Jobs, Applicant Pipelines, Impressions, Weekly Trend charts
- **Full Job CRUD** — Create, edit, publish, close, duplicate, or delete job postings with real-time state updates
- **Applications Pipeline** — Review applicant cover letters, resumes, AI match scores; update status (`PENDING` → `REVIEWING` → `SHORTLISTED` → `INTERVIEWING` → `ACCEPTED` → `REJECTED`); export CSV
- **Interview Scheduling** — Schedule, reschedule, and cancel interviews via `ScheduleInterviewModal`; meeting links, duration, type
- **Company Profile** — Logo upload, description, industry, tech stack, benefits, social links
- **AI History Panel** — View and regenerate past AI generations per action type

### 👨‍💻 Candidate Portal
- **AI-Powered Job Discovery** — Full-text search with multi-faceted filtering: Location, Workplace model, Employment type, Seniority level, Minimum salary slider
- **Recently Viewed Jobs** — Automatically tracked and displayed on the candidate dashboard
- **AI Interview Prep** — Generate role-specific technical, architectural, and behavioral interview questions with evaluation criteria
- **AI Cover Letter Generator** — One-click AI-generated cover letters tailored to the job description
- **ATS Score Analyzer** — AI-powered resume-to-job match scoring with improvement suggestions
- **One-Click Apply & Bookmarks** — Save positions and submit applications with pre-calculated match alignment
- **Profile & Resume Builder** — Skills taxonomy, bio, GitHub/LinkedIn links, portfolio links (add/remove), avatar upload
- **Resume Versions** — Upload multiple resume versions, set active version, track history
- **Work Experience & Education** — Full CRUD for work history and education entries
- **Interview Tracker** — View scheduled interviews, reschedule or cancel with modal
- **Saved Searches** — Save and reapply job search filters
- **Application Tracker** — Track all applications with status timeline

### 🛡️ Admin Panel
- **Overview Dashboard** — Platform-wide stats: total users, companies, jobs, AI generations; breakdown by role, job status, application status
- **User Management** — Search users, view profiles, change roles (CANDIDATE / EMPLOYER / ADMIN)
- **Job Moderation** — View all jobs, activate or close any posting
- **Company Moderation** — View all registered companies with industry and hiring status
- **Review Moderation** — View all company reviews with ratings
- **Platform Analytics** — 6-month growth line chart (users, jobs, companies) + AI usage breakdown by action type
- **Feature Flags** — Toggle platform features live without redeployment
- **Audit Logs** — Immutable activity log of all platform actions

### 💬 Messaging
- **Real-time Conversations** — Supabase Realtime-powered chat between candidates and employers
- **Typing Indicators & Online Badges** — Live presence indicators
- **Attachment Support** — File and image attachments in messages

### 🔔 Notifications
- **Real-time Notification Center** — In-app notifications for application updates, interview scheduling, messages, and system events
- **Mark as Read / Delete** — Full notification management

### 🎨 UI & Design
- **Dark Mode & Light Mode** — Seamless theme switching with custom color tokens via `next-themes`
- **Glassmorphic Aesthetics** — Floating glass cards, micro-animations (Framer Motion), responsive across Mobile, Tablet, Desktop
- **Form Validation** — Zod + React Hook Form with rich Sonner toast notifications
- **Skeleton Loading States** — All data-loading states show skeleton placeholders

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript 5.7 (Strict Mode) |
| **Styling** | Tailwind CSS, Framer Motion, Lucide Icons, Glassmorphism |
| **Database** | Supabase PostgreSQL |
| **ORM / Schema** | Prisma Schema (reference) + Supabase client |
| **Authentication** | Supabase Auth (RBAC: `EMPLOYER` \| `CANDIDATE` \| `ADMIN`) |
| **Validation** | Zod + React Hook Form |
| **AI Integration** | OpenAI API with smart local fallback engine |
| **Real-time** | Supabase Realtime (messages, notifications) |
| **File Storage** | Supabase Storage (avatars, resumes, company logos) |
| **Testing** | Vitest + React Testing Library (98 tests) |
| **CI/CD** | GitHub Actions (lint → test → build → deploy) |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
HireHubAI/
├── .github/workflows/ci-cd.yml       # Lint, test, build & deploy pipeline
├── app/
│   ├── (auth)/                        # login, signup, reset-password, update-password
│   ├── api/                           # REST API route handlers
│   │   ├── ai/                        # generate-description, improve-title, cover-letter, ats-score
│   │   ├── jobs/                      # Jobs CRUD
│   │   ├── applications/              # Application management
│   │   ├── interviews/                # Interview scheduling
│   │   ├── bookmarks/                 # Saved jobs
│   │   ├── notifications/             # Notification management
│   │   ├── resume/                    # Resume parsing
│   │   └── search/                    # Autocomplete search
│   ├── dashboard/
│   │   ├── admin/                     # Admin panel (users, jobs, analytics, flags)
│   │   ├── candidate/                 # Hub, saved, applications, interviews, profile
│   │   ├── employer/                  # Dashboard, jobs, applications pipeline, interviews
│   │   ├── messages/                  # Real-time messaging
│   │   └── settings/                  # Account settings
│   ├── jobs/                          # Public job board & detail view
│   ├── companies/[id]/                # Public company profile pages
│   └── page.tsx                       # Landing page
├── components/
│   ├── ai/                            # AIGeneratorModal, AIHistoryPanel, CoverLetterModal
│   ├── analytics/                     # HiringCharts, GrowthLineChart
│   ├── chat/                          # ConversationList, MessageBubble, MessageComposer
│   ├── dashboard/                     # ActivityFeed, ATSScore, InterviewTimeline, ResumeUpload
│   ├── interviews/                    # ScheduleInterviewModal
│   ├── jobs/                          # JobCard, JobFilters, ApplyModal, JobDetailClient
│   ├── landing/                       # Hero, Stats, Features, Testimonials, CTA
│   ├── layout/                        # Navbar, Footer, ThemeProvider
│   ├── notifications/                 # NotificationCenter
│   └── ui/                            # Button, Card, Input, Badge, Dialog, Tabs, Skeleton
├── lib/
│   ├── actions/                       # Server Actions (admin, ai, analytics, candidate, employer...)
│   ├── ai/ai-service.ts               # AIService abstraction + local fallback engine
│   ├── supabase/                      # Browser & server Supabase clients
│   ├── validations/                   # Zod schemas (login, signup, job, profile)
│   ├── auth-context.tsx               # Auth provider with DB role resolution & self-heal
│   └── utils.ts                       # Formatting helpers, cn utility
├── supabase/migrations/               # 007 versioned SQL migrations
├── tests/                             # 98 Vitest unit tests
├── prisma/schema.prisma               # PostgreSQL schema reference
└── middleware.ts                      # RBAC route protection
```

---

## 🗄️ Database Schema

Key tables: `users`, `profiles`, `companies`, `jobs`, `applications`, `interviews`, `bookmarks`, `notifications`, `messages`, `conversations`, `ai_history`, `activity_logs`, `resume_versions`, `work_experiences`, `educations`, `saved_searches`, `feature_flags`

Full schema in `supabase/migrations/001_initial_schema.sql`. RLS policies across all 7 migrations enforce least-privilege access per role.

---

## ⚡ Quick Start

### 1. Clone & install
```bash
git clone https://github.com/your-username/HireHubAI.git
cd HireHubAI
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key   # optional — local AI fallback works without it
```

### 3. Database setup
Run migrations in order in **Supabase SQL Editor**:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_fix_rls_and_auth_sync.sql
supabase/migrations/003_schema_fixes.sql
supabase/migrations/004_secure_rls_policies.sql
supabase/migrations/005_test_accounts.sql
supabase/migrations/006_fix_profile_upsert_and_storage_rls.sql
supabase/migrations/007_fix_user_roles.sql
```

### 4. Create test users in Supabase Dashboard
Go to **Authentication → Users → Add user** (auto-confirm email) and create:

| Email | Password | Role |
|---|---|---|
| `candidate@hirehub.test` | `Test@1234` | CANDIDATE |
| `employer@hirehub.test` | `Test@1234` | EMPLOYER |
| `admin@hirehub.test` | `Test@1234` | ADMIN |

Then run `005_test_accounts.sql` and `007_fix_user_roles.sql` to seed profile data and set roles.

### 5. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

```bash
npm run test
```

98 unit tests covering:
- `AIService` methods (description, title, skills, interview questions, cover letter, ATS score)
- Zod validation schemas (login, signup, job post, profile)
- Server action logic (jobs, applications, notifications, interviews)
- Utility functions

---

## 🔄 CI/CD

GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push:
1. Install dependencies
2. ESLint check
3. Vitest test suite
4. Production build
5. Auto-deploy to Vercel

---

## 🔐 Security

- **RBAC via Supabase RLS** — Every table has row-level security policies. Candidates can only access their own data; employers only see their company's jobs and applications; admins have elevated read access.
- **Role from DB only** — `auth-context.tsx` always fetches role from `public.users`, never trusts `user_metadata`
- **Storage policies** — Separate RLS on `storage.objects` per bucket (resumes, avatars, company-logos)
- **Server Actions** — All mutations go through authenticated server actions, never exposed as public API endpoints

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.
