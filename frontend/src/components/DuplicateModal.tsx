import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { ComplaintCard } from './ComplaintCard';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicate: any;
  onSupport: () => void;
  onSubmitAnyway: () => void;
  isSubmitting?: boolean;
}

export const DuplicateModal = ({
  isOpen,
  onClose,
  duplicate,
  onSupport,
  onSubmitAnyway,
  isSubmitting
}: DuplicateModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-line"
        >
          <div className="p-4 border-b border-amber-200 flex justify-between items-center bg-amber-50">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>{t('duplicate.title') || 'Similar Issue Reported Nearby'}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-amber-800 hover:bg-amber-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto space-y-3">
            <p className="text-xs text-ink leading-relaxed">
              {t('duplicate.description') || "We found a similar issue reported nearby. You can support the existing report to increase its priority, or submit yours as a new issue if it's distinct."}
            </p>
            {duplicate && (
              <div className="pointer-events-none">
                 <ComplaintCard complaint={duplicate} showUpvote={false} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-line flex flex-col sm:flex-row gap-3 bg-slate-50">
            <button
              onClick={onSubmitAnyway}
              disabled={isSubmitting}
              className="btn-secondary flex-1 text-xs h-10 font-semibold"
            >
              {t('duplicate.submit_anyway') || 'Submit as New'}
            </button>
            <button
              onClick={onSupport}
              disabled={isSubmitting}
              className="btn-primary flex-1 text-xs h-10 font-semibold shadow-sm"
            >
              {t('duplicate.support_instead') || 'Support Existing'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
