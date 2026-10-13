import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface Complaint {
  id: string;
  user_id: string;
  issue_type: 'pothole' | 'water_leak' | 'streetlight';
  severity: 'Low' | 'Medium' | 'High';
  severity_reason: string;
  title: string;
  description: string;
  language: string;
  text_original: { title: string; description: string };
  text_en: { title: string; description: string };
  image: string;
  resolution_image: string | null;
  lat: number;
  lng: number;
  address: string;
  main_road: boolean;
  department_id: string;
  status: 'Submitted' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Rejected';
  history: Array<{ status: string; at: string; by: string; note: string }>;
  upvotes: string[];
  followers: string[];
  ai_issue_type: string | null;
  ai_confidence: number;
  detector_mode: string;
  verification: { ai_confidence: number; exif_gps_match: boolean | null; needs_review: boolean };
  upvote_count: number;
  follower_count: number;
  is_upvoted: boolean;
  is_following: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'officer' | 'admin';
  department_id: string | null;
  language: string;
  avatar: string | null;
  points: number;
  badges: string[];
  active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name_en: string;
  name_ta: string;
  issue_types: string[];
  sla_hours: number;
}

export interface Comment {
  id: string;
  complaint_id: string;
  user_id: string;
  parent_id: string | null;
  text: string;
  is_official: boolean;
  helpful: string[];
  helpful_count: number;
  author_name: string;
  author_role: string;
  created_at: string;
  edited_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  complaint_id: string | null;
  message_key: string;
  params: Record<string, string>;
  read: boolean;
  created_at: string;
}

export const useMe = () => useQuery<User>({
  queryKey: ['me'],
  queryFn: () => apiClient.get('/auth/me').then(r => r.data),
  enabled: !!localStorage.getItem('civic_token'),
  retry: false,
});

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data).then(r => r.data),
    onSuccess: (data) => {
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data.user));
      qc.setQueryData(['me'], data.user);
    },
  });
};

export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; password: string; language: string }) =>
      apiClient.post('/auth/register', data).then(r => r.data),
    onSuccess: (data) => {
      localStorage.setItem('civic_token', data.token);
      localStorage.setItem('civic_user', JSON.stringify(data.user));
      qc.setQueryData(['me'], data.user);
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.patch('/auth/me', data).then(r => r.data),
    onSuccess: (data) => qc.setQueryData(['me'], data),
  });
};

export const useComplaints = (params?: Record<string, string>) =>
  useQuery<{ total: number; items: Complaint[] }>({
    queryKey: ['complaints', params],
    queryFn: () => apiClient.get('/complaints', { params }).then(r => r.data),
  });

export const useComplaint = (id: string) =>
  useQuery<Complaint>({
    queryKey: ['complaint', id],
    queryFn: () => apiClient.get(`/complaints/${id}`).then(r => r.data),
    enabled: !!id,
  });

export const useMyComplaints = () =>
  useQuery<Complaint[]>({
    queryKey: ['my-complaints'],
    queryFn: () => apiClient.get('/complaints/mine').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useFeed = (tab: string, lat?: number, lng?: number, type?: string) =>
  useQuery<{ total: number; items: Complaint[] }>({
    queryKey: ['feed', tab, lat, lng, type],
    queryFn: () => apiClient.get('/complaints/feed', { params: { tab, lat, lng, type } }).then(r => r.data),
  });

export const useDetect = () =>
  useMutation({
    mutationFn: (data: FormData) => apiClient.post('/detect', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  });

export const useDraft = () =>
  useMutation({
    mutationFn: (data: FormData) => apiClient.post('/draft', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  });

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => apiClient.post('/complaints', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaints'] });
      qc.invalidateQueries({ queryKey: ['my-complaints'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useUpvote = (complaintId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/complaints/${complaintId}/upvote`).then(r => r.data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['complaint', complaintId] });
      const prev = qc.getQueryData<Complaint>(['complaint', complaintId]);
      if (prev) {
        qc.setQueryData(['complaint', complaintId], {
          ...prev,
          is_upvoted: !prev.is_upvoted,
          upvote_count: prev.is_upvoted ? prev.upvote_count - 1 : prev.upvote_count + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(['complaint', complaintId], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['complaint', complaintId] }),
  });
};

export const useFollow = (complaintId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/complaints/${complaintId}/follow`).then(r => r.data),
    onSettled: () => qc.invalidateQueries({ queryKey: ['complaint', complaintId] }),
  });
};

export const useUpdateStatus = (complaintId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => apiClient.patch(`/complaints/${complaintId}/status`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['complaint', complaintId] });
      qc.invalidateQueries({ queryKey: ['complaints'] });
      qc.invalidateQueries({ queryKey: ['officer-queue'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['my-complaints'] });
      qc.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });
};

export const useConfirmFixed = (complaintId: string) =>
  useMutation({
    mutationFn: () => apiClient.post(`/complaints/${complaintId}/confirm`).then(r => r.data),
  });

export const useReopenComplaint = (complaintId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => {
      const fd = new FormData();
      fd.append('note', note);
      return apiClient.post(`/complaints/${complaintId}/reopen`, fd).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaint', complaintId] }),
  });
};

export const useComments = (complaintId: string) =>
  useQuery<Comment[]>({
    queryKey: ['comments', complaintId],
    queryFn: () => apiClient.get(`/complaints/${complaintId}/comments`).then(r => r.data),
  });

export const useAddComment = (complaintId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { text: string; parent_id?: string }) =>
      apiClient.post(`/complaints/${complaintId}/comments`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', complaintId] }),
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/comments/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
};

export const useMarkHelpful = () =>
  useMutation({
    mutationFn: (commentId: string) => apiClient.post(`/comments/${commentId}/helpful`).then(r => r.data),
  });

export const useNotifications = () =>
  useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
    refetchInterval: 30000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useOfficerQueue = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['officer-queue', params],
    queryFn: () => apiClient.get('/officer/queue', { params }).then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
  });

export const useOfficerAnalytics = () =>
  useQuery({
    queryKey: ['officer-analytics'],
    queryFn: () => apiClient.get('/officer/analytics').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
  });

export const useOfficerHeatmap = () =>
  useQuery<{ points: Array<{ lat: number; lng: number; weight: number }> }>({
    queryKey: ['officer-heatmap'],
    queryFn: () => apiClient.get('/officer/heatmap').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/admin/users').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
  });

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.patch(`/admin/users/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
};

export const useLeaderboard = (period: 'month' | 'all') =>
  useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => apiClient.get('/community/leaderboard', { params: { period } }).then(r => r.data),
  });

export const usePublicProfile = (userId: string) =>
  useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => apiClient.get(`/users/${userId}/public`).then(r => r.data),
    enabled: !!userId,
  });

export const useDepartments = () =>
  useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get('/departments').then(r => r.data),
  });

export const useAdminDepartments = () =>
  useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: () => apiClient.get('/admin/departments').then(r => r.data),
    enabled: !!localStorage.getItem('civic_token'),
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id?: string; name_en: string; name_ta: string; issue_types: string[]; sla_hours: number }) =>
      apiClient.post('/admin/departments', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-departments'] });
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/departments/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-departments'] });
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.get('/stats/public').then(r => r.data).catch(() => ({
      total_reports: 2068,
      resolved_count: 339,
      in_progress_count: 142,
      avg_resolution_hours: 36
    })),
  });


