import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Trash2,
  Shield,
  Clock,
  ArrowLeft,
  Users,
  X,
  Tag,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminDepartments, useCreateDepartment, useDeleteDepartment } from '../api/hooks';

export const AdminDepartments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: departments = [], isLoading } = useAdminDepartments();
  const createDepartment = useCreateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [customId, setCustomId] = useState('');
  const [issueTypesInput, setIssueTypesInput] = useState('');
  const [slaHours, setSlaHours] = useState(48);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const coreDeptIds = ['dept-roads', 'dept-water', 'dept-electric'];

  const handleOpenModal = () => {
    setNameEn('');
    setNameTa('');
    setCustomId('');
    setIssueTypesInput('');
    setSlaHours(48);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim()) {
      toast.error('Department name (English) is required');
      return;
    }
    if (!nameTa.trim()) {
      toast.error('Department name (Tamil) is required');
      return;
    }

    const parsedTypes = issueTypesInput
      .split(',')
      .map(s => s.trim().toLowerCase().replace(/\s+/g, '_'))
      .filter(Boolean);

    createDepartment.mutate(
      {
        id: customId.trim() || undefined,
        name_en: nameEn.trim(),
        name_ta: nameTa.trim(),
        issue_types: parsedTypes,
        sla_hours: Number(slaHours) || 48,
      },
      {
        onSuccess: () => {
          toast.success(t('admin.dept_created_success') || 'Department added successfully!');
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Failed to create department');
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (coreDeptIds.includes(id)) {
      toast.error('Core municipal departments cannot be removed.');
      return;
    }

    if (window.confirm(`${t('admin.delete_dept_confirm') || 'Are you sure you want to delete this department?'} (${name})`)) {
      setDeletingId(id);
      deleteDepartment.mutate(id, {
        onSuccess: () => {
          toast.success(t('admin.dept_deleted_success') || 'Department removed successfully');
          setDeletingId(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.detail || 'Failed to remove department');
          setDeletingId(null);
        },
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
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
              <Building2 className="w-6 h-6 text-slate-blue-600" />
              <span>{t('admin.departments_title') || 'Department Management'}</span>
            </h1>
            <p className="text-xs text-muted">
              {t('admin.departments_subtitle') || 'Add and manage municipal departments and SLA configurations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="btn-secondary h-9 px-3.5 text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <Users className="w-4 h-4 text-slate-blue-600" />
            <span>{t('nav.admin_users') || 'Manage Users'}</span>
          </Link>
          <button
            onClick={handleOpenModal}
            className="btn-primary h-9 px-4 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.add_department') || 'Add Department'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3 border border-line">
          <div className="w-10 h-10 rounded-xl bg-slate-blue-50 text-slate-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted">Total Departments</p>
            <p className="text-xl font-bold text-ink">{departments.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 border border-line">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted">Core Municipal</p>
            <p className="text-xl font-bold text-ink">{departments.filter(d => coreDeptIds.includes(d.id)).length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 border border-line">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted">Custom Departments</p>
            <p className="text-xl font-bold text-ink">{departments.filter(d => !coreDeptIds.includes(d.id)).length}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>{t('common.loading') || 'Loading departments...'}</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <Building2 className="w-10 h-10 mx-auto text-slate-blue-300 mb-2" />
          <p className="font-semibold text-sm">{t('admin.no_departments') || 'No departments found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const isCore = coreDeptIds.includes(dept.id);
            return (
              <div
                key={dept.id}
                className="card p-5 border border-line flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-base font-bold text-ink leading-snug">{dept.name_en}</h2>
                      <p className="text-xs text-muted font-tamil mt-0.5">{dept.name_ta}</p>
                    </div>

                    {isCore ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Shield className="w-3 h-3" />
                        <span>{t('admin.core_badge') || 'Core'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Tag className="w-3 h-3" />
                        <span>{t('admin.custom_badge') || 'Custom'}</span>
                      </span>
                    )}
                  </div>

                  <div className="inline-block bg-slate-100 text-slate-600 font-mono text-[11px] px-2 py-0.5 rounded-md mb-3">
                    {dept.id}
                  </div>

                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      {t('admin.issue_types') || 'Handled Issue Types'}
                    </p>
                    {dept.issue_types && dept.issue_types.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {dept.issue_types.map((type) => (
                          <span
                            key={type}
                            className="bg-slate-blue-50 text-slate-blue-800 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-blue-100"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">General municipal issues</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-muted mt-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-blue-600" />
                    <span>SLA: <strong className="text-ink">{dept.sla_hours} hrs</strong></span>
                  </div>

                  <div>
                    {isCore ? (
                      <span className="text-[11px] text-muted italic flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        System Protected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(dept.id, dept.name_en)}
                        disabled={deletingId === dept.id}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete Department"
                      >
                        {deletingId === dept.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-line relative"
            >
              <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-slate-blue-50/50">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-blue-600" />
                  <h3 className="font-bold text-ink text-base">
                    {t('admin.add_department') || 'Add New Municipal Department'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('admin.name_en') || 'Department Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanitation & Waste Management"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('admin.name_ta') || 'Department Name (Tamil)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. துப்புரவு மற்றும் கழிவு மேலாண்மை"
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('admin.dept_id') || 'Custom Department ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. dept-sanitation (leave empty for auto-generated)"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="input w-full text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    {t('admin.dept_id_hint') || 'Unique identifier. If left blank, it will be generated from the English name.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('admin.issue_types') || 'Handled Issue Types (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. garbage, overflowing_bin, dead_animal"
                    value={issueTypesInput}
                    onChange={(e) => setIssueTypesInput(e.target.value)}
                    className="input w-full text-sm"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    {t('admin.issue_types_hint') || 'Comma-separated keywords or issue categories assigned to this department.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('admin.sla_hours') || 'SLA Resolution Target (Hours)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={slaHours}
                      onChange={(e) => setSlaHours(Number(e.target.value))}
                      className="input w-32 text-sm"
                    />
                    <span className="text-xs text-muted">hours (default: 48)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary h-9 px-4 text-xs font-semibold"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={createDepartment.isPending}
                    className="btn-primary h-9 px-5 text-xs font-semibold flex items-center gap-2"
                  >
                    {createDepartment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{t('admin.add_department') || 'Add Department'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
