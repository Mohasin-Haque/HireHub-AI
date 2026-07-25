'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Application } from '@/lib/db/mock-data';
import { HireHubStore } from '@/lib/db/store';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import {
  Sparkles,
  ExternalLink,
  Mail,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    setApplications(HireHubStore.getApplications());
  }, []);

  const handleStatusChange = (id: string, newStatus: Application['status']) => {
    HireHubStore.updateApplicationStatus(id, newStatus);
    setApplications(HireHubStore.getApplications());
    toast.success(`Application status updated to ${newStatus}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/employer"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employer Dashboard
        </Link>
      </div>

      <div className="p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Candidate Applications Pipeline
            </h1>
            <p className="text-xs text-slate-500">
              Review applicant resumes, cover letters, AI match scores, and advance candidates through interview stages.
            </p>
          </div>

          <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            {applications.length} Total Applicants
          </span>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Image
                    src={app.candidateAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={app.candidateName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover border border-brand-500/30 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{app.candidateName}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {app.candidateEmail}
                      <span>•</span>
                      <span>Applied for: <strong className="text-slate-800 dark:text-slate-200">{app.jobTitle}</strong></span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{app.candidateHeadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>AI Match Score: {app.matchScore}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <select
                      value={app.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(app.id, e.target.value as Application['status'])}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="INTERVIEWING">Interviewing</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover letter */}
              {app.coverLetter && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cover Letter Notes</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {app.coverLetter}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-400">Submitted {formatDate(app.appliedDate)}</span>

                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  View Resume / Portfolio <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
