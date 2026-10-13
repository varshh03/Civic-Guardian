import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useMyComplaints } from '../api/hooks';
import { ComplaintCard } from '../components/ComplaintCard';
import { cn } from '../lib/utils';
import { RefreshCw, PlusCircle, FileText, AlertCircle, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';

export const MyComplaints = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isRefetching, refetch, error } = useMyComplaints();
  const complaints = data || [];
  const [tab, setTab] = useState<'all' | 'active' | 'resolved' | 'rejected'>('all');

  const activeComplaints = complaints.filter(c => !['Resolved', 'Rejected'].includes(c.status));
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  const rejectedComplaints = complaints.filter(c => c.status === 'Rejected');

  const filtered = tab === 'all' 
    ? complaints 
    : tab === 'active' 
    ? activeComplaints 
    : tab === 'resolved' 
    ? resolvedComplaints 
    : rejectedComplaints;

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-4">
      <div className="flex items-center justify-between gap-3">
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
              <FileText className="w-6 h-6 text-slate-blue-600" />
              <span>{t('nav.my_reports') || 'My Reports'}</span>
            </h1>
            <p className="text-xs text-muted">
              {t('profile.track_manage') || 'Track and manage all civic issues you have reported'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="btn-secondary h-9 px-3 flex items-center gap-1.5 text-xs text-muted hover:text-ink"
            title="Refresh reports"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", (isLoading || isRefetching) && "animate-spin text-slate-blue-600")} />
            <span className="hidden sm:inline">{t('common.refresh') || 'Refresh'}</span>
          </button>

          <Link
            to="/report"
            className="btn-primary h-9 px-3.5 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('report.title') || 'New Report'}</span>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'all', label: t('officer.all_statuses') || 'All', count: complaints.length, icon: FileText },
          { key: 'active', label: t('status.InProgress') || 'In Progress', count: activeComplaints.length, icon: Clock },
          { key: 'resolved', label: t('status.Resolved') || 'Resolved', count: resolvedComplaints.length, icon: CheckCircle2 },
          { key: 'rejected', label: t('status.Rejected') || 'Rejected', count: rejectedComplaints.length, icon: XCircle },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key as any)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
              tab === item.key
                ? "bg-slate-blue-600 text-white shadow-sm"
                : "bg-surface border border-line text-muted hover:bg-slate-blue-50 hover:text-ink"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                tab === item.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="card p-12 text-center text-muted space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-blue-600" />
            <p className="text-sm font-medium">{t('feed.loading') || 'Loading your submitted reports...'}</p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-red-600 space-y-3 border-red-200 bg-red-50/50">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="font-semibold text-sm">Failed to load your reports</p>
            <button onClick={() => refetch()} className="btn-secondary text-xs px-4 py-1.5">{t('common.try_again') || 'Try Again'}</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-muted space-y-4">
            <div className="w-16 h-16 bg-slate-blue-50 text-slate-blue-600 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">{t('complaint.no_complaints') || 'No reports found'}</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                {tab === 'all'
                  ? (t('complaint.no_complaints_desc') || "You haven't submitted any civic issue reports yet. Spot an issue in your area and report it!")
                  : `${t('complaint.no_complaints')} (${tab})`}
              </p>
            </div>
            {tab === 'all' && (
              <Link to="/report" className="btn-primary px-6 py-2 text-sm inline-flex items-center gap-2 shadow-sm">
                <PlusCircle className="w-4 h-4" /> {t('report.title') || 'Report an Issue'}
              </Link>
            )}
          </div>
        ) : (
          filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)
        )}
      </div>
    </div>
  );
};
