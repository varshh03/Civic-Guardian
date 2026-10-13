import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X, FileText, Map, MessageSquare, PlusCircle, Trophy, Bell, LayoutDashboard, BarChart3, Users, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { NotificationBell } from './NotificationBell';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import cgLogo from '../assets/cg_logo.png';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const citizenNav = [
    { to: '/map', icon: Map, label: t('nav.home') || 'Map / Home' },
    { to: '/feed', icon: MessageSquare, label: t('nav.feed') || 'Feed' },
    { to: '/report', icon: PlusCircle, label: t('nav.report') || 'Report Issue', featured: true },
    { to: '/my-complaints', icon: FileText, label: t('nav.my_reports') || 'My Reports' },
    { to: '/leaderboard', icon: Trophy, label: t('nav.leaderboard') || 'Leaderboard' },
    { to: '/notifications', icon: Bell, label: t('nav.notifications') || 'Notifications' },
    { to: '/profile', icon: User, label: t('nav.profile') || 'Profile' },
  ];

  const officerNav = [
    { to: '/officer/queue', icon: LayoutDashboard, label: t('nav.officer_queue') || 'Priority Queue' },
    { to: '/officer/analytics', icon: BarChart3, label: t('nav.analytics') || 'Analytics' },
    ...citizenNav,
  ];

  const adminNav = [
    ...officerNav,
    { to: '/admin/users', icon: Users, label: t('nav.admin_users') || 'Users' },
    { to: '/admin/departments', icon: Building2, label: t('nav.admin_departments') || 'Departments' },
  ];

  const navLinks = user?.role === 'admin' ? adminNav : user?.role === 'officer' ? officerNav : citizenNav;

  return (
    <>
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-slate-blue-50 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-blue-700" />
              </button>
            )}

            <Link to={isAuthenticated ? "/map" : "/"} className="flex items-center gap-2.5 flex-shrink-0">
              <img src={cgLogo} alt={t('app.name')} className="h-8 w-auto object-contain drop-shadow-xs" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-blue-900 text-base leading-tight">{t('app.name')}</span>
                <span className="text-[10px] text-muted font-medium hidden sm:block">{t('app.municipality')}</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-slate-blue-300 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-11 bg-surface border border-line rounded-xl shadow-xl z-50 w-52 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-line">
                        <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
                        <p className="text-[11px] text-muted truncate">{user?.email}</p>
                        <span className="mt-1 inline-block bg-slate-blue-50 text-slate-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/my-complaints"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-blue-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-blue-600" />
                        <span>{t('nav.my_reports') || 'My Reports'}</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-blue-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-blue-600" />
                        <span>{t('nav.profile') || 'Profile'}</span>
                      </Link>

                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 w-full transition-colors border-t border-line mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout') || 'Logout'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-muted hover:text-ink transition-colors px-2 py-1">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-xs h-8 px-3.5 rounded-btn inline-flex items-center shadow-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface border-r border-line shadow-2xl z-50 flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <img src={cgLogo} alt={t('app.name')} className="h-7 w-auto object-contain" />
                <span className="font-bold text-slate-blue-900 text-sm">{t('app.name')}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-slate-blue-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <div className="py-3 border-b border-line flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-ink truncate">{user.name}</div>
                  <div className="text-[11px] text-muted truncate">{user.email}</div>
                  <div className="text-[10px] text-slate-blue-600 font-bold uppercase mt-0.5">{user.role}</div>
                </div>
              </div>
            )}

            <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
              {navLinks.map(({ to, icon: Icon, label, featured }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all",
                      featured
                        ? "bg-slate-blue-600 text-white shadow-sm"
                        : isActive
                        ? "bg-slate-blue-100 text-slate-blue-900 font-bold"
                        : "text-muted hover:bg-slate-blue-50 hover:text-ink"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-line space-y-2">
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout') || 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
