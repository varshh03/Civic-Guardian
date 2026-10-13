import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useUpdateStatus } from '../api/hooks';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  XCircle, 
  Upload, 
  Camera, 
  X, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface OfficerStatusPanelProps {
  complaint: {
    id: string;
    status: string;
    department_id: string;
    title?: string;
  };
  onSuccess?: () => void;
  className?: string;
}

export const OfficerStatusPanel: React.FC<OfficerStatusPanelProps> = ({
  complaint,
  onSuccess,
  className
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>(complaint.status);
  const [note, setNote] = useState<string>('');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateStatus(complaint.id);

  const isAdmin = user?.role === 'admin';
  const isAuthorizedOfficer = 
    user?.role === 'officer' && 
    (!user.department_id || user.department_id === complaint.department_id);

  if (!isAdmin && !isAuthorizedOfficer) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResolutionFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setResolutionFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === complaint.status && !note.trim() && !resolutionFile) {
      toast.error(t('officer.select_new_status') || 'Please select a new status or provide a note.');
      return;
    }

    const formData = new FormData();
    formData.append('status', selectedStatus);
    formData.append('note', note.trim());
    if (resolutionFile) {
      formData.append('resolution_image', resolutionFile);
    }

    try {
      await updateMutation.mutateAsync(formData);
      toast.success(t('officer.status_updated_success') || 'Status updated successfully!');
      setNote('');
      handleRemoveFile();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message;
      toast.error(detail || t('officer.status_update_error') || 'Failed to update status.');
    }
  };

  const statusOptions = [
    {
      value: 'Acknowledged',
      label: t('status.Acknowledged') || 'Acknowledged',
      icon: Clock,
      activeColor: 'bg-blue-600 text-white border-blue-600 shadow-sm',
      hoverColor: 'hover:bg-blue-50 text-blue-800 border-blue-200 bg-blue-50/50',
      badgeDot: 'bg-blue-500',
      desc: t('officer.desc_acknowledged') || 'Acknowledge grievance & assign to field team'
    },
    {
      value: 'In Progress',
      label: t('status.InProgress') || 'In Progress',
      icon: Wrench,
      activeColor: 'bg-violet-600 text-white border-violet-600 shadow-sm',
      hoverColor: 'hover:bg-violet-50 text-violet-800 border-violet-200 bg-violet-50/50',
      badgeDot: 'bg-violet-500',
      desc: t('officer.desc_in_progress') || 'Maintenance & repair work actively in progress'
    },
    {
      value: 'Resolved',
      label: t('status.Resolved') || 'Resolved',
      icon: CheckCircle2,
      activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
      hoverColor: 'hover:bg-emerald-50 text-emerald-800 border-emerald-200 bg-emerald-50/50',
      badgeDot: 'bg-emerald-500',
      desc: t('officer.desc_resolved') || 'Issue fixed and verified with resolution proof'
    },
    {
      value: 'Rejected',
      label: t('status.Rejected') || 'Rejected',
      icon: XCircle,
      activeColor: 'bg-red-600 text-white border-red-600 shadow-sm',
      hoverColor: 'hover:bg-red-50 text-red-800 border-red-200 bg-red-50/50',
      badgeDot: 'bg-red-500',
      desc: t('officer.desc_rejected') || 'Invalid, duplicate, or out-of-jurisdiction report'
    }
  ];

  return (
    <div className={cn("card p-5 sm:p-6 bg-surface border border-slate-blue-200 shadow-sm rounded-xl space-y-4", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-blue-600 text-white flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <span>{t('officer.officer_panel_title') || 'Officer Action Panel'}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-blue-100 text-slate-blue-700">
                {isAdmin ? 'Admin' : (t(`department.${complaint.department_id}`) || 'Officer')}
              </span>
            </h3>
            <p className="text-[11px] text-muted">
              {t('officer.officer_panel_desc') || 'Update grievance status and record official municipal action'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-muted block">
            {t('status.label') || 'Current Status'}
          </span>
          <span className="text-xs font-semibold text-ink">
            {t(`status.${complaint.status}`) || complaint.status}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink block">
            {t('officer.select_new_status') || 'Select New Status'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;
              const isCurrent = complaint.status === opt.value;

              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all relative text-xs font-semibold gap-1.5 cursor-pointer",
                    isSelected 
                      ? opt.activeColor 
                      : opt.hoverColor
                  )}
                >
                  <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "opacity-80")} />
                  <span className="leading-tight">{opt.label}</span>
                  {isCurrent && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase",
                      isSelected ? "bg-white/20 text-white" : "bg-black/10 text-muted"
                    )}>
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink flex items-center justify-between">
            <span>{t('officer.add_note') || 'Add Action Remarks / Note'}</span>
            <span className="text-[11px] text-muted font-normal">
              {selectedStatus === 'Resolved' ? '(Recommended)' : '(Optional)'}
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              selectedStatus === 'Resolved'
                ? "e.g. Road resurfacing completed; asphalt laid and inspected by Junior Engineer."
                : selectedStatus === 'In Progress'
                ? "e.g. Repair crew and machinery dispatched to site. Work under way."
                : selectedStatus === 'Rejected'
                ? "e.g. Outside municipal limits or duplicate issue already addressed."
                : "e.g. Complaint verified and scheduled for repair."
            }
            rows={2}
            className="input w-full text-xs p-2.5 resize-none leading-relaxed"
          />
        </div>

        {selectedStatus === 'Resolved' && (
          <div className="space-y-2 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{t('officer.resolution_proof_upload') || 'Resolution Proof Photo'}</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-medium">
                {t('officer.resolution_photo_required') || 'Proof photo helps citizens verify'}
              </span>
            </div>

            {previewUrl ? (
              <div className="relative inline-block mt-1">
                <img
                  src={previewUrl}
                  alt="Resolution Proof Preview"
                  className="w-32 h-24 object-cover rounded-lg border border-emerald-300 shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-sm"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-white/60 hover:bg-white"
              >
                <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-emerald-950">
                  {t('officer.upload_photo_click') || 'Click or drag to upload resolution proof'}
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  JPG, PNG, WebP up to 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary h-9 px-4 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('officer.updating') || 'Updating Status...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('officer.submit_status_update') || 'Confirm Status Update'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
