'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getEmployerJobs, deleteJob, updateJob, duplicateJob, getEmployerAnalytics } from '@/lib/actions/employer';
import { getActivityFeed } from '@/lib/actions/shared';
import { formatSalary } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyTrendChart, HiringFunnelChart } from '@/components/analytics/HiringCharts';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import {
  Briefcase, Users, Eye, PlusCircle, Sparkles, Trash2,
  TrendingUp, FileText, Building2, BarChart2, Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const load = useCallback(() => {
    Promise.all([
      getEmployerJobs(statusFilter).catch(() => []),
      getEmployerAnalytics().catch(() => null),
      getActivityFeed(8).catch(() => []),
    ]).then(([j, a, feed]) => {
      setJobs(j);
      setAnalytics(a);
      setActivityFeed(feed);
    });
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job listing?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateJob(id);
      toast.success('Job duplicated as draft');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await updateJob(id, { status: next });
      toast.success(`Job marked as ${next}`);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const STATUS_FILTERS = ['ACTIVE', 'DRAFT', 'CLOSED', 'ARCHIVED', 'EXPIRED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>Employer Portal & Talent Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-purple-200 text-sm">Manage postings, track pipelines, and generate AI specs.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/employer/company">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 gap-1.5">
              <Building2 className="w-4 h-4" /> Company Profile
            </Button>
          </Link>
          <Link href="/dashboard/employer/jobs/new">
            <Button variant="ai" size="lg" className="gap-2 shadow-lg">
              <PlusCircle className="w-5 h-5" /> Post New Job (AI)
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, color: 'brand', label: 'Active Jobs', value: analytics?.activeJobs ?? 0, badge: 'Live' },
          { icon: Users, color: 'purple', label: 'Applications', value: analytics?.totalApplications ?? 0, badge: '+12%' },
          { icon: Eye, color: 'cyan', label: 'Total Views', value: (analytics?.totalViews ?? 0).toLocaleString(), badge: 'Impressions' },
          { icon: Sparkles, color: 'emerald', label: 'Avg Match', value: '88%', badge: 'AI Powered' },
        ].map(({ icon: Icon, color, label, value, badge }) => (
          <div key={label} className="p-5 rounded-2xl glass-panel space-y-2">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-500">{badge}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main jobs section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs Management */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Job Postings</h3>
                <p className="text-xs text-slate-500">Manage listings, edit specs, or toggle status</p>
              </div>
              <Link href="/dashboard/employer/applications" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <FileText className="w-4 h-4" /> Applications ({analytics?.totalApplications ?? 0})
              </Link>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {jobs.length === 0 && !analytics ? (
                <div className="text-center py-8 text-sm text-slate-400">Loading...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-slate-400">No {statusFilter.toLowerCase()} jobs.</p>
                  <Link href="/dashboard/employer/jobs/new">
                    <Button variant="primary" size="sm">Post a Job</Button>
                  </Link>
                </div>
              ) : (
                jobs.map((job: any) => (
                  <div key={job.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                        <Badge variant={job.status === 'ACTIVE' ? 'success' : job.status === 'DRAFT' ? 'warning' : 'danger'}>
                          {job.status}
                        </Badge>
                        <Badge variant="outline">{job.workplace_type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                        <span>•</span>
                        <span>{job.views_count || 0} views</span>
                        <span>•</span>
                        <span>{job.applications?.[0]?.count || 0} applicants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {job.status === 'ACTIVE' ? 'Close' : 'Activate'}
                      </button>
                      <Link href={`/dashboard/employer/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <button onClick={() => handleDuplicate(job.id)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Duplicate as draft">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analytics Charts */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl glass-panel space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-500" /> Weekly Trend
                </h4>
                <WeeklyTrendChart data={analytics.weeklyTrend} />
              </div>
              <div className="p-5 rounded-2xl glass-panel space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-500" /> Hiring Funnel
                </h4>
                <HiringFunnelChart funnel={analytics.funnel} />
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Funnel stats */}
          {analytics && (
            <div className="p-5 rounded-2xl glass-panel space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Summary</h4>
              {[
                { label: 'Total Applied', value: analytics.funnel.total, color: 'text-slate-700 dark:text-slate-200' },
                { label: 'Reviewing', value: analytics.funnel.reviewing, color: 'text-brand-600 dark:text-brand-400' },
                { label: 'Interviewing', value: analytics.funnel.interviewing, color: 'text-cyan-600 dark:text-cyan-400' },
                { label: 'Shortlisted', value: analytics.funnel.shortlisted, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Accepted', value: analytics.funnel.accepted, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Rejected', value: analytics.funnel.rejected, color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-5 rounded-2xl glass-panel space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h4>
            <div className="space-y-1.5">
              {[
                { href: '/dashboard/employer/company', icon: Building2, label: 'Edit Company Profile' },
                { href: '/dashboard/employer/applications', icon: Users, label: 'Review Applications' },
                { href: '/dashboard/employer/interviews', icon: FileText, label: 'Manage Interviews' },
                { href: '/dashboard/employer/ai-history', icon: Sparkles, label: 'AI History' },
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

          {/* Activity Feed */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h4>
            <ActivityFeed items={activityFeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
