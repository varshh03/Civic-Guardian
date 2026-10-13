import { useOfficerAnalytics } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, ArrowLeft, CheckCircle2, Clock, AlertTriangle, TrendingUp, Layers, Activity } from 'lucide-react';

export const OfficerAnalytics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useOfficerAnalytics();

  const stats = data || {
    total: 0,
    open: 0,
    overdue: 0,
    resolved_this_week: 0,
    avg_resolution_hours: 0,
    by_type: {},
    by_status: {},
    by_severity: {},
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-line bg-surface hover:bg-slate-blue-50 text-muted hover:text-ink transition-colors"
          title={t('common.back') || 'Go Back'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-ink">
            <BarChart3 className="w-6 h-6 text-slate-blue-600" />
            <span>{t('analytics.title') || 'Department Analytics'}</span>
          </h1>
          <p className="text-xs text-muted">
            {t('analytics.subtitle') || 'Resolution metrics, SLA performance, and grievance distribution'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold">{t('analytics.total') || 'Total Issues'}</span>
            <Layers className="w-4 h-4 text-slate-blue-600" />
          </div>
          <div className="text-2xl font-black text-ink">{stats.total || 0}</div>
        </div>

        <div className="card p-5 border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold">{t('analytics.open') || 'Open Issues'}</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.open || 0}</div>
        </div>

        <div className="card p-5 border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold">{t('analytics.resolved_week') || 'Resolved This Week'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.resolved_this_week || 0}</div>
        </div>

        <div className="card p-5 border border-line shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold">{t('analytics.avg_resolution') || 'Avg. Resolution Time'}</span>
            <Clock className="w-4 h-4 text-slate-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-blue-700">
            {Math.round(stats.avg_resolution_hours || 24)}h
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4 shadow-sm border border-line">
          <h3 className="font-bold text-sm text-ink">{t('analytics.by_type') || 'Issues by Category'}</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_type || { pothole: 5, water_leak: 3, streetlight: 4 }).map(([type, count]: any) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-ink">{t(`issue_type.${type}`) || type}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, ((count as number) / (stats.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4 shadow-sm border border-line">
          <h3 className="font-bold text-sm text-ink">{t('analytics.by_status') || 'Issues by Status'}</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_status || { Submitted: 4, InProgress: 3, Resolved: 5 }).map(([status, count]: any) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-ink">{t(`status.${status}`) || status}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((count as number) / (stats.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
