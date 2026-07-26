import { describe, it, expect } from 'vitest';
import { AIService } from '../lib/ai/ai-service';

describe('AIService Unit Tests', () => {
  it('should generate a structured job description', async () => {
    const res = await AIService.generateJobDescription({ title: 'Senior Frontend Engineer', companyName: 'Vercel' });
    expect(res).toBeDefined();
    expect(res.description).toBeDefined();
    expect(res.responsibilities).toBeDefined();
    expect(res.requirements).toBeDefined();
  });

  it('should suggest high-converting job titles', async () => {
    const res = await AIService.improveJobTitle({ title: 'Full Stack Dev' });
    expect(res.suggestedTitles).toHaveLength(4);
    expect(res.reasoning).toBeDefined();
  });

  it('should suggest relevant skills for AI roles', async () => {
    const res = await AIService.suggestSkills({ title: 'AI Infrastructure Engineer' });
    expect(res.skills).toContain('Python');
    expect(res.skills.length).toBeGreaterThan(3);
  });

  it('should generate role-specific interview questions', async () => {
    const res = await AIService.generateInterviewQuestions({ title: 'React Developer' });
    expect(res.questions.length).toBe(4);
    expect(res.questions[0]).toHaveProperty('category');
    expect(res.questions[0]).toHaveProperty('question');
    expect(res.questions[0]).toHaveProperty('evalCriteria');
  });

  it('should generate a company summary', async () => {
    const res = await AIService.generateCompanySummary({ companyName: 'Stripe', industry: 'Fintech' });
    expect(res.summary).toBeDefined();
    expect(res.mission).toBeDefined();
    expect(Array.isArray(res.cultureValues)).toBe(true);
  });

  it('should generate a cover letter', async () => {
    const res = await AIService.generateCoverLetter({
      jobTitle: 'Senior Engineer',
      companyName: 'Vercel',
      candidateName: 'Alex Morgan',
      skills: ['React', 'TypeScript'],
    });
    expect(res.coverLetter).toBeDefined();
    expect(typeof res.coverLetter).toBe('string');
    expect(res.coverLetter.length).toBeGreaterThan(50);
  });

  it('should analyze a resume', async () => {
    const res = await AIService.analyzeResume('John Doe\nSenior Engineer\n5 years React TypeScript Node.js');
    expect(res.strengths).toBeDefined();
    expect(res.improvements).toBeDefined();
    expect(typeof res.overallScore).toBe('number');
  });

  it('should calculate ATS score', async () => {
    const res = await AIService.calculateATSScore(
      'React TypeScript Node.js PostgreSQL',
      'We need a React developer with TypeScript experience'
    );
    expect(typeof res.score).toBe('number');
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.score).toBeLessThanOrEqual(100);
  });
});
