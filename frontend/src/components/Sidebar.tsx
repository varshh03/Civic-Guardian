import { NavLink } from 'react-router-dom';
import { Map, MessageSquare, FileText, User, Trophy, Bell, LayoutDashboard, BarChart3, Users, PlusCircle, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const citizenLinks = [
    { to: '/map', icon: Map, label: t('nav.home') },
    { to: '/feed', icon: MessageSquare, label: t('nav.feed') },
    { to: '/report', icon: PlusCircle, label: t('nav.report') },
    { to: '/my-complaints', icon: FileText, label: t('nav.my_reports') || 'My Reports' },
    { to: '/leaderboard', icon: Trophy, label: t('nav.leaderboard') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const officerLinks = [
    { to: '/officer/queue', icon: LayoutDashboard, label: t('nav.officer_queue') },
    { to: '/officer/analytics', icon: BarChart3, label: t('nav.analytics') },
    ...citizenLinks,
  ];

  const adminLinks = [
    ...officerLinks,
    { to: '/admin/users', icon: Users, label: t('nav.admin_users') },
    { to: '/admin/departments', icon: Building2, label: t('nav.admin_departments') || 'Departments' },
  ];


  const links = user?.role === 'admin' ? adminLinks : user?.role === 'officer' ? officerLinks : citizenLinks;

  return (
    <nav className="card p-2 space-y-0.5 sticky top-20">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-slate-blue-600 text-white'
              : 'text-muted hover:bg-slate-blue-50 hover:text-ink'
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
