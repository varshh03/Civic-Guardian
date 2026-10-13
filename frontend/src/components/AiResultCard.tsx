import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TypeIcon } from './TypeIcon';
import { SeverityChip } from './SeverityChip';
import { cn } from '../lib/utils';
import { Sparkles, AlertTriangle, AlertOctagon } from 'lucide-react';

interface AiResultCardProps {
  confidence: number;
  issueType: string;
  severity: string;
  severityReason: string;
  department: string;
  isStub: boolean;
  isValid?: boolean;
  invalidReason?: string;
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onTypeChange?: (v: string) => void;
}

export const AiResultCard = ({
  confidence,
  issueType,
  severity,
  severityReason,
  department,
  isStub,
  isValid = true,
  invalidReason,
  title,
  description,
  onTitleChange,
  onDescChange,
  onTypeChange
}: AiResultCardProps) => {
  const { t } = useTranslation();
  const isInvalid = !isValid || issueType === 'invalid' || !['pothole', 'water_leak', 'streetlight'].includes(issueType);

  if (isInvalid) {
    return (
      <div className="card p-6 space-y-4 border-2 border-red-300 bg-red-50/60 shadow-sm rounded-2xl">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-red-950">
                {t('report.invalid_title') || 'This Issue Cannot Be Acknowledged'}
              </h3>
              <span className="chip bg-red-200/90 text-red-800 text-[10px] font-bold border-red-300">
                {t('report.invalid_badge') || 'Invalid Issue'}
              </span>
            </div>
            <p className="text-xs text-red-900 leading-relaxed font-medium">
              {invalidReason || t('report.invalid_desc') || 'This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads (potholes), Water Supply (leaks/drainage), and Streetlight issues. The uploaded photo does not appear to be related to these departments.'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  const lowConfidence = confidence < 0.6;

  const translatedReason = severityReason ? (t(severityReason, severityReason) || severityReason) : '';

  return (
    <div className="card p-5 space-y-4 border-2 border-slate-blue-200 bg-slate-blue-50/40 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <TypeIcon type={issueType} className="w-6 h-6 text-slate-blue-700" />
          <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('report.ai_detected') || 'AI Detection'}</span>
          </h3>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-blue-700">
            {Math.round(confidence * 100)}% {t('report.ai_confidence') || 'Confidence'}
          </div>
          <div className="w-24 h-1.5 bg-slate-blue-200/60 rounded-full mt-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              className={cn(
                "h-full",
                confidence > 0.8 ? "bg-emerald-500" : confidence > 0.6 ? "bg-amber-500" : "bg-red-500"
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center text-xs">
        <SeverityChip severity={severity} />
        <span className="text-muted">•</span>
        <span className="font-semibold text-ink">{department}</span>
      </div>

      {translatedReason && (
        <p className="text-xs text-muted bg-white p-2.5 rounded-lg border border-line">
          {translatedReason}
        </p>
      )}

      {lowConfidence && onTypeChange && (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('report.ai_low_confidence') || 'Confidence is moderate. Please confirm the issue category:'}</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['pothole', 'water_leak', 'streetlight'].map(typeKey => (
              <button
                key={typeKey}
                type="button"
                onClick={() => onTypeChange(typeKey)}
                className={cn(
                  "p-2 rounded-lg border flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all shadow-xs",
                  issueType === typeKey
                    ? "bg-slate-blue-600 text-white border-slate-blue-600 shadow-sm"
                    : "bg-white text-muted border-line hover:border-slate-blue-300 hover:text-ink"
                )}
              >
                <TypeIcon type={typeKey} className="w-4 h-4" />
                <span>{t(`issue_type.${typeKey}`) || typeKey}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mt-4 pt-4 border-t border-line">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            {t('report.title_field') || 'Report Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="input w-full text-sm"
            placeholder={t('report.title_field') || 'Issue title'}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            {t('report.description_field') || 'Description'}
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescChange(e.target.value)}
            className="input w-full h-24 resize-none text-sm"
            placeholder={t('report.description_field') || 'Describe the issue...'}
          />
        </div>
      </div>
    </div>
  );
};
