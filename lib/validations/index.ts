import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['EMPLOYER', 'CANDIDATE']),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['EMPLOYER', 'CANDIDATE']),
  companyName: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === 'EMPLOYER' && (!data.companyName || data.companyName.trim() === '')) {
      return false;
    }
    return true;
  },
  { message: 'Company name is required for Employer account', path: ['companyName'] }
);

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const jobPostSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  companyWebsite: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  workplaceType: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  salaryMin: z.number({ invalid_type_error: 'Must be a number' }).min(0),
  salaryMax: z.number({ invalid_type_error: 'Must be a number' }).min(0),
  salaryCurrency: z.string().default('USD'),
  description: z.string().min(20, 'Job description must be at least 20 characters'),
  responsibilities: z.string().min(10, 'Key responsibilities are required'),
  requirements: z.string().min(10, 'Requirements are required'),
  benefits: z.string().optional(),
  tags: z.array(z.string()).min(1, 'Please select or add at least 1 skill tag'),
});

export const applyJobSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  coverLetter: z.string().min(30, 'Cover letter must be at least 30 characters'),
  resumeUrl: z.string().url('Please provide a valid resume URL').min(1, 'Resume URL is required'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  headline: z.string().min(5, 'Professional headline is required'),
  bio: z.string().min(15, 'Bio should be at least 15 characters'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Select at least 1 skill'),
  experienceYrs: z.number().min(0, 'Experience cannot be negative'),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  title: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startYear: z.number().min(1900).max(2100),
  endYear: z.number().min(1900).max(2100).optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  hiringStatus: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type JobPostInput = z.infer<typeof jobPostSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
