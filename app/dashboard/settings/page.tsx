import { Suspense } from 'react';
import { getNotificationPreferences } from '@/lib/actions/shared';
import { SettingsClient } from '@/components/dashboard/SettingsClient';
import { Bell } from 'lucide-react';

async function SettingsData() {
  const preferences = await getNotificationPreferences();
  return <SettingsClient initialPreferences={preferences} />;
}

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account and notification preferences.
          </p>
        </div>
      </header>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel">
        <Suspense fallback={<p>Loading settings...</p>}>
          <SettingsData />
        </Suspense>
      </div>
    </div>
  );
}
