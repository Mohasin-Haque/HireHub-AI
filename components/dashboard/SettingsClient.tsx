'use client';

import { useState, useTransition } from 'react';
import { updateNotificationPreferences } from '@/lib/actions/shared';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface SettingsClientProps {
  initialPreferences: Record<string, boolean>;
}

const PREFERENCE_DEFINITIONS = [
  { key: 'application_updates', label: 'Application Status Updates', description: 'Get notified when an employer reviews your application.' },
  { key: 'new_messages', label: 'New Messages', description: 'Receive an alert for new messages in your inbox.' },
  { key: 'new_jobs_saved_search', label: 'New Jobs Matching Saved Search', description: 'Get daily/weekly digests for new jobs that match your saved searches.' },
  { key: 'interview_scheduled', label: 'Interview Scheduled', description: 'Notification when an interview is scheduled, rescheduled, or cancelled.' },
];

export function SettingsClient({ initialPreferences }: SettingsClientProps) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: string, checked: boolean): void => {
    setPrefs(current => ({ ...current, [key]: checked }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateNotificationPreferences(prefs);
        toast.success('Notification preferences saved!');
      } catch {
        toast.error('Failed to save preferences.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
      <div className="space-y-4">
        {PREFERENCE_DEFINITIONS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
            <Switch
              checked={prefs[key] !== false} // Default to true if not set
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
          </div>
        ))}
      </div>
      <div className="pt-4 flex justify-end border-t border-slate-200 dark:border-slate-800">
        <Button onClick={handleSave} isLoading={isPending} variant="primary" className="gap-2">
          <Save className="w-4 h-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
