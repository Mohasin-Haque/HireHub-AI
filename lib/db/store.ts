import { Job, Application, CandidateProfile, INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_CANDIDATE_PROFILE } from './mock-data';

const STORAGE_KEYS = {
  JOBS: 'hirehub_jobs_v1',
  APPLICATIONS: 'hirehub_applications_v1',
  BOOKMARKS: 'hirehub_bookmarks_v1',
  PROFILE: 'hirehub_profile_v1',
};

export class HireHubStore {
  private static getStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Store persistence error:', err);
    }
  }

  // Jobs CRUD
  static getJobs(): Job[] {
    return this.getStorage<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  }

  static getJobById(id: string): Job | undefined {
    return this.getJobs().find((j) => j.id === id);
  }

  static createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Job {
    const jobs = this.getJobs();
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedJobs = [newJob, ...jobs];
    this.setStorage(STORAGE_KEYS.JOBS, updatedJobs);
    return newJob;
  }

  static updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const jobs = this.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return undefined;
    
    const updated: Job = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    jobs[index] = updated;
    this.setStorage(STORAGE_KEYS.JOBS, jobs);
    return updated;
  }

  static deleteJob(id: string): boolean {
    const jobs = this.getJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    this.setStorage(STORAGE_KEYS.JOBS, filtered);
    return true;
  }

  static incrementViews(id: string): void {
    const job = this.getJobById(id);
    if (job) {
      this.updateJob(id, { viewsCount: job.viewsCount + 1 });
    }
  }

  // Applications CRUD
  static getApplications(): Application[] {
    return this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  static applyToJob(appData: {
    jobId: string;
    coverLetter: string;
    resumeUrl?: string;
    candidateName?: string;
    candidateEmail?: string;
  }): Application {
    const apps = this.getApplications();
    const job = this.getJobById(appData.jobId);
    const profile = this.getProfile();

    const existing = apps.find((a) => a.jobId === appData.jobId && a.candidateId === profile.userId);
    if (existing) {
      return existing;
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: appData.jobId,
      jobTitle: job?.title || 'Position',
      companyName: job?.companyName || 'Company',
      candidateId: profile.userId,
      candidateName: appData.candidateName || profile.fullName,
      candidateEmail: appData.candidateEmail || profile.email,
      candidateAvatar: profile.avatarUrl,
      candidateHeadline: profile.headline,
      coverLetter: appData.coverLetter,
      status: 'PENDING',
      resumeUrl: appData.resumeUrl || profile.resumeUrl,
      matchScore: Math.floor(Math.random() * 15) + 82, // AI match calculation
      appliedDate: new Date().toISOString(),
    };

    const updatedApps = [newApp, ...apps];
    this.setStorage(STORAGE_KEYS.APPLICATIONS, updatedApps);
    return newApp;
  }

  static updateApplicationStatus(id: string, status: Application['status']): Application | undefined {
    const apps = this.getApplications();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return undefined;

    apps[index].status = status;
    this.setStorage(STORAGE_KEYS.APPLICATIONS, apps);
    return apps[index];
  }

  // Bookmarks CRUD
  static getBookmarks(): string[] {
    return this.getStorage<string[]>(STORAGE_KEYS.BOOKMARKS, ['job-1', 'job-3']);
  }

  static toggleBookmark(jobId: string): boolean {
    const bookmarks = this.getBookmarks();
    let isBookmarked = false;
    let updated: string[];

    if (bookmarks.includes(jobId)) {
      updated = bookmarks.filter((id) => id !== jobId);
      isBookmarked = false;
    } else {
      updated = [...bookmarks, jobId];
      isBookmarked = true;
    }

    this.setStorage(STORAGE_KEYS.BOOKMARKS, updated);
    return isBookmarked;
  }

  // Profile Management
  static getProfile(): CandidateProfile {
    return this.getStorage<CandidateProfile>(STORAGE_KEYS.PROFILE, INITIAL_CANDIDATE_PROFILE);
  }

  static updateProfile(updates: Partial<CandidateProfile>): CandidateProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    this.setStorage(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }
}
