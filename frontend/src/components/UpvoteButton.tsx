import { ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface UpvoteButtonProps {
  count: number;
  isUpvoted: boolean;
  onUpvote: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const UpvoteButton = ({ count, isUpvoted, onUpvote, disabled, size = 'md' }: UpvoteButtonProps) => {
  const { t } = useTranslation();
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onUpvote}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-btn border font-medium transition-all duration-150',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
        isUpvoted
          ? 'bg-slate-blue-600 text-white border-slate-blue-600'
          : 'bg-white text-muted border-line hover:border-slate-blue-400 hover:text-slate-blue-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <ThumbsUp className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <AnimatePresence mode="wait">
        <motion.span key={count} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.15 }}>
          {count}
        </motion.span>
      </AnimatePresence>
      <span className="hidden sm:inline">{t('complaint.support')}</span>
    </motion.button>
  );
};
