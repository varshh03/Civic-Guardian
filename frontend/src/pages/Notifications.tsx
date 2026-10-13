import { useNotifications, useMarkAllRead, useMarkRead } from '../api/hooks';
import { Bell, CheckCircle2, ArrowLeft, Loader2, CheckCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRelativeTime, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export const Notifications = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();

  const notifs = data?.notifications || [];
  const unreadCount = notifs.filter(n => !n.read).length;

  const renderMessage = (n: any) => {
    if (n.message_key) {
      const translated = t(n.message_key, n.params || {});
      if (translated && translated !== n.message_key) return translated;
    }
    return n.message || n.message_key || 'New notification update';
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-4">
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
              <Bell className="w-6 h-6 text-slate-blue-600" />
              <span>{t('notifications.title') || 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted">
              {t('notifications.subtitle') || 'Stay updated on reports, comments, and status changes'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="btn-secondary h-8 px-3 text-xs flex items-center gap-1.5 text-slate-blue-700 hover:text-slate-blue-900"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{t('notifications.mark_all_read') || 'Mark all read'}</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="card p-12 flex flex-col items-center justify-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-slate-blue-600" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : notifs.length === 0 ? (
          <div className="card p-12 text-center text-muted flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-blue-50 text-slate-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-slate-blue-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">{t('notifications.empty') || 'No notifications yet'}</p>
              <p className="text-xs text-muted mt-0.5">You will receive updates when your reports change status.</p>
            </div>
          </div>
        ) : (
          notifs.map(n => (
            <Link
              key={n.id}
              to={n.complaint_id ? `/complaints/${n.complaint_id}` : '#'}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                "block card p-4 transition-all hover:shadow-card-hover",
                !n.read
                  ? "bg-slate-blue-50/70 border-slate-blue-300 ring-1 ring-slate-blue-200"
                  : "hover:bg-slate-blue-50/30"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-slate-blue-600" />}
                    <p className={cn("text-xs leading-snug", !n.read ? "font-bold text-ink" : "text-muted font-medium")}>
                      {renderMessage(n)}
                    </p>
                  </div>
                  {n.complaint_id && (
                    <span className="text-[11px] text-muted inline-block font-mono">
                      Ref: {n.complaint_id}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(n.created_at, i18n.language)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
