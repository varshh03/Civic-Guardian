const fs = require('fs');

const LanguageToggle = `import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const toggle = (l: string) => {
    i18n.changeLanguage(l);
    localStorage.setItem('civic_lang', l);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-blue-50 rounded-lg p-1 border border-line">
      <button
        onClick={() => toggle('ta')}
        className={\`px-2.5 py-1 rounded-md text-xs font-medium transition-colors \${
          lang === 'ta' ? 'bg-slate-blue-600 text-white' : 'text-muted hover:text-ink'
        }\`}
      >
        தமிழ்
      </button>
      <button
        onClick={() => toggle('en')}
        className={\`px-2.5 py-1 rounded-md text-xs font-medium transition-colors \${
          lang === 'en' ? 'bg-slate-blue-600 text-white' : 'text-muted hover:text-ink'
        }\`}
      >
        EN
      </button>
    </div>
  );
};`;

const SeverityChip = `import { useTranslation } from 'react-i18next';
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
      {t(\`severity.\${severity}\`, severity)}
    </span>
  );
};`;

const StatusChip = `import { useTranslation } from 'react-i18next';
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
      {t(\`status.\${status}\`, status)}
    </span>
  );
};`;

const TypeIcon = `import { Construction, Droplets, Lightbulb } from 'lucide-react';

const ICONS = {
  pothole: Construction,
  water_leak: Droplets,
  streetlight: Lightbulb,
};

const COLORS = {
  pothole: 'text-orange-600',
  water_leak: 'text-blue-600',
  streetlight: 'text-yellow-600',
};

export const TypeIcon = ({ type, className = 'w-5 h-5' }: { type: string; className?: string }) => {
  const Icon = ICONS[type as keyof typeof ICONS] || Construction;
  const color = COLORS[type as keyof typeof COLORS] || 'text-gray-600';
  return <Icon className={\`\${className} \${color}\`} />;
};`;

const StatusTimeline = `import { useTranslation } from 'react-i18next';
import { Check, Clock, X } from 'lucide-react';
import { formatDate } from '../lib/format';

interface HistoryEntry { status: string; at: string; by: string; note: string; }

const STATUS_ICONS: Record<string, typeof Check> = {
  Submitted: Clock,
  Acknowledged: Check,
  'In Progress': Clock,
  Resolved: Check,
  Rejected: X,
};

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'bg-slate-blue-100 text-slate-blue-700 border-slate-blue-300',
  Acknowledged: 'bg-blue-100 text-blue-700 border-blue-300',
  'In Progress': 'bg-violet-100 text-violet-700 border-violet-300',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300',
};

export const StatusTimeline = ({ history }: { history: HistoryEntry[] }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const Icon = STATUS_ICONS[entry.status] || Clock;
        const isLast = i === history.length - 1;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={\`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 \${STATUS_COLORS[entry.status] || 'bg-gray-100 text-gray-600 border-gray-300'}\`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-line my-1" />}
            </div>
            <div className="pb-5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-ink">{t(\`status.\${entry.status}\`, entry.status)}</span>
                <span className="text-xs text-muted">{formatDate(entry.at, i18n.language)}</span>
              </div>
              {entry.note && <p className="text-xs text-muted mt-0.5">{entry.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};`;

fs.writeFileSync('src/components/LanguageToggle.tsx', LanguageToggle);
fs.writeFileSync('src/components/SeverityChip.tsx', SeverityChip);
fs.writeFileSync('src/components/StatusChip.tsx', StatusChip);
fs.writeFileSync('src/components/TypeIcon.tsx', TypeIcon);
fs.writeFileSync('src/components/StatusTimeline.tsx', StatusTimeline);
