'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAdminStats, getAllUsers, updateUserRole, moderateJob, getFeatureFlags, toggleFeatureFlag, getAuditLogs } from '@/lib/actions/admin';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Building2, Sparkles, Shield, Search, ToggleLeft, ToggleRight, Activity } from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Overview', 'Users', 'Jobs', 'Feature Flags', 'Audit Logs'] as const;
type Tab = typeof TABS[number];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const [s, u, f, logs] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getFeatureFlags(),
        getAuditLogs(50),
      ]);
      setStats(s);
      setUsers(u);
      setFlags(f);
      setAuditLogs(logs);
    });
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = search
    ? users.filter((u: any) => u.email.toLowerCase().includes(search.toLowerCase()) || u.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      toast.success('Role updated');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    try {
      await toggleFeatureFlag(key, !enabled);
      toast.success(`Feature flag ${!enabled ? 'enabled' : 'disabled'}`);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-purple-300" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-extrabold">Platform Administration</h1>
        <p className="text-slate-300 text-sm mt-1">Manage users, jobs, feature flags, and platform health</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Users', value: stats.users.length, color: 'brand' },
              { icon: Building2, label: 'Companies', value: stats.companies.length, color: 'purple' },
              { icon: Briefcase, label: 'Jobs Posted', value: stats.jobs.length, color: 'cyan' },
              { icon: Sparkles, label: 'AI Generations', value: stats.aiHistory.length, color: 'emerald' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-5 rounded-2xl glass-panel space-y-2">
                <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500 w-fit`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Users by Role</h4>
              {['CANDIDATE', 'EMPLOYER', 'ADMIN'].map((role) => (
                <div key={role} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{role}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.users.filter((u: any) => u.role === role).length}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl glass-panel space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Jobs by Status</h4>
              {['ACTIVE', 'DRAFT', 'CLOSED'].map((status) => (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{status}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.jobs.filter((j: any) => j.status === status).length}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl glass-panel space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Applications</h4>
              {['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].map((status) => (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{status}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {stats.applications.filter((a: any) => a.status === status).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'Users' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filteredUsers.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.profiles?.full_name || u.email}</p>
                  <p className="text-xs text-slate-400">{u.email} · {formatDate(u.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'EMPLOYER' ? 'brand' : 'default'}>{u.role}</Badge>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                  >
                    <option value="CANDIDATE">CANDIDATE</option>
                    <option value="EMPLOYER">EMPLOYER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {activeTab === 'Feature Flags' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Feature Flags</h3>
            <p className="text-xs text-slate-400">Toggle platform features without deployment</p>
          </div>
          {flags.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No feature flags configured</p>
          ) : (
            <div className="space-y-2">
              {flags.map((flag: any) => (
                <div key={flag.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{flag.key}</p>
                    <p className="text-xs text-slate-400">Updated {formatDate(flag.updated_at)}</p>
                  </div>
                  <button onClick={() => handleToggleFlag(flag.key, flag.enabled)} className={`flex items-center gap-1.5 text-xs font-semibold ${flag.enabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {flag.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'Audit Logs' && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-500" /> Audit Logs
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-[10px] text-slate-400">{log.users?.email} · {formatDate(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs tab */}
      {activeTab === 'Jobs' && stats && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Job Moderation</h3>
          <div className="space-y-2">
            {stats.jobs.slice(0, 20).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.id}</p>
                  <p className="text-xs text-slate-400">{formatDate(job.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === 'ACTIVE' ? 'success' : 'warning'}>{job.status}</Badge>
                  <button
                    onClick={async () => { await moderateJob(job.id, job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'); load(); }}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {job.status === 'ACTIVE' ? 'Close' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
