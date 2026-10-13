import { NavLink } from 'react-router-dom';
import { Map, MessageSquare, PlusCircle, User, Bell, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export const BottomNav = () => {
  const { t } = useTranslation();
  
  const tabs = [
    { to: '/map', icon: Map, label: t('nav.map') || 'Map' },
    { to: '/feed', icon: MessageSquare, label: t('nav.feed') || 'Feed' },
    { to: '/report', icon: PlusCircle, label: t('nav.report') || 'Report', featured: true },
    { to: '/my-complaints', icon: FileText, label: t('nav.my_reports') || 'My Reports' },
    { to: '/profile', icon: User, label: t('nav.profile') || 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-line z-40 pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label, featured }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all',
              featured
                ? 'bg-slate-blue-600 text-white p-3.5 rounded-full -mt-5 shadow-lg ring-4 ring-slate-blue-50 active:scale-95'
                : isActive ? 'text-slate-blue-700 font-bold scale-105' : 'text-muted hover:text-ink'
            )}
          >
            <Icon className={cn('w-5 h-5 transition-transform', featured && 'w-6 h-6')} />
            {!featured && <span className="text-[10px] tracking-tight">{label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
