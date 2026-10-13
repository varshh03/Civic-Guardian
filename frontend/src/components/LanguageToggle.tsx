import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const toggle = (l: string) => {
    i18n.changeLanguage(l);
    localStorage.setItem('civic_lang', l);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-blue-50 rounded-lg p-1 border border-line">
      <button
        onClick={() => toggle('ta')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          lang === 'ta' ? 'bg-slate-blue-600 text-white' : 'text-muted hover:text-ink'
        }`}
      >
        தமிழ்
      </button>
      <button
        onClick={() => toggle('en')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          lang === 'en' ? 'bg-slate-blue-600 text-white' : 'text-muted hover:text-ink'
        }`}
      >
        EN
      </button>
    </div>
  );
};