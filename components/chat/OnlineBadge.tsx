'use client';

import { cn } from '@/lib/utils';

interface OnlineBadgeProps {
  isOnline: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function OnlineBadge({ isOnline, className, size = 'sm' }: OnlineBadgeProps) {
  return (
    <span
      className={cn(
        'absolute rounded-full border-2 border-white dark:border-slate-900',
        size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5',
        isOnline ? 'bg-emerald-500' : 'bg-slate-400',
        className
      )}
    />
  );
}
