import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'VP of Engineering @ CloudScale',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      text: 'HireHub AI reduced our engineering hiring cycle from 6 weeks to just 11 days. The AI-generated job specs and candidate match scores were incredibly accurate!',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      role: 'Staff Full-Stack Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'I applied for a remote Next.js role on HireHub AI and received an interview invitation within 24 hours. The platform UX is clean, fast, and modern.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Talent @ TechFlow',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      text: 'Generating role-specific technical interview questions with 1 click was a game changer for our recruiters. Best job platform software on the market.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            User Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by Developers & Engineering Managers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-3xl glass-panel relative space-y-4">
              <Quote className="w-8 h-8 text-brand-500/20 absolute top-6 right-6" />

              <div className="flex gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, r) => (
                  <Star key={r} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <Image src={t.image} alt={t.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover border border-brand-500/30" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
