import React from 'react';
import Image from 'next/image';

export function CompanyLogos() {
  const companies = [
    { name: 'Vercel', logo: 'https://avatar.vercel.sh/vercel?text=Vercel' },
    { name: 'Stripe', logo: 'https://avatar.vercel.sh/stripe?text=Stripe' },
    { name: 'Linear', logo: 'https://avatar.vercel.sh/linear?text=Linear' },
    { name: 'OpenAI', logo: 'https://avatar.vercel.sh/openai?text=OpenAI' },
    { name: 'Supabase', logo: 'https://avatar.vercel.sh/supabase?text=Supabase' },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Trusted by Engineering Teams at Leading Companies
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
          {companies.map((comp) => (
            <div key={comp.name} className="flex items-center gap-2.5 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <Image src={comp.logo} alt={comp.name} width={32} height={32} className="w-8 h-8 rounded-lg" />
              <span className="font-extrabold text-lg text-slate-700 dark:text-slate-200 tracking-tight">
                {comp.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
