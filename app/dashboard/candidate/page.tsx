'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Application, CandidateProfile } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Send,
  Sparkles,
  Clock,
  Briefcase,
  Edit,
} from 'lucide-react';

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setProfile(HireHubStore.getProfile());
    setApplications(HireHubStore.getApplications());
    setBookmarks(HireHubStore.getBookmarks());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Image
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={profile?.fullName || 'User'}
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-400/50 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.fullName || 'Alex'}!
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">Applications</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{applications.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted Job Applications</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Bookmark className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">Bookmarks</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{bookmarks.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Positions</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500">Strong Alignment</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">91%</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Skill Match</p>
        </div>
      </div>

      {/* Applied Jobs Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Applied Jobs Tracker</h3>
            <p className="text-xs text-slate-500">Track real-time status changes from hiring teams</p>
          </div>

          <Link href="/dashboard/candidate/saved" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
            View Saved Jobs ({bookmarks.length})
          </Link>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{app.jobTitle}</h4>
                  <span className="text-xs font-semibold text-slate-500">@ {app.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Applied {formatDate(app.appliedDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{app.matchScore}% Match</span>
                </div>

                <Badge
                  variant={
                    app.status === 'ACCEPTED'
                      ? 'success'
                      : app.status === 'INTERVIEWING'
                      ? 'brand'
                      : app.status === 'REVIEWING'
                      ? 'ai'
                      : 'warning'
                  }
                >
                  {app.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
