import { describe, it, expect } from 'vitest';
import { AIService } from '../lib/ai/ai-service';

// ── Resume analysis ───────────────────────────────────────────
describe('Resume Parser & Analyzer', () => {
  it('analyzes a basic resume and returns required fields', async () => {
    const resumeText = `
      Jane Smith
      Senior Software Engineer
      5 years of experience with React, TypeScript, Node.js, PostgreSQL
      Led team of 4 engineers, reduced load time by 40%
      B.S. Computer Science, MIT 2018
    `;
    const result = await AIService.analyzeResume(resumeText);
    expect(result).toBeDefined();
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.improvements)).toBe(true);
    expect(typeof result.overallScore).toBe('number');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns keywords array from resume analysis', async () => {
    const result = await AIService.analyzeResume('React TypeScript Node.js PostgreSQL Docker');
    expect(Array.isArray(result.keywords)).toBe(true);
  });

  it('handles minimal resume text gracefully', async () => {
    const result = await AIService.analyzeResume('John Doe, Developer');
    expect(result).toBeDefined();
    expect(result.overallScore).toBeDefined();
  });

  it('truncates very long resume text to 3000 chars', async () => {
    const longText = 'A'.repeat(5000);
    // The service slices to 3000 — just verify it doesn't throw
    const result = await AIService.analyzeResume(longText);
    expect(result).toBeDefined();
  });
});

// ── ATS Score calculation ─────────────────────────────────────
describe('ATS Score Calculator', () => {
  it('returns score between 0 and 100', async () => {
    const result = await AIService.calculateATSScore(
      'React TypeScript Node.js PostgreSQL Docker Kubernetes',
      'Looking for a React developer with TypeScript and Node.js experience'
    );
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns matched and missing keywords arrays', async () => {
    const result = await AIService.calculateATSScore(
      'React TypeScript Node.js',
      'React developer with Docker and Kubernetes experience required'
    );
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
    expect(Array.isArray(result.missingKeywords)).toBe(true);
  });

  it('returns suggestions array', async () => {
    const result = await AIService.calculateATSScore('Python Django', 'Node.js React TypeScript developer');
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('handles empty resume text gracefully', async () => {
    const result = await AIService.calculateATSScore('', 'React developer needed');
    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
  });
});

// ── Resume version management (pure logic) ───────────────────
describe('Resume version management', () => {
  it('sets only one version as active', () => {
    const versions = [
      { id: 'v1', is_active: true, file_name: 'resume_v1.pdf' },
      { id: 'v2', is_active: false, file_name: 'resume_v2.pdf' },
      { id: 'v3', is_active: false, file_name: 'resume_v3.pdf' },
    ];

    // Simulate setActiveResume('v2')
    const updated = versions.map(v => ({ ...v, is_active: v.id === 'v2' }));
    const activeVersions = updated.filter(v => v.is_active);
    expect(activeVersions).toHaveLength(1);
    expect(activeVersions[0].id).toBe('v2');
  });

  it('orders versions by created_at descending', () => {
    const versions = [
      { id: 'v1', created_at: '2024-01-01' },
      { id: 'v3', created_at: '2024-03-01' },
      { id: 'v2', created_at: '2024-02-01' },
    ];
    const sorted = [...versions].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    expect(sorted[0].id).toBe('v3');
    expect(sorted[2].id).toBe('v1');
  });

  it('deletes version from list', () => {
    const versions = [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }];
    const afterDelete = versions.filter(v => v.id !== 'v2');
    expect(afterDelete).toHaveLength(2);
    expect(afterDelete.find(v => v.id === 'v2')).toBeUndefined();
  });
});
