import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../api/hooks';
import toast from 'react-hot-toast';
import cgLogo from '../assets/cg_logo.png';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/users');
      else if (user.role === 'officer') navigate('/officer/queue');
      else navigate('/map');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: (data) => {
        login(data.token, data.user);
      },
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Login failed')
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-blue-50 p-4">
      <div className="w-full max-w-md card p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <img src={cgLogo} alt={t('app.name')} className="h-14 w-auto object-contain drop-shadow-md mb-3" />
          <h2 className="text-2xl font-bold text-slate-blue-900">{t('auth.login')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.email')}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">{t('auth.password')}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input w-full" />
          </div>
          <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full h-11 text-base">
            {loginMutation.isPending ? 'Logging in...' : t('auth.login')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account? <Link to="/register" className="text-slate-blue-600 font-medium hover:underline">{t('nav.register')}</Link>
        </p>
      </div>
    </div>
  );
};
