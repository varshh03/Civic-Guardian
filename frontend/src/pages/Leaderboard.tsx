import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../api/hooks';
import { Trophy, Medal, ArrowLeft, Award, CheckCircle, ThumbsUp, FileText, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Leaderboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'month' | 'all'>('month');
  const { data, isLoading } = useLeaderboard(period);

  const rawUsers = Array.isArray(data) ? data : data?.users || [];
  const users = rawUsers.map((u: any) => ({
    id: u.user_id || u.id,
    name: u.name || 'Citizen',
    points: u.points || 0,
    badges: u.badges || [],
    total_reports: u.total_reports || 0,
    resolved_count: u.resolved_count || 0,
    supports_received: u.supports_received || 0,
  }));

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
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
              <Trophy className="text-amber-500 w-7 h-7" />
              {t('nav.leaderboard') || 'Citizen Leaderboard'}
            </h1>
            <p className="text-xs text-muted">
              {t('leaderboard.subtitle') || 'Top active citizens improving Karur municipality'}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-1 border border-line flex text-xs shadow-sm">
          <button
            onClick={() => setPeriod('month')}
            className={cn(
              "px-3.5 py-1.5 rounded-md font-semibold transition-all",
              period === 'month'
                ? "bg-slate-blue-600 text-white shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {t('leaderboard.this_month') || 'This Month'}
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={cn(
              "px-3.5 py-1.5 rounded-md font-semibold transition-all",
              period === 'all'
                ? "bg-slate-blue-600 text-white shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            {t('leaderboard.all_time') || 'All Time'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 flex flex-col items-center justify-center gap-3 text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-slate-blue-600" />
          <p className="text-sm font-medium">{t('leaderboard.loading') || 'Loading citizen rankings...'}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-muted space-y-3">
          <Trophy className="w-12 h-12 mx-auto text-slate-300" />
          <p className="font-semibold">{t('leaderboard.no_data') || 'No rankings available for this period yet.'}</p>
        </div>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {topThree.map((user: any, index: number) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "card p-5 flex flex-col items-center text-center relative transition-all hover:shadow-card-hover",
                      isFirst
                        ? "border-amber-300 bg-gradient-to-b from-amber-50/50 to-white sm:-mt-2 shadow-md order-first sm:order-2"
                        : rank === 2
                        ? "border-slate-300 bg-gradient-to-b from-slate-50/40 to-white sm:order-1"
                        : "border-amber-700/30 bg-gradient-to-b from-orange-50/30 to-white sm:order-3"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md font-bold text-sm",
                        isFirst
                          ? "bg-amber-500 text-white ring-4 ring-amber-100"
                          : rank === 2
                          ? "bg-slate-400 text-white ring-4 ring-slate-100"
                          : "bg-amber-700 text-white ring-4 ring-amber-50"
                      )}
                    >
                      {isFirst ? <Medal className="w-6 h-6" /> : `#${rank}`}
                    </div>

                    <div className="w-14 h-14 rounded-full bg-slate-blue-100 text-slate-blue-800 flex items-center justify-center font-bold text-lg mb-2 shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <h3 className="font-bold text-ink text-base line-clamp-1">{user.name}</h3>
                    
                    <div className="inline-flex items-center gap-1 text-slate-blue-700 font-extrabold text-lg mt-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>{user.points} {t('common.points') || 'pts'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-line/60 text-[11px] text-muted">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-ink">{user.total_reports}</span>
                        <span>{t('leaderboard.reports') || 'Reports'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-600">{user.resolved_count}</span>
                        <span>{t('status.Resolved') || 'Resolved'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="card overflow-hidden shadow-sm border border-line">
            <div className="px-5 py-3.5 bg-slate-blue-50/70 border-b border-line flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-blue-900">
                {t('leaderboard.all_rankings') || 'All Rankings'}
              </span>
              <span className="text-xs text-muted">
                {users.length} {t('leaderboard.participants') || 'Citizens'}
              </span>
            </div>

            <div className="divide-y divide-line">
              {users.map((user: any, idx: number) => {
                const rank = idx + 1;
                return (
                  <div
                    key={user.id}
                    className="p-4 flex items-center gap-4 hover:bg-slate-blue-50/40 transition-colors"
                  >
                    <div className="w-8 text-center font-bold text-sm text-muted flex-shrink-0">
                      {rank === 1 ? (
                        <span className="text-amber-500 font-extrabold text-base">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-slate-400 font-extrabold text-base">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-amber-700 font-extrabold text-base">🥉</span>
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-blue-100 text-slate-blue-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink truncate">{user.name}</div>
                      <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {user.total_reports} {t('leaderboard.reports') || 'reports'}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> {user.resolved_count} {t('status.Resolved') || 'resolved'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-extrabold text-sm text-slate-blue-700">{user.points}</span>
                      <span className="text-xs text-muted ml-1">{t('common.points') || 'pts'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
