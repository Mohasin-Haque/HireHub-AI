import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, jobPostSchema } from '../lib/validations';

describe('Validation Schemas Unit Tests', () => {
  it('should validate correct login input', () => {
    const input = {
      email: 'alex@example.com',
      password: 'password123',
      role: 'CANDIDATE',
    };
    const parsed = loginSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('should fail login input with invalid email', () => {
    const input = {
      email: 'invalid-email',
      password: '123',
      role: 'CANDIDATE',
    };
    const parsed = loginSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should require companyName when signup role is EMPLOYER', () => {
    const invalidEmployer = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'EMPLOYER',
      companyName: '',
    };
    const parsed = signupSchema.safeParse(invalidEmployer);
    expect(parsed.success).toBe(false);

    const validEmployer = {
      ...invalidEmployer,
      companyName: 'Acme Corp',
    };
    expect(signupSchema.safeParse(validEmployer).success).toBe(true);
  });

  it('should validate valid job posting inputs', () => {
    const jobInput = {
      title: 'Senior Next.js Developer',
      companyName: 'Vercel',
      location: 'Remote',
      workplaceType: 'REMOTE',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      salaryMin: 150000,
      salaryMax: 200000,
      description: 'We are hiring a Senior Next.js Developer with 5+ years of experience.',
      responsibilities: 'Build scalable web applications and serverless APIs.',
      requirements: 'Must master React 19, TypeScript, and Tailwind CSS.',
      tags: ['React', 'Next.js'],
    };
    const parsed = jobPostSchema.safeParse(jobInput);
    expect(parsed.success).toBe(true);
  });
});
