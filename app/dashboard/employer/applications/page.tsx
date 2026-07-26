'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getJobApplications, updateApplicationStatus } from '@/lib/actions/employer';
import { formatDate } from '@/lib/utils';
import { ScheduleInterviewModal } from '@/components/interviews/ScheduleInterviewModal';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, ArrowLeft, FileText, Calendar, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scheduleModal, setScheduleModal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    getJobApplications().then((data) => {
      setApplications(data);
      setFiltered(data);
      setIsLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = applications;
    if (statusFilter) result = result.filter((a: any) => a.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((a: any) =>
        a.profiles?.full_name?.toLowerCase().includes(s) ||
        a.jobs?.title?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, applications]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateApplicationStatus(id, status);
      toast.success(`Status updated to ${status}`);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Job', 'Status', 'Match Score', 'Applied Date'],
      ...filtered.map((a: any) => [
        a.profiles?.full_name || '',
        '',
        a.jobs?.title || '',
        a.status,
        a.match_score || '',
        formatDate(a.created_at),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'applicants.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/employer" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Applications Pipeline</h1>
            <p className="text-xs text-slate-500">Review applicants, update status, and schedule interviews</p>
          </div>
          <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            {filtered.length} Applicants
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-slate-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">No applications found</div>
          ) : (
            filtered.map((app: any) => (
              <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Link href={`/dashboard/employer/applications/${app.id}`} className="flex items-start gap-4 group">
                    <Image
                      src={app.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={app.profiles?.full_name || 'Candidate'}
                      width={48} height={48}
                      className="w-12 h-12 rounded-xl object-cover border border-brand-500/30 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600">{app.profiles?.full_name || 'Candidate'}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Applied for: <strong className="text-slate-800 dark:text-slate-200">{app.jobs?.title}</strong></span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{app.profiles?.headline}</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {app.match_score}% Match
                    </div>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setScheduleModal(app)}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule
                    </Button>
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cover Letter</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-slate-400">Submitted {formatDate(app.created_at)}</span>
                  {app.resume_url && (
                    <a href={app.resume_url} target="_blank" rel="noreferrer" className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                      <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {scheduleModal && (
        <ScheduleInterviewModal
          isOpen={!!scheduleModal}
          onClose={() => setScheduleModal(null)}
          applicationId={scheduleModal.id}
          jobId={scheduleModal.job_id}
          candidateId={scheduleModal.candidate_id}
          candidateName={scheduleModal.profiles?.full_name || 'Candidate'}
          jobTitle={scheduleModal.jobs?.title || 'Position'}
          onSuccess={load}
        />
      )}
    </div>
  );
}
