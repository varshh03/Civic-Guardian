import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../api/hooks';
import toast from 'react-hot-toast';
import cgLogo from '../assets/cg_logo.png';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', language: i18n.language });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/users');
      else if (user.role === 'officer') navigate('/officer/queue');
      else navigate('/map');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData, {
      onSuccess: (data) => {
        login(data.token, data.user);
      },
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Registration failed')
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-blue-50 p-4">
      <div className="w-full max-w-md card p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <img src={cgLogo} alt={t('app.name')} className="h-14 w-auto object-contain drop-shadow-md mb-3" />
          <h2 className="text-2xl font-bold text-slate-blue-900">{t('auth.register')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.name')}</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.email')}</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.phone')}</label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.password')}</label>
            <input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Preferred Language</label>
            <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="input w-full">
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
          <button type="submit" disabled={registerMutation.isPending} className="btn-primary w-full h-11 text-base mt-2">
            {registerMutation.isPending ? 'Registering...' : t('auth.register')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-slate-blue-600 font-medium hover:underline">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
};
