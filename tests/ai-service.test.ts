import { describe, it, expect } from 'vitest';
import { AIService } from '../lib/ai/ai-service';

describe('AIService Unit Tests', () => {
  it('should generate a structured job description with responsibilities and requirements', async () => {
    const res = await AIService.generateJobDescription({
      title: 'Senior Frontend Engineer',
      companyName: 'Vercel',
    });

    expect(res).toBeDefined();
    expect(res.description).toContain('Frontend Engineer');
    expect(res.responsibilities).toBeDefined();
    expect(res.requirements).toBeDefined();
  });

  it('should suggest high-converting job titles', async () => {
    const res = await AIService.improveJobTitle({ title: 'Full Stack Dev' });

    expect(res.suggestedTitles).toHaveLength(4);
    expect(res.reasoning).toBeDefined();
  });

  it('should suggest relevant skills for technical roles', async () => {
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
});
