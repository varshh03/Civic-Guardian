import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Compass,
  MessageSquare,
  Building2,
  PhoneCall,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  Flame,
  Droplets,
  Lightbulb,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useComplaints, useStats } from '../api/hooks';
import { StatusChip } from '../components/StatusChip';
import { SeverityChip } from '../components/SeverityChip';
import { AuthModal } from '../components/AuthModal';

import municipalLogo from '../assets/karur_logo.png';
import heroBg from '../assets/karur_bg.png';
import kpImg from '../assets/kp1.jpg';
import cgLogo from '../assets/cg_logo.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');

  const [quickTrackId, setQuickTrackId] = useState('');
  const [trackError, setTrackError] = useState('');

  const { data: complaintsData } = useComplaints({ limit: '3' });
  const { data: statsData } = useStats();

  const recentComplaints = complaintsData?.items?.slice(0, 3) || [];

  const handleLanguageChange = (newLang: 'ta' | 'en') => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('civic_lang', newLang);
  };

  const openAuth = (tab: 'login' | 'register') => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = quickTrackId.trim();
    if (!cleanId) {
      setTrackError(lang === 'ta' ? 'புகார் எண்ணை உள்ளிடவும்' : 'Please enter a Complaint ID');
      return;
    }
    navigate(`/complaints/${cleanId}`);
  };

  const getLocalizedTitle = (item: any) => {
    if (lang === 'ta') {
      if (item.language === 'ta' && item.text_original?.title) {
        return item.text_original.title;
      }
      if (item.issue_type === 'pothole') {
        return item.severity === 'High'
          ? 'ஆபத்தான பெரிய சாலைக்குழி மற்றும் சாலை சேதம்'
          : 'சாலையில் குழி மற்றும் தார் சேதம்';
      }
      if (item.issue_type === 'water_leak') {
        return item.severity === 'High'
          ? 'முக்கிய குடிநீர் குழாய் உடைப்பு மற்றும் நீர் வீணாதல்'
          : 'குடிநீர் குழாய் கசிவு மற்றும் வடிகால் தேக்கம்';
      }
      if (item.issue_type === 'streetlight') {
        return 'எரியாத தெருவிளக்கு மற்றும் மின்கம்ப பழுது';
      }
      return item.text_original?.title || item.title;
    }
    return item.text_en?.title || item.title;
  };

  const getLocalizedDesc = (item: any) => {
    if (lang === 'ta') {
      if (item.language === 'ta' && item.text_original?.description) {
        return item.text_original.description;
      }
      const loc = item.address ? `${item.address} பகுதியில் ` : 'மாநகராட்சி பகுதியில் ';
      if (item.issue_type === 'pothole') {
        return `${loc}சாலையில் குழி ஏற்பட்டு போக்குவரத்து மற்றும் பாதசாரிகளுக்கு சிரமம் ஏற்பட்டுள்ளது. உடனடியாக தார் பூசி சரிசெய்யவும்.`;
      }
      if (item.issue_type === 'water_leak') {
        return `${loc}குடிநீர் குழாயில் கடுமையான கசிவு ஏற்பட்டு தூய குடிநீர் வீணாகிறது. உடனடியாக சீரமைக்க வேண்டுகிறோம்.`;
      }
      if (item.issue_type === 'streetlight') {
        return `${loc}தெருவிளக்கு பல நாட்களாக எரியாமல் இரவு நேரத்தில் இருட்டாக உள்ளது. புதிய விளக்கு பொருத்தி உதவவும்.`;
      }
      return item.text_original?.description || item.description;
    }
    return item.text_en?.description || item.description;
  };

  const getDepartmentName = (deptId: string) => {
    if (deptId === 'dept-roads') {
      return lang === 'ta' ? 'நெடுஞ்சாலை & சாலைகள் பிரிவு' : 'Highways & Roads Division';
    }
    if (deptId === 'dept-water') {
      return lang === 'ta' ? 'குடிநீர் வழங்கல் & வடிகால் பிரிவு' : 'Water Supply & Drainage Division';
    }
    if (deptId === 'dept-electric') {
      return lang === 'ta' ? 'மின்சாரம் & தெருவிளக்குகள் பிரிவு' : 'Electrical & Lighting Division';
    }
    return lang === 'ta' ? 'மாநகராட்சிப் பிரிவு' : 'Municipal Division';
  };

  const totalReportsCount = statsData?.total_reports ?? 2068;
  const resolvedCount = statsData?.resolved_count ?? 339;
  const inProgressCount = statsData?.in_progress_count ?? 142;
  const avgFixTime = statsData?.avg_resolution_hours ? `${statsData.avg_resolution_hours} ${t('landing.hours')}` : `36 ${t('landing.hours')}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 text-sm">
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <a href="#main-content" className="hover:text-white transition-colors underline-offset-4 hover:underline hidden sm:inline">
              {t('landing.skip_to_content')}
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{t('landing.helpline_phone')}</span>
            </div>
            <span className="text-slate-600 hidden md:inline">|</span>
            <div className="items-center gap-1.5 hidden md:flex">
              <Mail className="w-3 h-3 text-sky-400" />
              <span>{t('landing.helpline_email')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded px-1 py-0.5 border border-slate-700 font-semibold text-[11px]">
              <button
                onClick={() => handleLanguageChange('ta')}
                className={`px-2 py-0.5 rounded transition-all ${
                  lang === 'ta' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 rounded transition-all ${
                  lang === 'en' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <span className="text-slate-600">|</span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuth('login')}
                className="hover:text-white font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('nav.login')}</span>
              </button>
              <span className="text-slate-600">/</span>
              <button
                onClick={() => openAuth('register')}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('nav.register')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src={municipalLogo}
              alt={t('landing.karur_logo_alt')}
              className="h-16 w-auto object-contain flex-shrink-0 drop-shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                {t('landing.govt_tn')}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {t('landing.karur_mc')}
              </h1>
              <span className="text-[11px] font-medium text-slate-600 hidden sm:block">
                {lang === 'ta' ? 'நகராட்சி நிர்வாகம் & குடிநீர் வழங்கல் துறை' : 'Municipal Administration & Water Supply Dept.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <img
              src={cgLogo}
              alt={t('landing.civic_guardian')}
              className="h-11 w-auto object-contain flex-shrink-0 drop-shadow-xs"
            />
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-sm font-black text-slate-900 leading-tight">
                {t('landing.civic_guardian')}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {t('landing.civic_tagline')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-[#12263f] text-white border-y border-[#0c1a2d] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 py-1 text-xs font-semibold whitespace-nowrap">
            <Link to="/" className="px-3 py-2 rounded-md bg-white/10 text-white font-bold hover:bg-white/15 transition-colors">
              {t('landing.nav_home')}
            </Link>
            <Link to="/report" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_report')}
            </Link>
            <Link to="/map" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_map')}
            </Link>
            <Link to="/feed" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_feed')}
            </Link>
            <a href="#quick-track" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_track')}
            </a>
            <a href="#about" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_about')}
            </a>
            <a href="#stats" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_stats')}
            </a>
            <a href="#departments" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_departments')}
            </a>
            <a href="#helpline" className="px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t('landing.nav_contact')}
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2 py-1">
            <button
              onClick={() => openAuth('login')}
              className="text-white hover:text-emerald-300 text-xs font-semibold px-3 py-1.5 transition-colors cursor-pointer"
            >
              {t('nav.login')}
            </button>
            <Link
              to="/report"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-md shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('landing.report_now')}</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs text-slate-700 overflow-hidden shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded flex-shrink-0">
            {lang === 'ta' ? 'அறிவிப்பு' : 'ANNOUNCEMENT'}
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee hover:pause font-medium">
              {t('landing.ticker_news')}
            </div>
          </div>
        </div>
      </div>

      <main id="main-content">
        <section className="relative min-h-[500px] lg:min-h-[540px] flex items-center overflow-hidden border-b border-slate-300">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/40" />

          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 z-10 w-full text-white">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {t('landing.hero_title')}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-xs font-normal">
                {t('landing.hero_subtitle')}
              </p>

              <div className="flex items-center gap-3 flex-wrap pt-2">
                <Link
                  to="/report"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('landing.report_now')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/map"
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-semibold px-6 py-3 rounded-lg text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.explore_map')}</span>
                </Link>

                <a
                  href="#quick-track"
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-5 py-3 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-sky-400" />
                  <span>{t('landing.track_id')}</span>
                </a>
              </div>

              <div className="flex items-center gap-4 pt-4 text-xs text-slate-300 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.badge_ai')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.badge_route')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('landing.badge_sla')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 max-w-7xl mx-auto px-4 -mt-10 sm:-mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <Link
              to="/report"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t('landing.tile_report_title')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t('landing.tile_report_desc')}
                </p>
              </div>
            </Link>

            <a
              href="#quick-track"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                  {t('landing.tile_track_title')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t('landing.tile_track_desc')}
                </p>
              </div>
            </a>

            <Link
              to="/feed"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {t('landing.tile_feed_title')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t('landing.tile_feed_desc')}
                </p>
              </div>
            </Link>

            <a
              href="#departments"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                  {t('landing.tile_dept_title')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {t('landing.tile_dept_desc')}
                </p>
              </div>
            </a>

            <a
              href="#helpline"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
                  {lang === 'ta' ? 'உதவி மையம் & தொடர்பு' : 'Citizen Helpline & Desk'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {lang === 'ta' ? 'மாநகராட்சி நேரடி உதவி மையம்' : 'Municipal administration desk'}
                </p>
              </div>
            </a>
          </div>
        </section>

        <section id="about" className="max-w-7xl mx-auto px-4 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-slate-600 font-bold text-xs uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {lang === 'ta' ? 'மாநகராட்சி நிர்வாகம்' : 'CIVIC ADMINISTRATION'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {t('landing.about_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.about_p1')}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.about_p2')}
              </p>

              <div className="pt-2 flex items-center gap-6 text-xs text-slate-700">
                <div>
                  <p className="font-extrabold text-lg text-slate-900">48</p>
                  <p className="text-[11px] text-slate-500">{lang === 'ta' ? 'மாநகராட்சி வார்டுகள்' : 'Municipal Wards'}</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div>
                  <p className="font-extrabold text-lg text-slate-900">2.5 L+</p>
                  <p className="text-[11px] text-slate-500">{lang === 'ta' ? 'மக்கள் தொகை' : 'Citizens Served'}</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div>
                  <p className="font-extrabold text-lg text-slate-900">100%</p>
                  <p className="text-[11px] text-slate-500">{lang === 'ta' ? 'டிஜிட்டல் குறைதீர்ப்பு' : 'Digital SLA Action'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group bg-white">
              <img
                src={kpImg}
                alt={lang === 'ta' ? 'மாநகராட்சி' : 'City Municipal Corporation'}
                className="w-full h-84 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-extrabold text-base">{lang === 'ta' ? 'மாநகராட்சி' : 'City Municipal Corporation'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {lang === 'ta' ? 'மாநகராட்சி செயல்பாடுகள்' : 'LIVE METRICS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {t('landing.stats_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('landing.stats_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {totalReportsCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                {t('landing.total_reports')}
              </span>
              <span className="text-[11px] text-slate-400 mt-2">
                {lang === 'ta' ? 'அனைத்து வார்டுகளிலும்' : 'Across 48 wards'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0" />
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight z-10">
                {resolvedCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1 z-10">
                {t('landing.resolved_reports')}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-2 z-10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {lang === 'ta' ? 'சரிபார்க்கப்பட்ட தீர்வு' : 'Proof verified'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-xs flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">
                {inProgressCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                {t('landing.in_progress')}
              </span>
              <span className="text-[11px] text-amber-700 font-medium mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lang === 'ta' ? 'SLA வரம்பிற்குள்' : 'Within active SLA'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-xs flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-sky-600 tracking-tight">
                {avgFixTime}
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                {t('landing.avg_fix_time')}
              </span>
              <span className="text-[11px] text-sky-700 font-medium mt-2">
                {lang === 'ta' ? 'அதிவேக நடவடிக்கை' : 'Fast-track engineering'}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sky-700 font-extrabold text-xs uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                {lang === 'ta' ? 'செயல்முறை விளக்கம்' : 'WORKFLOW'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('landing.how_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {t('landing.how_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {t('landing.step1_title')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.step1_desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'AI தானியங்கி ஆய்வு' : 'AI YOLO Detection'}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {t('landing.step2_title')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.step2_desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-sky-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'சேத அளவு கணக்கீடு' : 'Severity Scoring'}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {t('landing.step3_title')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.step3_desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'நேரடித் துறைக்கு அனுப்புதல்' : 'Concurrent Routing'}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-sm">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {t('landing.step4_title')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('landing.step4_desc')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'கள ஆய்வு & தீர்வுப் படம்' : 'Proof Photo Verified'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="departments" className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-purple-700 font-extrabold text-xs uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {lang === 'ta' ? 'புகார் சேவைப் பிரிவுகள்' : 'SERVICE CATEGORIES'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {t('landing.what_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('landing.what_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('landing.cat_roads_title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('landing.cat_roads_desc')}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {t('landing.cat_roads_sla')}
                </span>
                <Link to="/report" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  <span>{t('landing.report_now')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('landing.cat_water_title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('landing.cat_water_desc')}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {t('landing.cat_water_sla')}
                </span>
                <Link to="/report" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  <span>{t('landing.report_now')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('landing.cat_elec_title')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('landing.cat_elec_desc')}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {t('landing.cat_elec_sla')}
                </span>
                <Link to="/report" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  <span>{t('landing.report_now')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {recentComplaints.length > 0 && (
          <section className="bg-slate-100/70 border-y border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <span className="text-emerald-700 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {lang === 'ta' ? 'நேரலை மக்கள் மன்றம்' : 'COMMUNITY FEED'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                    {t('landing.recent_title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {t('landing.recent_subtitle')}
                  </p>
                </div>

                <Link
                  to="/feed"
                  className="btn-secondary h-9 px-4 text-xs font-semibold flex items-center gap-2 bg-white shadow-xs"
                >
                  <span>{t('landing.view_all_feed')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentComplaints.map((item) => {
                  const imageSrc = item.image.startsWith('http')
                    ? item.image
                    : `/uploads/${item.image}`;
                  const fallbackFallback = `https://placehold.co/400x250/e2e8f0/334155?text=${encodeURIComponent(
                    item.issue_type === 'pothole'
                      ? 'Road Defect'
                      : item.issue_type === 'water_leak'
                      ? 'Water Leakage'
                      : 'Streetlight Issue'
                  )}`;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <img
                            src={imageSrc}
                            alt={getLocalizedTitle(item)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src !== `${API_BASE}/uploads/${item.image}` && !target.src.includes(API_BASE)) {
                                target.src = `${API_BASE}/uploads/${item.image}`;
                              } else {
                                target.src = fallbackFallback;
                              }
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <StatusChip status={item.status} />
                            <SeverityChip severity={item.severity} />
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                            <span>{getDepartmentName(item.department_id)}</span>
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {item.id}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1.5">
                            {getLocalizedTitle(item)}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {getLocalizedDesc(item)}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{item.address || (lang === 'ta' ? 'கரூர்' : 'Karur')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.upvote_count || item.upvotes?.length || 0} {t('common.supports')}</span>
                        </span>
                        <Link
                          to={`/complaints/${item.id}`}
                          className="text-slate-900 font-bold hover:text-emerald-700 flex items-center gap-1"
                        >
                          <span>{lang === 'ta' ? 'விவரம் காண்க' : 'View Details'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section id="quick-track" className="bg-[#12263f] text-white py-12 px-4 border-y border-[#0c1a2d]">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('landing.tile_track_title')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('landing.quick_track_prompt')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === 'ta'
                ? 'உங்கள் புகார் எண்ணை உள்ளிட்டு, தற்போதைய அதிகாரியின் நிலை மற்றும் தீர்வு விவரங்களை உடனுக்குடன் அறியலாம்.'
                : 'Enter your grievance tracking number to check live inspection notes, department actions, and resolution timestamp.'}
            </p>

            <form onSubmit={handleTrackSubmit} className="max-w-lg mx-auto flex items-center gap-2 pt-2">
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => {
                  setQuickTrackId(e.target.value);
                  setTrackError('');
                }}
                placeholder={t('landing.quick_track_placeholder')}
                className="input bg-white text-slate-900 text-sm h-11 flex-1 font-mono shadow-sm"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 h-11 rounded-lg text-sm transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{t('landing.quick_track_btn')}</span>
              </button>
            </form>
            {trackError && <p className="text-xs text-rose-400 font-medium">{trackError}</p>}
          </div>
        </section>

        <section id="helpline" className="bg-slate-100 border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-rose-700 font-extrabold text-xs uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {lang === 'ta' ? 'மாநகராட்சி தொடர்பு மையம்' : 'MUNICIPAL HELP DESK'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('landing.helpline_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {t('landing.helpline_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    {lang === 'ta' ? 'மாநகராட்சி தொடர்பு எண்' : 'Municipal Contact Number'}
                  </h3>
                  <p className="text-xl font-extrabold text-emerald-600 font-mono">
                    04323 222 951
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {lang === 'ta' ? 'மாநகராட்சி அலுவலக நேரடி தொடர்பு எண்' : 'City Municipal Corporation direct contact line'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
                  {lang === 'ta' ? 'மாநகராட்சி கட்டுப்பாட்டு மையம்' : 'Central Administrative Desk'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    {lang === 'ta' ? 'அதிகாரப்பூர்வ மின்னஞ்சல்' : 'Official Email Contact'}
                  </h3>
                  <p className="text-sm font-bold text-slate-900 break-all font-mono">
                    commr.karur@tn.gov.in
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {lang === 'ta' ? 'ஆணையர் அலுவலகம் மற்றும் பொது மக்கள் தொடர்பு' : 'Commissioner Desk & Public Grievance Officer'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
                  {lang === 'ta' ? 'அலுவலக நேரம்: காலை 9:30 - மாலை 6:00' : 'Hours: Mon-Sat, 9:30 AM - 6:00 PM'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">
                    {t('landing.office_label')}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {t('landing.office_address')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {t('landing.working_hours')}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'பொதுமக்கள் நேரில் அணுகலாம்' : 'Walk-in Grievance Center'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={municipalLogo} alt={t('landing.karur_logo_alt')} className="h-10 w-auto object-contain" />
              </div>
              <h4 className="font-bold text-white text-sm">
                {t('landing.karur_mc')}
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {t('landing.footer_desc')}
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">
                {lang === 'ta' ? 'முக்கிய இணைப்புகள்' : 'Quick Links'}
              </h5>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li><Link to="/report" className="hover:text-white transition-colors">{t('landing.nav_report')}</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">{t('landing.nav_map')}</Link></li>
                <li><Link to="/feed" className="hover:text-white transition-colors">{t('landing.nav_feed')}</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">{t('nav.leaderboard')}</Link></li>
                <li><a href="#departments" className="hover:text-white transition-colors">{t('landing.nav_departments')}</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">
                {lang === 'ta' ? 'மாநகராட்சிப் பிரிவுகள்' : 'Municipal Divisions'}
              </h5>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li><span className="hover:text-white">{t('landing.cat_roads_title')} (72h SLA)</span></li>
                <li><span className="hover:text-white">{t('landing.cat_water_title')} (24h SLA)</span></li>
                <li><span className="hover:text-white">{t('landing.cat_elec_title')} (48h SLA)</span></li>
                <li><span className="hover:text-white">{lang === 'ta' ? 'பொது சுகாதாரப் பிரிவு' : 'Public Health & Sanitation'}</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">
                {t('landing.visitor_count')}
              </h5>
              <div className="inline-block bg-slate-900 border border-slate-800 rounded px-3 py-1 font-mono text-emerald-400 font-bold text-base tracking-widest shadow-inner">
                0 3 4 8 9 2
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'ta' ? 'கடைசியாக புதுப்பிக்கப்பட்டது: இன்று' : 'Last Updated: Today'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleLanguageChange('ta')}
                  className={`text-[11px] px-2 py-0.5 rounded border border-slate-700 cursor-pointer ${lang === 'ta' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  தமிழ்
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`text-[11px] px-2 py-0.5 rounded border border-slate-700 cursor-pointer ${lang === 'en' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap text-[11px] text-slate-400">
            <p>{t('landing.footer_rights')}</p>
            <p className="flex items-center gap-1.5">
              <span>{t('landing.civic_guardian')}</span>
              <span>•</span>
              <span>{lang === 'ta' ? 'மாநகராட்சி AI தளம்' : 'Municipal AI Portal'}</span>
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </div>
  );
};
