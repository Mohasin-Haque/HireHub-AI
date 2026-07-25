'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job, Application } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { formatSalary } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  Eye,
  PlusCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    setJobs(HireHubStore.getJobs());
    setApplications(HireHubStore.getApplications());
  }, []);

  const totalViews = jobs.reduce((acc, j) => acc + j.viewsCount, 0);
  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE').length;

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job listing?')) {
      HireHubStore.deleteJob(id);
      setJobs(HireHubStore.getJobs());
      toast.success('Job deleted successfully');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: Job['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    HireHubStore.updateJob(id, { status: nextStatus });
    setJobs(HireHubStore.getJobs());
    toast.success(`Job marked as ${nextStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>Employer Portal & Talent Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-purple-200 text-sm">
            Manage your open job postings, track applicant pipelines, and generate AI specs.
          </p>
        </div>

        <Link href="/dashboard/employer/jobs/new">
          <Button variant="ai" size="lg" className="gap-2 shadow-lg">
            <PlusCircle className="w-5 h-5" />
            Post New Job (AI Assistant)
          </Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeJobsCount}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Job Postings</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{applications.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received Applications</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400">Total Views</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalViews.toLocaleString()}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Job Impressions</p>
        </div>

        <div className="p-6 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-500">AI Powered</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">88%</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg AI Candidate Match</p>
        </div>
      </div>

      {/* Main Jobs Management Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Posted Job Positions</h3>
            <p className="text-xs text-slate-500">Manage listings, edit specifications, or toggle active status</p>
          </div>

          <Link href="/dashboard/employer/applications" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <FileText className="w-4 h-4" />
            View Applications Pipeline ({applications.length})
          </Link>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{job.title}</h4>
                  <Badge variant={job.status === 'ACTIVE' ? 'success' : 'danger'}>{job.status}</Badge>
                  <Badge variant="outline">{job.workplaceType}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                  <span>•</span>
                  <span>{job.viewsCount} Views</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(job.id, job.status)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {job.status === 'ACTIVE' ? 'Mark Closed' : 'Mark Active'}
                </button>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Building2(props: any) {
  return <Briefcase {...props} />;
}
