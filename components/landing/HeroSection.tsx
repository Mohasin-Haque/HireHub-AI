'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Search, MapPin, ArrowRight, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-purple-600/20 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Next-Gen AI Job Search & Hiring Platform</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
          >
            Find Your Dream Job <br />
            Powered by <span className="text-gradient-ai">AI Precision</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
          >
            Connect top developers with world-class engineering teams. AI-generated job specs, smart candidate matching, and instant interview questions.
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="mt-8 p-2.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl shadow-brand-500/5 flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3.5 py-2 w-full border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-brand-500 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. Next.js, AI, Full Stack)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-3.5 py-2 w-full">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location or 'Remote'..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Popular Tag Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300">Popular:</span>
            {['React', 'Next.js', 'AI & LLMs', 'Remote', 'Full-Stack', 'Senior'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/jobs?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Feature Badges under Hero */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl glass-panel flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instant AI Matching</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Match score based on skills & bio</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verified Employers</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct hiring from tech startups</p>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Job Copilot</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">1-Click Job Description generator</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
