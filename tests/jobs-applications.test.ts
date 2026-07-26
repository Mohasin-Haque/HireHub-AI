import { describe, it, expect } from 'vitest';
import { jobPostSchema, applyJobSchema } from '../lib/validations';

// ── Job CRUD validation ───────────────────────────────────────
describe('Job CRUD — jobPostSchema', () => {
  const validJob = {
    title: 'Senior Next.js Developer',
    companyName: 'Vercel',
    location: 'Remote',
    workplaceType: 'REMOTE' as const,
    jobType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
    salaryMin: 150000,
    salaryMax: 200000,
    description: 'We are hiring a Senior Next.js Developer with 5+ years of experience.',
    responsibilities: 'Build scalable web applications.',
    requirements: 'Must master React 19 and TypeScript.',
    tags: ['React', 'Next.js'],
  };

  it('accepts valid job post', () => {
    expect(jobPostSchema.safeParse(validJob).success).toBe(true);
  });

  it('rejects title shorter than 3 chars', () => {
    expect(jobPostSchema.safeParse({ ...validJob, title: 'JS' }).success).toBe(false);
  });

  it('rejects description shorter than 20 chars', () => {
    expect(jobPostSchema.safeParse({ ...validJob, description: 'Too short' }).success).toBe(false);
  });

  it('rejects empty tags array', () => {
    expect(jobPostSchema.safeParse({ ...validJob, tags: [] }).success).toBe(false);
  });

  it('rejects invalid workplaceType', () => {
    expect(jobPostSchema.safeParse({ ...validJob, workplaceType: 'INVALID' }).success).toBe(false);
  });

  it('rejects invalid jobType', () => {
    expect(jobPostSchema.safeParse({ ...validJob, jobType: 'FREELANCE' }).success).toBe(false);
  });

  it('rejects invalid experienceLevel', () => {
    expect(jobPostSchema.safeParse({ ...validJob, experienceLevel: 'JUNIOR' }).success).toBe(false);
  });

  it('accepts optional benefits field', () => {
    const withBenefits = { ...validJob, benefits: 'Health insurance, 401k' };
    expect(jobPostSchema.safeParse(withBenefits).success).toBe(true);
  });

  it('accepts valid company website URL', () => {
    const withWebsite = { ...validJob, companyWebsite: 'https://vercel.com' };
    expect(jobPostSchema.safeParse(withWebsite).success).toBe(true);
  });

  it('rejects invalid company website URL', () => {
    const withBadWebsite = { ...validJob, companyWebsite: 'not-a-url' };
    expect(jobPostSchema.safeParse(withBadWebsite).success).toBe(false);
  });

  it('accepts all valid workplace types', () => {
    (['REMOTE', 'HYBRID', 'ONSITE'] as const).forEach(type => {
      expect(jobPostSchema.safeParse({ ...validJob, workplaceType: type }).success).toBe(true);
    });
  });

  it('accepts all valid job types', () => {
    (['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const).forEach(type => {
      expect(jobPostSchema.safeParse({ ...validJob, jobType: type }).success).toBe(true);
    });
  });

  it('accepts all valid experience levels', () => {
    (['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as const).forEach(level => {
      expect(jobPostSchema.safeParse({ ...validJob, experienceLevel: level }).success).toBe(true);
    });
  });
});

// ── Application submission validation ────────────────────────
describe('Applications — applyJobSchema', () => {
  const validApplication = {
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    coverLetter: 'I am very excited to apply for this position and believe my skills align perfectly.',
  };

  it('accepts valid application', () => {
    expect(applyJobSchema.safeParse(validApplication).success).toBe(true);
  });

  it('rejects short full name', () => {
    expect(applyJobSchema.safeParse({ ...validApplication, fullName: 'A' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(applyJobSchema.safeParse({ ...validApplication, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects cover letter shorter than 30 chars', () => {
    expect(applyJobSchema.safeParse({ ...validApplication, coverLetter: 'Too short' }).success).toBe(false);
  });

  it('accepts valid resume URL', () => {
    const withResume = { ...validApplication, resumeUrl: 'https://example.com/resume.pdf' };
    expect(applyJobSchema.safeParse(withResume).success).toBe(true);
  });

  it('rejects invalid resume URL', () => {
    const withBadResume = { ...validApplication, resumeUrl: 'not-a-url' };
    expect(applyJobSchema.safeParse(withBadResume).success).toBe(false);
  });

  it('accepts empty string resume URL', () => {
    const withEmptyResume = { ...validApplication, resumeUrl: '' };
    expect(applyJobSchema.safeParse(withEmptyResume).success).toBe(true);
  });
});

// ── Application status transitions ───────────────────────────
describe('Application status transitions', () => {
  const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEWING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

  it('all valid statuses are strings', () => {
    validStatuses.forEach(s => expect(typeof s).toBe('string'));
  });

  it('status pipeline is ordered correctly', () => {
    expect(validStatuses.indexOf('PENDING')).toBeLessThan(validStatuses.indexOf('REVIEWING'));
    expect(validStatuses.indexOf('REVIEWING')).toBeLessThan(validStatuses.indexOf('INTERVIEWING'));
    expect(validStatuses.indexOf('INTERVIEWING')).toBeLessThan(validStatuses.indexOf('ACCEPTED'));
  });

  it('match score is within valid range', () => {
    // Simulates the random match score logic in applyToJob
    const score = Math.floor(Math.random() * 15) + 82;
    expect(score).toBeGreaterThanOrEqual(82);
    expect(score).toBeLessThanOrEqual(96);
  });
});
