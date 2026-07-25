import React from 'react';
import { Sparkles, Bot, Target, FileCode2, HelpCircle, Layers } from 'lucide-react';

export function FeatureCards() {
  const features = [
    {
      icon: Bot,
      title: 'AI Job Description Generator',
      description: 'Generate polished, structured job specifications with key responsibilities, qualifications, and benefits in seconds.',
      badge: 'Employer Tool',
      color: 'from-brand-500 to-indigo-600',
    },
    {
      icon: Target,
      title: 'AI Title Improver & Skill Suggester',
      description: 'Optimize job titles to boost qualified applications by up to 45% with data-driven keyword suggestions.',
      badge: 'Optimization',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: HelpCircle,
      title: 'Automated Interview Questions',
      description: 'Instantly generate role-specific technical, architectural, and behavioral interview questions with evaluation metrics.',
      badge: 'Recruiting AI',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Sparkles,
      title: 'Candidate Match Scoring',
      description: 'AI algorithms calculate candidate profile-to-job match scores, saving recruiters hours of manual resume filtering.',
      badge: 'AI Matching',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: FileCode2,
      title: 'Developer Profile Builder',
      description: 'Showcase your GitHub, live projects, skills taxonomy, and resume link in a unified candidate portal.',
      badge: 'For Candidates',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Layers,
      title: 'Real-time Pipeline Analytics',
      description: 'Track application statuses from Reviewing to Interviewing to Accepted with instant toast notifications.',
      badge: 'Analytics',
      color: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Powered by Next-Gen AI
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Built for Modern Hiring & Job Seeking
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Everything you need to post jobs, evaluate candidates, and get hired faster with AI copilot assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 hover:border-brand-500/50 transition-all duration-300 group hover:-translate-y-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-lg`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  {feat.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                {feat.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
