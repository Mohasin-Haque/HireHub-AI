'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { getCandidateApplications, getBookmarkedJobs } from '@/lib/actions/candidate';
import { getActivityFeed } from '@/lib/actions/shared';
import { getProfile } from '@/lib/actions/candidate';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileCompletion } from '@/components/dashboard/ProfileCompletion';
import { ATSScore } from '@/components/dashboard/ATSScore';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import {
  Bookmark, Send, Sparkles, Clock, Briefcase, Edit,
  Calendar, TrendingUp, FileText, Bell,
} from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [prof, apps, saved, feed] = await Promise.all([
        getProfile(),
        getCandidateApplications(),
        getBookmarkedJobs(),
        getActivityFeed(10),
      ]);
      setProfile(prof);
      setApplications(apps);
      setSavedJobs(saved);
      setActivityFeed(feed);
    });
  }, []);

  const completionChecks = [
    { label: 'Full name', done: !!profile?.full_name },
    { label: 'Headline', done: !!profile?.headline },
    { label: 'Bio', done: !!profile?.bio },
    { label: 'Location', done: !!profile?.location },
    { label: 'Resume uploaded', done: !!profile?.resume_url },
    { label: 'Skills added', done: (profile?.skills?.length || 0) > 0 },
    { label: 'GitHub linked', done: !!profile?.github_url },
    { label: 'LinkedIn linked', done: !!profile?.linkedin_url },
  ];

  const interviewingCount = applications.filter((a: any) => a.status === 'INTERVIEWING').length;
  const avgMatch = applications.length
    ? Math.round(applications.reduce((s: number, a: any) => s + (a.match_score || 0), 0) / applications.length)
    : 0;

  const statusVariant: Record<string, any> = {
    ACCEPTED: 'success', INTERVIEWING: 'brand', REVIEWING: 'ai',
    SHORTLISTED: 'ai', PENDING: 'warning', REJECTED: 'danger',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Image
            src={profile?.avatar_url || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={profile?.full_name || user?.fullName || 'User'}
            width={64} height={64}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-400/50 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.full_name || user?.fullName || 'there'}!
            </h1>
            <p className="text-xs text-brand-200">{profile?.headline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/candidate/profile">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 gap-1.5">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="primary" className="gap-1.5 shadow-md">
              <Briefcase className="w-4 h-4" /> Explore Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Send, color: 'brand', label: 'Applications', value: applications.length, sub: 'Submitted' },
          { icon: Bookmark, color: 'amber', label: 'Saved Jobs', value: savedJobs.length, sub: 'Bookmarked' },
          { icon: Calendar, color: 'cyan', label: 'Interviews', value: interviewingCount, sub: 'Scheduled' },
          { icon: Sparkles, color: 'emerald', label: 'Avg Match', value: `${avgMatch}%`, sub: 'AI Score' },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <div key={label} className="p-5 rounded-2xl glass-panel space-y-2">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Applications Tracker</h3>
                <p className="text-xs text-slate-500">Real-time status from hiring teams</p>
              </div>
              <Link href="/dashboard/candidate/saved" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Saved ({savedJobs.length})
              </Link>
            </div>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-slate-400">No applications yet.</p>
                  <Link href="/jobs">
                    <Button variant="primary" size="sm">Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                applications.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.jobs?.title || 'Position'}</h4>
                        <span className="text-xs text-slate-500">@ {app.jobs?.companies?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Applied {formatDate(app.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {app.match_score}%
                      </div>
                      <Badge variant={statusVariant[app.status] || 'default'}>{app.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interviews */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Upcoming Interviews</h3>
              <Link href="/dashboard/candidate/interviews" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                View all
              </Link>
            </div>
            {interviewingCount === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No interviews scheduled yet</p>
            ) : (
              <div className="space-y-2">
                {applications.filter((a: any) => a.status === 'INTERVIEWING').map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{a.jobs?.title}</p>
                      <p className="text-[10px] text-slate-400">{a.jobs?.companies?.name}</p>
                    </div>
                    <Badge variant="brand" className="ml-auto">Interviewing</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <ProfileCompletion
            completion={profile?.profile_completion || 0}
            checks={completionChecks}
          />
          <ATSScore score={profile?.ats_score} />

          {/* Activity Feed */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-500" /> Recent Activity
            </h4>
            <ActivityFeed items={activityFeed} />
          </div>

          {/* Quick Links */}
          <div className="p-5 rounded-2xl glass-panel space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h4>
            <div className="space-y-1.5">
              {[
                { href: '/dashboard/candidate/profile', icon: Edit, label: 'Edit Profile & Resume' },
                { href: '/dashboard/candidate/saved', icon: Bookmark, label: 'Saved Jobs' },
                { href: '/dashboard/candidate/ai-history', icon: Sparkles, label: 'AI History' },
                { href: '/jobs', icon: Briefcase, label: 'Browse All Jobs' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
