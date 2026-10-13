import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date, lang: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return lang === 'ta' ? 'இப்போதுதான்' : 'just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return lang === 'ta' ? `${m} நிமிடம் முன்பு` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return lang === 'ta' ? `${h} மணி முன்பு` : `${h}h ago`;
  }
  const days = Math.floor(diff / 86400);
  return lang === 'ta' ? `${days} நாட்கள் முன்பு` : `${days}d ago`;
}

export function formatDate(date: string | Date, lang: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(d);
}

export function formatNumber(n: number, lang: string = 'en'): string {
  return new Intl.NumberFormat(lang === 'ta' ? 'ta-IN' : 'en-IN').format(n);
}
