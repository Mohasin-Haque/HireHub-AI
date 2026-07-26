import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, jobPostSchema, workExperienceSchema, educationSchema, companySchema } from '../lib/validations';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login input', () => {
      expect(loginSchema.safeParse({ email: 'alex@example.com', password: 'password123', role: 'CANDIDATE' }).success).toBe(true);
    });
    it('rejects invalid email', () => {
      expect(loginSchema.safeParse({ email: 'invalid', password: '123', role: 'CANDIDATE' }).success).toBe(false);
    });
    it('rejects short password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: '123', role: 'CANDIDATE' }).success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('requires companyName for EMPLOYER', () => {
      expect(signupSchema.safeParse({ fullName: 'John', email: 'j@e.com', password: 'pass123', role: 'EMPLOYER', companyName: '' }).success).toBe(false);
      expect(signupSchema.safeParse({ fullName: 'John', email: 'j@e.com', password: 'pass123', role: 'EMPLOYER', companyName: 'Acme' }).success).toBe(true);
    });
    it('allows CANDIDATE without companyName', () => {
      expect(signupSchema.safeParse({ fullName: 'Jane', email: 'j@e.com', password: 'pass123', role: 'CANDIDATE' }).success).toBe(true);
    });
  });

  describe('jobPostSchema', () => {
    const valid = {
      title: 'Senior Next.js Developer', companyName: 'Vercel', location: 'Remote',
      workplaceType: 'REMOTE', jobType: 'FULL_TIME', experienceLevel: 'SENIOR',
      salaryMin: 150000, salaryMax: 200000,
      description: 'We are hiring a Senior Next.js Developer with 5+ years of experience.',
      responsibilities: 'Build scalable web applications.',
      requirements: 'Must master React 19 and TypeScript.',
      tags: ['React', 'Next.js'],
    };
    it('validates valid job post', () => {
      expect(jobPostSchema.safeParse(valid).success).toBe(true);
    });
    it('rejects missing title', () => {
      expect(jobPostSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
    });
    it('rejects empty tags', () => {
      expect(jobPostSchema.safeParse({ ...valid, tags: [] }).success).toBe(false);
    });
  });

  describe('workExperienceSchema', () => {
    it('validates valid work experience', () => {
      expect(workExperienceSchema.safeParse({ company: 'Vercel', title: 'Engineer', startDate: '2022-01-01', current: true }).success).toBe(true);
    });
    it('rejects missing company', () => {
      expect(workExperienceSchema.safeParse({ company: '', title: 'Engineer', startDate: '2022-01-01', current: false }).success).toBe(false);
    });
  });

  describe('educationSchema', () => {
    it('validates valid education', () => {
      expect(educationSchema.safeParse({ institution: 'MIT', degree: 'B.S. CS', startYear: 2018, current: false }).success).toBe(true);
    });
    it('rejects missing institution', () => {
      expect(educationSchema.safeParse({ institution: '', degree: 'B.S.', startYear: 2018, current: false }).success).toBe(false);
    });
  });

  describe('companySchema', () => {
    it('validates valid company', () => {
      expect(companySchema.safeParse({ name: 'Vercel', hiringStatus: true }).success).toBe(true);
    });
    it('rejects invalid website URL', () => {
      expect(companySchema.safeParse({ name: 'Vercel', website: 'not-a-url', hiringStatus: true }).success).toBe(false);
    });
  });
});
