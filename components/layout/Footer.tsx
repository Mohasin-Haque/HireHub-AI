'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                HireHub <span className="text-gradient-ai">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The next-generation AI-powered job platform matching top tech talent with industry-leading employers effortlessly.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Candidates */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">For Candidates</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">Explore All Jobs</Link>
              </li>
              <li>
                <Link href="/jobs?workplace=REMOTE" className="hover:text-white transition-colors">Remote Jobs</Link>
              </li>
              <li>
                <Link href="/dashboard/candidate/saved" className="hover:text-white transition-colors">Saved Jobs</Link>
              </li>
              <li>
                <Link href="/dashboard/candidate/profile" className="hover:text-white transition-colors">AI Resume Optimizer</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Employers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/dashboard/employer/jobs/new" className="hover:text-white transition-colors">Post a Job (AI Generator)</Link>
              </li>
              <li>
                <Link href="/dashboard/employer" className="hover:text-white transition-colors">Employer Analytics</Link>
              </li>
              <li>
                <Link href="/dashboard/employer/applications" className="hover:text-white transition-colors">Applications Pipeline</Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">Pricing & Plans</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-slate-400">
              Subscribe to get curated high-paying remote developer job alerts directly in your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl transition-all shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireHub AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>for Software Engineers & Recruiters</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
