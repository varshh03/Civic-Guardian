import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLogin, useRegister } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import cgLogo from '../assets/cg_logo.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [isForgotView, setIsForgotView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    language: lang,
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    setActiveTab(defaultTab);
    setIsForgotView(false);
    setForgotSent(false);
    setShowPassword(false);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email: loginEmail.trim(), password: loginPassword },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast.success(lang === 'ta' ? 'வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்!' : 'Logged in successfully!');
          onClose();
          if (data.user.role === 'admin') navigate('/admin/users');
          else if (data.user.role === 'officer') navigate('/officer/queue');
          else navigate('/map');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || (lang === 'ta' ? 'உள்நுழைவு தோல்வியடைந்தது' : 'Login failed'));
        }
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password,
        language: registerData.language,
      },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast.success(lang === 'ta' ? 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Account registered successfully!');
          onClose();
          navigate('/map');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || (lang === 'ta' ? 'பதிவு தோல்வியடைந்தது' : 'Registration failed'));
        }
      }
    );
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error(lang === 'ta' ? 'மின்னஞ்சலை உள்ளிடவும்' : 'Please enter your email');
      return;
    }
    setForgotSent(true);
    toast.success(
      lang === 'ta'
        ? 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது!'
        : 'Password reset link sent to your email!'
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
            <img
              src={cgLogo}
              alt="Civic Guardian"
              className="h-12 w-auto object-contain mx-auto drop-shadow-sm mb-3"
            />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isForgotView
                ? (lang === 'ta' ? 'கடவுச்சொல்லை மீட்டமைக்க' : 'Reset Password')
                : activeTab === 'login'
                ? (lang === 'ta' ? 'குடிமக்கள் உள்நுழைவு' : 'Citizen Sign In')
                : (lang === 'ta' ? 'புதிய குடிமக்கள் பதிவு' : 'Create Citizen Account')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'ta'
                ? 'கரூர் மாநகராட்சி • செயல் காவலர்'
                : 'Karur City Municipal Corporation • Civic Guardian'}
            </p>

            {!isForgotView && (
              <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1 mt-4 text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setShowPassword(false);
                  }}
                  className={`py-2 rounded-md transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ta' ? 'உள்நுழைவு' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setShowPassword(false);
                  }}
                  className={`py-2 rounded-md transition-all ${
                    activeTab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lang === 'ta' ? 'பதிவு செய்தல்' : 'Register'}
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {isForgotView ? (
              <div className="space-y-4">
                {forgotSent ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {lang === 'ta' ? 'மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Reset Link Sent!'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {lang === 'ta'
                        ? `${forgotEmail} மின்னஞ்சலுக்கு கடவுச்சொல் மீட்டமைப்பு அறிவுறுத்தல்கள் அனுப்பப்பட்டுள்ளன.`
                        : `Password reset instructions have been dispatched to ${forgotEmail}.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsForgotView(false)}
                      className="btn-primary w-full h-10 text-xs font-bold mt-2"
                    >
                      {lang === 'ta' ? 'உள்நுழைவுக்குத் திரும்பு' : 'Return to Login'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <p className="text-xs text-slate-600">
                      {lang === 'ta'
                        ? 'உங்கள் கணக்கில் பதிவு செய்யப்பட்ட மின்னஞ்சலை உள்ளிடுங்கள். கடவுச்சொல்லை மீட்டமைக்க இணைப்பு அனுப்பி வைக்கப்படும்.'
                        : 'Enter your registered email address to receive password reset instructions.'}
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="citizen@karur.gov.in"
                          className="input w-full pl-9 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full h-10 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>{lang === 'ta' ? 'இணைப்பு அனுப்பு' : 'Send Reset Link'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsForgotView(false)}
                      className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 pt-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{lang === 'ta' ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Sign In'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="input w-full pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotView(true)}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      {lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input w-full pl-9 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="btn-primary w-full h-10 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{lang === 'ta' ? 'உள்நுழைக' : 'Sign In to Account'}</span>
                  {!loginMutation.isPending && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {lang === 'ta' ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setShowPassword(false);
                    }}
                    className="font-bold text-emerald-600 hover:underline"
                  >
                    {lang === 'ta' ? 'இப்போதே பதிவு செய்' : 'Create an Account'}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder={lang === 'ta' ? 'எ.கா. செல்வம்' : 'e.g. Ramesh Kumar'}
                      className="input w-full pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="citizen@example.com"
                      className="input w-full pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ta' ? 'தொலைபேசி எண்' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="input w-full pl-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ta' ? 'கடவுச்சொல் (குறைந்தது 8 எழுத்துக்கள்)' : 'Password (Min 8 characters)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                      className="input w-full pl-9 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="btn-primary w-full h-10 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm mt-1"
                >
                  {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{lang === 'ta' ? 'கணக்கை உருவாக்கு' : 'Complete Registration'}</span>
                  {!registerMutation.isPending && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setShowPassword(false);
                    }}
                    className="font-bold text-emerald-600 hover:underline"
                  >
                    {lang === 'ta' ? 'உள்நுழைக' : 'Sign In'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
