'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  entity?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

const actionLabel: Record<string, { icon: string; label: string }> = {
  applied_job: { icon: '📤', label: 'Applied to a job' },
  bookmarked_job: { icon: '🔖', label: 'Saved a job' },
  updated_profile: { icon: '✏️', label: 'Updated profile' },
  uploaded_resume: { icon: '📄', label: 'Uploaded resume' },
  viewed_job: { icon: '👁️', label: 'Viewed a job' },
  interview_scheduled: { icon: '📅', label: 'Interview scheduled' },
  application_status: { icon: '🔄', label: 'Application status changed' },
  posted_job: { icon: '📋', label: 'Posted a new job' },
  updated_company: { icon: '🏢', label: 'Updated company profile' },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (!items.length) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const meta = actionLabel[item.action] || { icon: '⚡', label: item.action };
        return (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-base shrink-0 mt-0.5">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{meta.label}</p>
              {item.metadata?.title && (
                <p className="text-xs text-slate-500 truncate">{item.metadata.title}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(item.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
