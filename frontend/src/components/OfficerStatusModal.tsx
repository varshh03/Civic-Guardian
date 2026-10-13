import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { OfficerStatusPanel } from './OfficerStatusPanel';

interface OfficerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: {
    id: string;
    status: string;
    department_id: string;
    title?: string;
  } | null;
}

export const OfficerStatusModal: React.FC<OfficerStatusModalProps> = ({
  isOpen,
  onClose,
  complaint
}) => {
  if (!isOpen || !complaint) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-line relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-muted hover:text-ink hover:bg-slate-100 transition-colors z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <OfficerStatusPanel
            complaint={complaint}
            onSuccess={onClose}
            className="border-0 shadow-none rounded-none"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
