import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-slate-blue-600 text-white hover:bg-slate-blue-700',
    secondary: 'bg-white text-slate-blue-600 border border-line hover:bg-slate-blue-50',
    ghost: 'text-slate-blue-600 hover:bg-slate-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-5 text-sm', lg: 'h-12 px-6 text-base' };
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
