'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Building2, UserPlus } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 p-8 sm:p-14 text-white overflow-hidden shadow-2xl">
          {/* Ambient Glow circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Ready to transform your tech hiring experience?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Start Finding Top Talent or Your Next Dream Role Today
            </h2>

            <p className="text-brand-100 text-base sm:text-lg">
              Join thousands of software engineers and innovative tech companies already using HireHub AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                href="/dashboard/employer/jobs/new"
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-slate-900 font-extrabold text-sm rounded-xl hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-brand-600" />
                Post a Job with AI
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>

              <Link
                href="/jobs"
                className="w-full sm:w-auto px-7 py-3.5 bg-brand-900/40 hover:bg-brand-900/60 border border-white/20 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Explore Open Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
