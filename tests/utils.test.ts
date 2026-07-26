import { describe, it, expect } from 'vitest';
import { cn, formatSalary, formatDate } from '../lib/utils';

describe('cn (classname utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  it('deduplicates tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });
});

describe('formatSalary', () => {
  it('returns undisclosed when both are null', () => {
    expect(formatSalary(null, null)).toBe('Salary Undisclosed');
  });
  it('formats range correctly', () => {
    expect(formatSalary(100000, 150000)).toBe('$100k - $150k');
  });
  it('formats min-only salary', () => {
    expect(formatSalary(80000, null)).toBe('From $80k');
  });
  it('formats max-only salary', () => {
    expect(formatSalary(null, 120000)).toBe('Up to $120k');
  });
  it('uses custom currency symbol', () => {
    expect(formatSalary(50000, 70000, 'EUR')).toBe('EUR50k - EUR70k');
  });
});

describe('formatDate', () => {
  it('returns "Just now" for very recent dates', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Just now');
  });
  it('returns minutes ago for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatDate(fiveMinAgo)).toBe('5m ago');
  });
  it('returns hours ago for older dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatDate(twoHoursAgo)).toBe('2h ago');
  });
  it('returns days ago for dates within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatDate(threeDaysAgo)).toBe('3d ago');
  });
  it('returns formatted date for older dates', () => {
    const result = formatDate('2023-01-15T00:00:00.000Z');
    expect(result).toMatch(/Jan 15, 2023/);
  });
});
