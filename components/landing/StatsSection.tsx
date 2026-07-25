import React from 'react';
import { Briefcase, Building2, Users, Sparkles, TrendingUp } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { label: 'Active AI Job Listings', value: '12,450+', change: '+18% this month', icon: Briefcase, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Verified Employers', value: '2,800+', change: 'Global top tech', icon: Building2, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Active Developers', value: '150,000+', change: 'React, AI, Cloud', icon: Users, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'AI Match Accuracy', value: '96.4%', change: 'Instant skill fit', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  return (
    <section className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl glass-panel space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
