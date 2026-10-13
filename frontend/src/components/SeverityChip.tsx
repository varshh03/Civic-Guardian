import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

const STYLES = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const SeverityChip = ({ severity }: { severity: string }) => {
  const { t } = useTranslation();
  return (
    <span className={cn('chip border text-xs font-semibold', STYLES[severity as keyof typeof STYLES] || 'bg-gray-100 text-gray-700')}>
      {t(`severity.${severity}`, severity)}
    </span>
  );
};