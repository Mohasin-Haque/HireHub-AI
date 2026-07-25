import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
  if (!min && !max) return 'Salary Undisclosed';
  const symbol = currency === 'USD' ? '$' : currency;

  const fmt = (num: number) => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}k`;
    }
    return num.toLocaleString();
  };

  if (min && max) {
    return `${symbol}${fmt(min)} - ${symbol}${fmt(max)}`;
  }
  if (min) return `From ${symbol}${fmt(min)}`;
  return `Up to ${symbol}${fmt(max!)}`;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
