import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const STYLES: Record<string, string> = {
  'Submitted': 'bg-slate-blue-50 text-slate-blue-700 border-slate-blue-200',
  'Acknowledged': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-violet-50 text-violet-700 border-violet-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

export const StatusChip = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  return (
    <span className={cn('chip border text-xs font-semibold', STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200')}>
      {t(`status.${status}`, status)}
    </span>
  );
};