import { useAdminUsers, useUpdateUser } from '../api/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ArrowLeft, Building2, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useAdminUsers();
  const updateUser = useUpdateUser();

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateUser.mutate({ id, data: { active: !currentActive } }, {
      onSuccess: () => toast.success(currentActive ? 'User deactivated' : 'User activated'),
    });
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
              <Users className="w-6 h-6 text-slate-blue-600" />
              <span>{t('admin.users_title') || 'User Management'}</span>
            </h1>
            <p className="text-xs text-muted">Manage citizen, officer, and administrator accounts (Roles are static)</p>
          </div>
        </div>

        <Link
          to="/admin/departments"
          className="btn-secondary h-9 px-3.5 text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <Building2 className="w-4 h-4 text-slate-blue-600" />
          <span>{t('nav.admin_departments') || 'Manage Departments'}</span>
        </Link>
      </div>

      <div className="card overflow-x-auto shadow-sm border border-line">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-blue-50/70 border-b border-line text-xs font-bold text-slate-blue-900 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-blue-600 mb-2" />
                  <span>Loading users...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted">No users found.</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-blue-50/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm text-ink">{u.name}</div>
                    <div className="text-[11px] text-muted font-mono">{u.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-ink">{u.email}</div>
                    <div className="text-muted text-[11px]">{u.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : u.role === 'officer'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      <Shield className="w-3 h-3 opacity-70" />
                      <span>{u.role}</span>
                    </span>
                    {u.department_id && (
                      <span className="text-[10px] text-muted block mt-1 font-mono">
                        {u.department_id}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id, u.active)}
                      className={`btn-secondary text-[11px] h-7 px-3 ${u.active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
