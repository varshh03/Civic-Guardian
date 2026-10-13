import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useFeed } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { ComplaintCard } from '../components/ComplaintCard';
import { MapPin, TrendingUp, Clock, Users, ArrowLeft, PlusCircle, Search, RefreshCw, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { KARUR_CENTER } from '../lib/geo';

const DEPT_ISSUE_TYPES: Record<string, string[]> = {
  'dept-roads': ['pothole'],
  'dept-water': ['water_leak'],
  'dept-electric': ['streetlight'],
};

export const Feed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('latest');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isOfficer = user?.role === 'officer' && !!user?.department_id;
  const officerDeptId = isOfficer ? user.department_id : null;
  const departmentName = officerDeptId ? (t(`department.${officerDeptId}`) || officerDeptId) : '';

  const availableTypes = useMemo(() => {
    if (isOfficer && officerDeptId && DEPT_ISSUE_TYPES[officerDeptId]) {
      return DEPT_ISSUE_TYPES[officerDeptId];
    }
    return ['pothole', 'water_leak', 'streetlight'];
  }, [isOfficer, officerDeptId]);
  
  const { data, isLoading, refetch, isRefetching } = useFeed(
    tab,
    KARUR_CENTER[0],
    KARUR_CENTER[1],
    typeFilter === 'all' ? undefined : typeFilter
  );
  
  const rawItems = data?.items || [];
  const items = searchQuery.trim()
    ? rawItems.filter(c =>
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.id || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawItems;

  const tabs = [
    { id: 'latest', icon: Clock, label: t('feed.tab_latest') || 'Latest' },
    { id: 'trending', icon: TrendingUp, label: t('feed.tab_trending') || 'Trending' },
    { id: 'nearby', icon: MapPin, label: t('feed.tab_nearby') || 'Nearby' },
    { id: 'following', icon: Users, label: t('feed.tab_following') || 'Following' }
  ];

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{t('feed.title') || 'Community Feed'}</h1>
              {isOfficer && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-blue-100 text-slate-blue-700 border border-slate-blue-200">
                  {departmentName}
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{t('app.tagline') || 'Spot it. Report it. Track it.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 rounded-lg border border-line bg-surface hover:bg-slate-blue-50 text-muted hover:text-ink transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={cn("w-4 h-4", (isLoading || isRefetching) && "animate-spin text-slate-blue-600")} />
          </button>
          <Link to="/report" className="btn-primary h-9 px-3 text-xs flex items-center gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.report') || 'Report'}</span>
          </Link>
        </div>
      </div>

      {isOfficer && (
        <div className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-blue-50 border border-slate-blue-200 text-slate-blue-900 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-slate-blue-600 text-white flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-blue-950">
              {t('feed.officer_banner') || 'Concurrent Department Feed'}
            </p>
            <p className="text-[11px] text-slate-blue-700 mt-0.5">
              {t('feed.officer_banner_desc', { dept: departmentName }) || `Filtered exclusively to your department (${departmentName})`}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('feed.search_placeholder') || 'Search issues, locations, IDs...'}
            className="input w-full pl-9 text-xs h-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="input text-xs h-9 w-36"
        >
          <option value="all">{t('officer.all_types') || 'All Types'}</option>
          {availableTypes.includes('pothole') && (
            <option value="pothole">{t('issue_type.pothole') || 'Road Damage'}</option>
          )}
          {availableTypes.includes('water_leak') && (
            <option value="water_leak">{t('issue_type.water_leak') || 'Water Leak'}</option>
          )}
          {availableTypes.includes('streetlight') && (
            <option value="streetlight">{t('issue_type.streetlight') || 'Streetlight'}</option>
          )}
        </select>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs",
              tab === id
                ? "bg-slate-blue-600 text-white shadow-sm"
                : "bg-surface text-muted border border-line hover:bg-slate-blue-50 hover:text-ink"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-card border border-line" />
          ))
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-muted space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-blue-50 text-slate-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">{t('feed.empty_title') || 'No reports found here'}</p>
              <p className="text-xs text-muted mt-1">{t('feed.empty_desc') || 'Be the first to report an issue in your area.'}</p>
            </div>
            <Link to="/report" className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 mt-2">
              <PlusCircle className="w-4 h-4" /> {t('report.title') || 'Report an Issue'}
            </Link>
          </div>
        ) : (
          items.map(c => <ComplaintCard key={c.id} complaint={c} />)
        )}
      </div>
    </div>
  );
};
