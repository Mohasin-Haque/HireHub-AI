import { Suspense } from 'react';
import Link from 'next/link';
import { getProfile } from '@/lib/actions/candidate';
import { getCareerRecommendationsWithHistory, getCompanyRecommendationsWithHistory } from '@/lib/actions/ai';
import { ArrowLeft, BrainCircuit, Lightbulb, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function CareerRecs() {
  const profile = await getProfile();
  if (!profile) return <NoProfile />;
  const data = await getCareerRecommendationsWithHistory(profile);
  const recommendations = (data as any).recommendations || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((rec: any, i: number) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">{rec.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">{rec.reason}</p>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Skills:</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {(rec.suggestedSkills || []).map((skill: string) => (
                  <span key={skill} className="px-2 py-1 text-xs font-medium rounded-md bg-purple-500/10 text-purple-300">{skill}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function CompanyRecs() {
  const profile = await getProfile();
  if (!profile) return <NoProfile />;
  const data = await getCompanyRecommendationsWithHistory(profile);
  const companies = (data as any).companies || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((rec: any, i: number) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">{rec.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-300">{rec.reason}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NoProfile() {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold">Complete Your Profile</h3>
      <p className="text-sm text-slate-500">We need more information to generate recommendations.</p>
      <Link href="/dashboard/candidate/profile" className="mt-4 inline-block text-sm font-bold text-brand-600">
        Go to Profile
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3" /></CardHeader>
          <CardContent><div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" /></CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/candidate" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">AI Recommendations</h1>
          <p className="mt-1 text-sm text-slate-500">Personalized suggestions based on your unique profile and skills.</p>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Career Paths</h2>
          <Suspense fallback={<Skeleton />}>
            <CareerRecs />
          </Suspense>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recommended Companies</h2>
          <Suspense fallback={<Skeleton />}>
            <CompanyRecs />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
