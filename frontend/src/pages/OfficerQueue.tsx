import { useState } from 'react';
import { useOfficerQueue } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { SeverityChip } from '../components/SeverityChip';
import { OfficerStatusModal } from '../components/OfficerStatusModal';
import { AlertCircle, Clock, ArrowLeft, LayoutDashboard, Loader2, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedComplaintTitle } from '../lib/localizeComplaint';

export const OfficerQueue = () => {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const { data, isLoading } = useOfficerQueue({ status: statusFilter });
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-line bg-surface hover:bg-slate-blue-50 text-muted hover:text-ink transition-colors"
            title={t('common.back') || 'Go Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-ink">
              <LayoutDashboard className="w-6 h-6 text-slate-blue-600" />
              <span>{t('officer.queue_title') || 'Officer Priority Queue'}</span>
            </h1>
            <p className="text-xs text-muted">
              {t('officer.queue_desc') || 'Prioritized queue based on severity, upvotes, and SLA urgency'}
            </p>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input w-44 text-xs font-semibold"
        >
          <option value="active">{t('officer.active_issues') || 'Active Issues'}</option>
          <option value="all">{t('officer.all_statuses') || 'All Issues'}</option>
          <option value="Resolved">{t('status.Resolved') || 'Resolved'}</option>
        </select>
      </div>

      <div className="card overflow-x-auto shadow-sm border border-line">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-slate-blue-50/70 border-b border-line text-xs font-bold text-slate-blue-900 uppercase tracking-wider">
              <th className="p-4">{t('complaint.id') || 'ID / Title'}</th>
              <th className="p-4">{t('complaint.priority_score') || 'Priority Score'}</th>
              <th className="p-4">{t('status.label') || 'Status'}</th>
              <th className="p-4">{t('officer.sla') || 'SLA Status'}</th>
              <th className="p-4">{t('severity.label') || 'Severity'}</th>
              <th className="p-4 text-right">{t('officer.update_status') || 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-blue-600 mb-2" />
                  <span>Loading queue...</span>
                </td>
              </tr>
            ) : (data?.items || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted">
                  No issues in this queue.
                </td>
              </tr>
            ) : (
              (data?.items || []).map((c: any) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/complaints/${c.id}`)}
                  className="hover:bg-slate-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-sm text-ink line-clamp-1">{getLocalizedComplaintTitle(c, i18n.language)}</div>
                    <div className="text-[11px] text-muted font-mono mt-0.5">{c.id} &bull; {c.address}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-extrabold text-slate-blue-700">{Math.round(c.priority_score || 0)}</span>
                      {c.priority_score > 75 && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="p-4"><StatusChip status={c.status} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                       <Clock className="w-3.5 h-3.5"/>
                       <span>{c.sla_hours || 48}h SLA</span>
                    </div>
                  </td>
                  <td className="p-4"><SeverityChip severity={c.severity} /></td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="btn-secondary h-7 px-2.5 text-[11px] font-semibold inline-flex items-center gap-1.5 hover:bg-slate-blue-100 hover:text-slate-blue-800 transition-colors shadow-xs"
                      title={t('officer.update_status') || 'Update Status'}
                    >
                      <Edit3 className="w-3 h-3 text-slate-blue-600" />
                      <span>{t('officer.update_status') || 'Update'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OfficerStatusModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
      />
    </div>
  );
};
