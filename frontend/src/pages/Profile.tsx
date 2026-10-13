import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfile, useMyComplaints } from '../api/hooks';
import toast from 'react-hot-toast';
import { Award, FileText, ChevronRight, PlusCircle, CheckCircle2, Clock, ArrowLeft, User, Phone, Mail, Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { data: myComplaints } = useMyComplaints();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const totalReports = myComplaints?.length || 0;
  const activeReports = myComplaints?.filter(c => !['Resolved', 'Rejected'].includes(c.status)).length || 0;
  const resolvedReports = myComplaints?.filter(c => c.status === 'Resolved').length || 0;

  const handleSave = () => {
    updateProfile.mutate({ name, phone }, {
      onSuccess: () => toast.success(t('profile.saved') || 'Profile updated successfully')
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-line bg-surface hover:bg-slate-blue-50 text-muted hover:text-ink transition-colors"
          title={t('common.back') || 'Go Back'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.profile') || 'User Profile'}</h1>
          <p className="text-xs text-muted">{t('app.municipality') || 'Karur Municipality'}</p>
        </div>
      </div>

      <div className="card p-6 flex items-center gap-5 bg-gradient-to-r from-slate-blue-600 to-slate-blue-800 text-white shadow-md">
        <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold truncate">{user.name}</h2>
          <p className="opacity-90 text-xs truncate flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{user.email}</span>
          </p>
          <div className="flex gap-2 mt-2.5 flex-wrap">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.role}
            </span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5"/> {user.points} {t('common.points') || 'pts'}
            </span>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4 shadow-sm border border-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-slate-blue-50 text-slate-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-ink">{t('nav.my_reports') || 'My Reports'}</h2>
              <p className="text-xs text-muted">
                {totalReports} {totalReports === 1 ? (t('leaderboard.report') || 'report') : (t('leaderboard.reports') || 'reports')} {t('profile.submitted') || 'submitted'}
              </p>
            </div>
          </div>
          <Link
            to="/my-complaints"
            className="btn-secondary h-8 px-3 text-xs flex items-center gap-1 text-slate-blue-600 hover:text-slate-blue-800 font-semibold"
          >
            <span>{t('complaint.view_details') || 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-line/60">
            <div className="text-lg font-extrabold text-ink">{totalReports}</div>
            <div className="text-[11px] font-medium text-muted">{t('analytics.total') || 'Total'}</div>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-xl text-center border border-amber-200/60">
            <div className="text-lg font-extrabold text-amber-700 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {activeReports}
            </div>
            <div className="text-[11px] font-medium text-amber-800">{t('status.InProgress') || 'In Progress'}</div>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-xl text-center border border-emerald-200/60">
            <div className="text-lg font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {resolvedReports}
            </div>
            <div className="text-[11px] font-medium text-emerald-800">{t('status.Resolved') || 'Resolved'}</div>
          </div>
        </div>

        <div className="pt-1 flex gap-2">
          <Link
            to="/my-complaints"
            className="btn-secondary flex-1 h-9 text-xs flex items-center justify-center gap-1.5 font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> {t('nav.my_reports') || 'Open My Reports'}
          </Link>
          <Link
            to="/report"
            className="btn-primary flex-1 h-9 text-xs flex items-center justify-center gap-1.5 font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5" /> {t('report.title') || 'Report Issue'}
          </Link>
        </div>
      </div>

      <div className="card p-5 shadow-sm border border-line space-y-4">
        <h2 className="font-bold text-sm text-ink">{t('profile.edit') || 'Edit Profile'}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-ink">{t('auth.name') || 'Full Name'}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-ink">{t('auth.phone') || 'Phone Number'}</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input w-full text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="btn-primary px-6 h-9 text-xs flex items-center gap-2 shadow-sm font-semibold"
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('profile.saving') || 'Saving...'}</span>
              </>
            ) : (
              <span>{t('profile.save') || 'Save Changes'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
