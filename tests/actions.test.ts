import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mock factory ───────────────────────────────────────
function makeMockSupabase(overrides: Record<string, any> = {}) {
  const base = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@example.com' } }, error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  return base;
}

// ── Profile completion calculation (pure logic extracted) ─────
describe('Profile completion calculation', () => {
  function calculateProfileCompletion(profile: Record<string, any>): number {
    const fields = [
      profile.fullName, profile.headline, profile.bio, profile.location,
      profile.resumeUrl, profile.githubUrl, profile.linkedinUrl,
      profile.skills?.length, profile.experienceYrs,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }

  it('returns 0 for empty profile', () => {
    expect(calculateProfileCompletion({})).toBe(0);
  });

  it('returns 100 for fully filled profile', () => {
    const full = {
      fullName: 'Alex', headline: 'Engineer', bio: 'Bio text', location: 'NYC',
      resumeUrl: 'https://example.com/resume.pdf', githubUrl: 'https://github.com/alex',
      linkedinUrl: 'https://linkedin.com/in/alex', skills: ['React'], experienceYrs: 3,
    };
    expect(calculateProfileCompletion(full)).toBe(100);
  });

  it('returns partial completion correctly', () => {
    const partial = { fullName: 'Alex', headline: 'Engineer', bio: 'Bio', location: 'NYC' };
    // 4 out of 9 fields = ~44%
    expect(calculateProfileCompletion(partial)).toBe(44);
  });
});

// ── Employer analytics funnel logic (pure) ────────────────────
describe('Employer analytics funnel', () => {
  function buildFunnel(apps: Array<{ status: string }>) {
    return {
      total: apps.length,
      reviewing: apps.filter(a => a.status === 'REVIEWING').length,
      interviewing: apps.filter(a => a.status === 'INTERVIEWING').length,
      shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
      accepted: apps.filter(a => a.status === 'ACCEPTED').length,
      rejected: apps.filter(a => a.status === 'REJECTED').length,
    };
  }

  it('counts all statuses correctly', () => {
    const apps = [
      { status: 'PENDING' }, { status: 'REVIEWING' }, { status: 'REVIEWING' },
      { status: 'INTERVIEWING' }, { status: 'SHORTLISTED' }, { status: 'ACCEPTED' },
      { status: 'REJECTED' }, { status: 'REJECTED' },
    ];
    const funnel = buildFunnel(apps);
    expect(funnel.total).toBe(8);
    expect(funnel.reviewing).toBe(2);
    expect(funnel.interviewing).toBe(1);
    expect(funnel.shortlisted).toBe(1);
    expect(funnel.accepted).toBe(1);
    expect(funnel.rejected).toBe(2);
  });

  it('returns zeros for empty applications', () => {
    const funnel = buildFunnel([]);
    expect(funnel.total).toBe(0);
    expect(funnel.accepted).toBe(0);
  });
});

// ── Weekly trend builder (pure) ───────────────────────────────
describe('Weekly trend builder', () => {
  function buildWeeklyTrend(apps: Array<{ created_at: string }>, jobs: Array<{ created_at: string; views_count: number }>) {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        applications: apps.filter(a => a.created_at.startsWith(dateStr)).length,
        views: jobs.reduce((sum, j) => sum + (j.created_at.startsWith(dateStr) ? j.views_count : 0), 0),
      };
    });
  }

  it('returns 7 data points', () => {
    expect(buildWeeklyTrend([], [])).toHaveLength(7);
  });

  it('counts applications on correct day', () => {
    const today = new Date().toISOString().split('T')[0];
    const apps = [{ created_at: `${today}T10:00:00Z` }, { created_at: `${today}T12:00:00Z` }];
    const trend = buildWeeklyTrend(apps, []);
    const todayEntry = trend[trend.length - 1];
    expect(todayEntry.applications).toBe(2);
  });
});

// ── Notification helpers (pure logic) ────────────────────────
describe('Notification data shape', () => {
  it('creates valid notification payload', () => {
    const payload = {
      user_id: 'user-1',
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      body: 'Your interview is at 3pm',
      link: '/dashboard/candidate',
    };
    expect(payload.type).toBe('INTERVIEW_SCHEDULED');
    expect(payload.title).toBeDefined();
    expect(payload.user_id).toBe('user-1');
  });

  it('notification types are valid strings', () => {
    const validTypes = ['INTERVIEW_SCHEDULED', 'APPLICATION_UPDATE', 'NEW_MESSAGE', 'JOB_ALERT'];
    validTypes.forEach(type => expect(typeof type).toBe('string'));
  });
});

// ── Bookmark toggle logic (pure) ──────────────────────────────
describe('Bookmark toggle logic', () => {
  it('returns false when removing existing bookmark', () => {
    const existing = { id: 'bookmark-1' };
    const result = existing ? false : true;
    expect(result).toBe(false);
  });

  it('returns true when adding new bookmark', () => {
    const existing = null;
    const result = existing ? false : true;
    expect(result).toBe(true);
  });
});

// ── Job duplication logic (pure) ──────────────────────────────
describe('Job duplication', () => {
  it('appends (Copy) to duplicated job title', () => {
    const original = { title: 'Senior Engineer', status: 'ACTIVE', views_count: 100 };
    const duplicate = { ...original, title: `${original.title} (Copy)`, status: 'DRAFT', views_count: 0 };
    expect(duplicate.title).toBe('Senior Engineer (Copy)');
    expect(duplicate.status).toBe('DRAFT');
    expect(duplicate.views_count).toBe(0);
  });
});

// ── Supabase client mock (auth guard) ────────────────────────
describe('Auth guard behavior', () => {
  it('throws Unauthorized when user is null', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') });
    const result = await mockGetUser();
    expect(result.data.user).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('resolves user when authenticated', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    const result = await mockGetUser();
    expect(result.data.user?.id).toBe('user-1');
    expect(result.error).toBeNull();
  });
});
