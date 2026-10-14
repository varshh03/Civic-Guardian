export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'slate-blue': {
          50: '#F3F6FB',
          100: '#E4EAF4',
          200: '#C9D5E8',
          400: '#7F94BA',
          500: '#5E789F',
          600: '#4A6491',
          700: '#3C5278',
          900: '#1F2D45',
        },
        ink: '#1E293B',
        muted: '#64748B',
        surface: '#FFFFFF',
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,45,69,0.06)',
        'card-hover': '0 4px 12px rgba(31,45,69,0.12)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
