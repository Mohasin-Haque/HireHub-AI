export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  description: string;
  industry: string;
  location: string;
  size: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  location: string;
  workplaceType: 'REMOTE' | 'HYBRID' | 'ONSITE';
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  tags: string[];
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  candidateHeadline: string;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';
  resumeUrl: string;
  matchScore: number;
  appliedDate: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  phone: string;
  location: string;
  resumeUrl: string;
  skills: string[];
  website: string;
  githubUrl: string;
  linkedinUrl: string;
  experienceYrs: number;
}

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Vercel',
    logoUrl: 'https://avatar.vercel.sh/vercel?text=V',
    website: 'https://vercel.com',
    description: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the point of inspiration.',
    industry: 'Cloud Infrastructure & Software',
    location: 'San Francisco, CA',
    size: '251-500 employees',
  },
  {
    id: 'comp-2',
    name: 'Stripe',
    logoUrl: 'https://avatar.vercel.sh/stripe?text=S',
    website: 'https://stripe.com',
    description: 'Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments and grow their revenue.',
    industry: 'Fintech & Financial Services',
    location: 'San Francisco, CA & Remote',
    size: '1000+ employees',
  },
  {
    id: 'comp-3',
    name: 'Linear',
    logoUrl: 'https://avatar.vercel.sh/linear?text=L',
    website: 'https://linear.app',
    description: 'Linear is a purpose-built tool for modern software development, stream-lining issues, projects, and product roadmaps.',
    industry: 'Developer Tools & SaaS',
    location: 'San Francisco, CA & Remote',
    size: '51-200 employees',
  },
  {
    id: 'comp-4',
    name: 'OpenAI',
    logoUrl: 'https://avatar.vercel.sh/openai?text=AI',
    website: 'https://openai.com',
    description: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.',
    industry: 'Artificial Intelligence & ML',
    location: 'San Francisco, CA',
    size: '501-1000 employees',
  },
  {
    id: 'comp-5',
    name: 'Supabase',
    logoUrl: 'https://avatar.vercel.sh/supabase?text=SB',
    website: 'https://supabase.com',
    description: 'Supabase is an open source Firebase alternative. Start your project with a Postgres database, Authentication, instant APIs, and Realtime.',
    industry: 'Database & Backend Cloud',
    location: 'Remote Worldwide',
    size: '51-200 employees',
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    companyId: 'comp-1',
    companyName: 'Vercel',
    companyLogo: 'https://avatar.vercel.sh/vercel?text=V',
    companyWebsite: 'https://vercel.com',
    title: 'Senior Full-Stack Engineer (Next.js & Cloud)',
    description: 'We are seeking an exceptional Senior Full-Stack Engineer to lead the design and implementation of serverless infrastructure tools and developer features for Next.js.',
    responsibilities: 'Architect high-throughput edge network functions.\nCollaborate directly with open source Next.js core team.\nOptimize low-latency serverless request routing.',
    requirements: '5+ years experience with React, Next.js App Router, TypeScript, and Node.js.\nDeep understanding of edge runtime, CDN cache invalidated headers, and Web Vitals.\nExperience building developer-facing APIs.',
    benefits: 'Competitive base salary ($180k - $240k) + Equity.\n$3,000 yearly learning & home office budget.\nFlexible unlimited PTO & 100% health, dental, vision coverage.',
    location: 'San Francisco, CA',
    workplaceType: 'REMOTE',
    jobType: 'FULL_TIME',
    salaryMin: 180000,
    salaryMax: 240000,
    salaryCurrency: 'USD',
    experienceLevel: 'SENIOR',
    tags: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Edge Architecture'],
    status: 'ACTIVE',
    viewsCount: 1420,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'job-2',
    companyId: 'comp-2',
    companyName: 'Stripe',
    companyLogo: 'https://avatar.vercel.sh/stripe?text=S',
    companyWebsite: 'https://stripe.com',
    title: 'Staff AI Infrastructure Engineer',
    description: 'Join Stripe\'s Machine Learning and AI Platform team to build next-generation automated fraud detection models and LLM agentic risk analysis pipelines.',
    responsibilities: 'Deploy state-of-the-art LLM fine-tuning pipelines.\nOptimize distributed training clusters for financial models.\nBuild real-time anomaly detection services handling 10k+ QPS.',
    requirements: 'Proven experience deploying PyTorch / OpenAI models at scale.\nStrong background in Distributed Systems (Go/Rust/Python).\nBS/MS in Computer Science or equivalent experience.',
    benefits: 'Top-tier compensation package ($220k - $290k).\nComprehensive relocation assistance.\nParental leave, 401(k) matching up to 6%.',
    location: 'San Francisco, CA',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    salaryMin: 220000,
    salaryMax: 290000,
    salaryCurrency: 'USD',
    experienceLevel: 'LEAD',
    tags: ['AI', 'Python', 'PyTorch', 'Distributed Systems', 'Go', 'LLMs'],
    status: 'ACTIVE',
    viewsCount: 2890,
    createdAt: '2026-07-22T14:30:00Z',
    updatedAt: '2026-07-22T14:30:00Z',
  },
  {
    id: 'job-3',
    companyId: 'comp-3',
    companyName: 'Linear',
    companyLogo: 'https://avatar.vercel.sh/linear?text=L',
    companyWebsite: 'https://linear.app',
    title: 'Product Designer (Design Systems & Micro-Interactions)',
    description: 'Linear is hiring a Product Designer obsessed with speed, craftsmanship, keyboard shortcuts, fluid motion design, and world-class SaaS aesthetic.',
    responsibilities: 'Design intuitive desktop-class web application features.\nBuild micro-animations and motion specs using Figma & Framer.\nMaintain Linear\'s iconic dark mode design system.',
    requirements: 'Strong portfolio demonstrating high-craft UI/UX for SaaS tools.\nExpert proficiency in Figma, design tokens, and motion design.\nBasic understanding of HTML/CSS/Tailwind implementation constraints.',
    benefits: 'Remote-first global environment.\n$200k - $230k salary + generous equity grants.\nAnnual team retreats in Iceland, Japan, and Spain.',
    location: 'Remote',
    workplaceType: 'REMOTE',
    jobType: 'FULL_TIME',
    salaryMin: 200000,
    salaryMax: 230000,
    salaryCurrency: 'USD',
    experienceLevel: 'SENIOR',
    tags: ['UI/UX', 'Figma', 'Design Systems', 'Framer Motion', 'Product Design'],
    status: 'ACTIVE',
    viewsCount: 980,
    createdAt: '2026-07-23T09:15:00Z',
    updatedAt: '2026-07-23T09:15:00Z',
  },
  {
    id: 'job-4',
    companyId: 'comp-4',
    companyName: 'OpenAI',
    companyLogo: 'https://avatar.vercel.sh/openai?text=AI',
    companyWebsite: 'https://openai.com',
    title: 'Full-Stack Developer (AI Applications & Agents)',
    description: 'Help us shape the future of human-AI collaboration by building responsive Web UI applications and real-time streaming agentic interfaces for ChatGPT Enterprise.',
    responsibilities: 'Build high-performance real-time UI components with Next.js & WebSockets.\nIntegrate complex multi-modal LLM reasoning pipelines into web apps.\nEnsure accessibility (WCAG AA) and sub-100ms UI interaction latencies.',
    requirements: '3+ years experience with Next.js, React 19, TypeScript, and SSE/WebSockets.\nPassionate about AI applications, prompt engineering, and clean UX.\nTrack record of shipping polished Web products.',
    benefits: '$210,000 - $260,000 base salary.\nUnlimited access to cutting-edge AI models & hardware.\nComprehensive wellness & mental health stipend.',
    location: 'San Francisco, CA',
    workplaceType: 'ONSITE',
    jobType: 'FULL_TIME',
    salaryMin: 210000,
    salaryMax: 260000,
    salaryCurrency: 'USD',
    experienceLevel: 'MID',
    tags: ['React', 'Next.js', 'AI Agents', 'TypeScript', 'WebSockets', 'OpenAI'],
    status: 'ACTIVE',
    viewsCount: 3410,
    createdAt: '2026-07-24T11:00:00Z',
    updatedAt: '2026-07-24T11:00:00Z',
  },
  {
    id: 'job-5',
    companyId: 'comp-5',
    companyName: 'Supabase',
    companyLogo: 'https://avatar.vercel.sh/supabase?text=SB',
    companyWebsite: 'https://supabase.com',
    title: 'Backend Engineer (PostgreSQL & Realtime Systems)',
    description: 'We build open-source tools for developers. You will work on Supabase Realtime, Elixir engine, Postgres extension wrappers, and distributed database replication.',
    responsibilities: 'Write robust Elixir/Go services to manage Postgres replication logs.\nImprove security & rate-limiting policies for Supabase Auth & Storage.\nEngage directly with developer community on GitHub.',
    requirements: 'Strong understanding of PostgreSQL internals, SQL indexes, and WAL logs.\nProficiency in Elixir, Go, or Rust.\nPassion for open-source software development.',
    benefits: '$160k - $210k salary.\n100% remote working flexibility.\nFlexible work hours & wellness allowance.',
    location: 'Remote',
    workplaceType: 'REMOTE',
    jobType: 'FULL_TIME',
    salaryMin: 160000,
    salaryMax: 210000,
    salaryCurrency: 'USD',
    experienceLevel: 'MID',
    tags: ['PostgreSQL', 'Elixir', 'Go', 'Backend', 'Supabase', 'Open Source'],
    status: 'ACTIVE',
    viewsCount: 1120,
    createdAt: '2026-07-21T16:20:00Z',
    updatedAt: '2026-07-21T16:20:00Z',
  },
  {
    id: 'job-6',
    companyId: 'comp-1',
    companyName: 'Vercel',
    companyLogo: 'https://avatar.vercel.sh/vercel?text=V',
    companyWebsite: 'https://vercel.com',
    title: 'Junior Frontend Developer (Web Performance & UI)',
    description: 'An exciting entry-level role for a enthusiastic Developer eager to master modern React 19, web vitals optimization, dynamic animation, and SaaS frontend design.',
    responsibilities: 'Create pixel-perfect UI components from design specifications.\nAssist in optimizing image loading, script execution, and LCP score.\nWrite comprehensive unit and integration tests using Vitest.',
    requirements: '1+ years experience or portfolio of React & Tailwind CSS projects.\nDemonstrated mastery of HTML5, CSS Grid/Flexbox, and JavaScript (ES6+).\nEagerness to learn Next.js App Router.',
    benefits: '$110,000 - $140,000 salary.\nDedicated senior engineer mentorship.\nFull remote workspace setup equipment provided.',
    location: 'New York, NY',
    workplaceType: 'HYBRID',
    jobType: 'FULL_TIME',
    salaryMin: 110000,
    salaryMax: 140000,
    salaryCurrency: 'USD',
    experienceLevel: 'ENTRY',
    tags: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5', 'Frontend', 'Vitest'],
    status: 'ACTIVE',
    viewsCount: 890,
    createdAt: '2026-07-24T08:00:00Z',
    updatedAt: '2026-07-24T08:00:00Z',
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Senior Full-Stack Engineer (Next.js & Cloud)',
    companyName: 'Vercel',
    candidateId: 'user-cand-1',
    candidateName: 'Alex Morgan',
    candidateEmail: 'alex.morgan@example.com',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    candidateHeadline: 'Senior Full-Stack Engineer | React, Next.js & Node.js Specialist',
    coverLetter: 'I am thrilled to apply for the Senior Full-Stack Engineer position at Vercel. Having built and scaled multiple SaaS platforms using Next.js App Router and Edge functions, I am eager to bring my expertise in serverless architectures and web performance optimization to your core team.',
    status: 'INTERVIEWING',
    resumeUrl: 'https://example.com/resumes/alex-morgan.pdf',
    matchScore: 94,
    appliedDate: '2026-07-21T11:45:00Z',
  },
  {
    id: 'app-2',
    jobId: 'job-4',
    jobTitle: 'Full-Stack Developer (AI Applications & Agents)',
    companyName: 'OpenAI',
    candidateId: 'user-cand-1',
    candidateName: 'Alex Morgan',
    candidateEmail: 'alex.morgan@example.com',
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    candidateHeadline: 'Senior Full-Stack Engineer | React, Next.js & Node.js Specialist',
    coverLetter: 'Applying for the AI Applications Developer position! I have experience integrating OpenAI GPT-4 APIs, streaming responses, and building custom agent workflows with TypeScript.',
    status: 'REVIEWING',
    resumeUrl: 'https://example.com/resumes/alex-morgan.pdf',
    matchScore: 89,
    appliedDate: '2026-07-24T14:10:00Z',
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    jobTitle: 'Staff AI Infrastructure Engineer',
    companyName: 'Stripe',
    candidateId: 'user-cand-2',
    candidateName: 'David Chen',
    candidateEmail: 'david.chen@example.com',
    candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    candidateHeadline: 'Machine Learning Infrastructure Lead @ Ex-Meta',
    coverLetter: 'With 7 years in distributed training and Python ML microservices, I am excited about Stripe\'s automated risk detection challenges.',
    status: 'PENDING',
    resumeUrl: 'https://example.com/resumes/david-chen.pdf',
    matchScore: 91,
    appliedDate: '2026-07-23T18:00:00Z',
  }
];

export const INITIAL_CANDIDATE_PROFILE: CandidateProfile = {
  id: 'profile-1',
  userId: 'user-cand-1',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  headline: 'Senior Full-Stack Engineer | React, Next.js, AI & Cloud Specialist',
  bio: 'Passionate developer with 6+ years of experience shipping production web apps using Next.js, React 19, TypeScript, and Supabase. Enthusiastic about clean architecture, micro-interactions, and AI integration.',
  phone: '+1 (555) 382-9102',
  location: 'San Francisco, CA',
  resumeUrl: 'https://example.com/resumes/alex-morgan.pdf',
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Supabase', 'Prisma', 'OpenAI API', 'GraphQL'],
  website: 'https://alexmorgan.dev',
  githubUrl: 'https://github.com/alexmorgan-dev',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
  experienceYrs: 6,
};
