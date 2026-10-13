import { useTranslation } from 'react-i18next';
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
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[entry.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-line my-1" />}
            </div>
            <div className="pb-5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-ink">{t(`status.${entry.status}`, entry.status)}</span>
                <span className="text-xs text-muted">{formatDate(entry.at, i18n.language)}</span>
              </div>
              {entry.note && <p className="text-xs text-muted mt-0.5">{entry.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};