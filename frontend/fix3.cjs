const fs = require('fs');

const Home = `import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../api/hooks';
import { KARUR_CENTER } from '../lib/geo';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, Navigation2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { SeverityChip } from '../components/SeverityChip';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const createIcon = (color: string) => L.divIcon({
  html: \`<div style="background-color: \${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>\`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#64748b', Acknowledged: '#3b82f6', 'In Progress': '#8b5cf6', Resolved: '#10b981', Rejected: '#ef4444'
};
const SEVERITY_COLORS: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export const Home = () => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [colorMode, setColorMode] = useState<'status'|'severity'>('status');

  const { data } = useComplaints();
  const complaints = data?.items || [];

  const filtered = complaints.filter(c => 
    (filterType === 'all' || c.issue_type === filterType) &&
    (filterStatus === 'all' || c.status === filterStatus)
  );

  const LocateButton = () => {
    const map = useMap();
    return (
      <button onClick={() => {
        navigator.geolocation.getCurrentPosition(pos => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
        });
      }} className="absolute top-4 right-4 z-[400] bg-white p-2 rounded shadow-md text-slate-blue-600 hover:text-slate-blue-800">
        <Navigation2 className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] bg-white rounded-card overflow-hidden shadow-sm border border-line flex flex-col md:flex-row">
      <div className="md:w-72 border-r border-line p-4 overflow-y-auto bg-surface flex-shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-2 font-bold text-lg"><Filter className="w-5 h-5"/> Filters</div>
        <div>
          <label className="text-sm font-medium mb-1 block">Color By</label>
          <select value={colorMode} onChange={e => setColorMode(e.target.value as any)} className="input w-full">
            <option value="status">Status</option>
            <option value="severity">Severity</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Issue Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-full">
            <option value="all">All Types</option>
            <option value="pothole">Pothole</option>
            <option value="water_leak">Water Leak</option>
            <option value="streetlight">Streetlight</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-full">
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="mt-auto text-sm text-muted">Showing {filtered.length} reports</div>
      </div>
      <div className="flex-1 relative z-0">
        <MapContainer center={KARUR_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <LocateButton />
          <MarkerClusterGroup chunkedLoading>
            {filtered.map(c => {
              const color = colorMode === 'status' ? STATUS_COLORS[c.status] : SEVERITY_COLORS[c.severity] || '#999';
              return (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={createIcon(color)}>
                  <Popup>
                    <div className="w-48">
                      <img src={\`\${API_BASE}/uploads/\${c.image}\`} className="w-full h-24 object-cover rounded mb-2" alt="" />
                      <div className="font-bold text-sm mb-1 line-clamp-1">{c.title}</div>
                      <div className="flex gap-1 mb-2">
                        <StatusChip status={c.status} /> <SeverityChip severity={c.severity} />
                      </div>
                      <Link to={\`/complaints/\${c.id}\`} className="text-blue-600 text-sm hover:underline">View Details →</Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};
`;

const ComplaintCard = `import { Link } from 'react-router-dom';
import { MapPin, MessageSquare } from 'lucide-react';
import { SeverityChip } from './SeverityChip';
import { StatusChip } from './StatusChip';
import { TypeIcon } from './TypeIcon';
import { UpvoteButton } from './UpvoteButton';
import { useUpvote } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface Complaint {
  id: string;
  issue_type: string;
  severity: string;
  status: string;
  title: string;
  address: string;
  image: string;
  upvote_count: number;
  is_upvoted: boolean;
  created_at: string;
  verification?: { needs_review: boolean };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ComplaintCard = ({ complaint, showUpvote = true }: { complaint: Complaint; showUpvote?: boolean }) => {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const upvoteMutation = useUpvote(complaint.id);

  return (
    <div className="card p-4 flex gap-3 hover:shadow-card-hover transition-shadow">
      {/* Photo */}
      <Link to={\`/complaints/\${complaint.id}\`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-blue-50">
          <img
            src={\`\${API_BASE}/uploads/\${complaint.image}\`}
            alt={complaint.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = \`https://placehold.co/80x80/E4EAF4/4A6491?text=\${complaint.issue_type.charAt(0).toUpperCase()}\`;
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TypeIcon type={complaint.issue_type} className="w-4 h-4" />
            <SeverityChip severity={complaint.severity} />
            <StatusChip status={complaint.status} />
            {complaint.verification?.needs_review && (
              <span className="chip bg-amber-50 text-amber-700 border border-amber-200 text-xs">⚠ Review</span>
            )}
          </div>
          <span className="text-xs text-muted flex-shrink-0">{formatRelativeTime(complaint.created_at, i18n.language)}</span>
        </div>

        <Link to={\`/complaints/\${complaint.id}\`}>
          <h3 className="font-semibold text-sm text-ink mt-1 line-clamp-2 hover:text-slate-blue-600 transition-colors">{complaint.title}</h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 text-xs text-muted">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{complaint.address || 'Karur'}</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted">{complaint.id}</span>
          {showUpvote && (
            <UpvoteButton
              count={complaint.upvote_count}
              isUpvoted={complaint.is_upvoted}
              onUpvote={() => isAuthenticated && upvoteMutation.mutate()}
              disabled={!isAuthenticated || upvoteMutation.isPending}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};
`;

const Notifications = `import { useNotifications, useMarkAllRead, useMarkRead } from '../api/hooks';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export const Notifications = () => {
  const { i18n } = useTranslation();
  const { data, isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();

  const notifs = data?.notifications || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="w-6 h-6" /> Notifications</h1>
        {notifs.some(n => !n.read) && (
          <button onClick={() => markAll.mutate()} disabled={markAll.isPending} className="text-sm font-medium text-slate-blue-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? <div>Loading...</div> : notifs.length === 0 ? (
          <div className="card p-12 text-center text-muted flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-slate-blue-200 mb-2" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifs.map(n => (
            <Link
              key={n.id}
              to={n.complaint_id ? \`/complaints/\${n.complaint_id}\` : '#'}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn("block card p-4 transition-colors", !n.read ? "bg-slate-blue-50/50 border-slate-blue-200" : "hover:bg-slate-blue-50/30")}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className={cn("text-sm", !n.read ? "font-bold text-ink" : "text-muted")}>{n.message_key}</p>
                  {n.complaint_id && <p className="text-xs text-muted mt-1">Ref: {n.complaint_id}</p>}
                </div>
                <span className="text-xs text-muted whitespace-nowrap">{formatRelativeTime(n.created_at, i18n.language)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
`;

const OfficerQueue = `import { useState } from 'react';
import { useOfficerQueue } from '../api/hooks';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { SeverityChip } from '../components/SeverityChip';
import { AlertCircle, Clock } from 'lucide-react';

export const OfficerQueue = () => {
  const [statusFilter, setStatusFilter] = useState('active');
  const { data, isLoading } = useOfficerQueue({ status: statusFilter });
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Officer Action Queue</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
          <option value="active">Active Issues</option>
          <option value="all">All Issues</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-blue-50 border-b border-line text-sm text-muted">
              <th className="p-4 font-medium">ID / Title</th>
              <th className="p-4 font-medium">Priority Score</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">SLA Status</th>
              <th className="p-4 font-medium">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr> : (data?.items || []).map((c: any) => (
              <tr key={c.id} onClick={() => navigate(\`/complaints/\${c.id}\`)} className="hover:bg-slate-blue-50/50 cursor-pointer transition-colors">
                <td className="p-4">
                  <div className="font-bold text-sm text-ink line-clamp-1">{c.title}</div>
                  <div className="text-xs text-muted font-mono">{c.id}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-blue-700">{Math.round(c.priority_score)}</div>
                    {c.priority_score > 75 && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
                <td className="p-4"><StatusChip status={c.status} /></td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                     <Clock className="w-3.5 h-3.5"/> ~4h left
                  </div>
                </td>
                <td className="p-4 flex gap-1"><SeverityChip severity={c.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`;

const Leaderboard = `import { useState } from 'react';
import { useLeaderboard } from '../api/hooks';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '../lib/utils';

export const Leaderboard = () => {
  const [period, setPeriod] = useState<'month'|'all'>('month');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-amber-500 w-7 h-7" /> Leaderboard</h1>
        <div className="bg-white rounded-lg p-1 border border-line flex text-sm">
          <button onClick={() => setPeriod('month')} className={cn("px-4 py-1.5 rounded-md", period === 'month' ? "bg-slate-blue-50 text-slate-blue-700 font-bold" : "text-muted")}>This Month</button>
          <button onClick={() => setPeriod('all')} className={cn("px-4 py-1.5 rounded-md", period === 'all' ? "bg-slate-blue-50 text-slate-blue-700 font-bold" : "text-muted")}>All Time</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <div className="p-8 text-center">Loading...</div> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-blue-50 border-b border-line text-sm text-muted">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">Citizen</th>
                <th className="p-4 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(data || []).map((user: any, i: number) => (
                <tr key={user.id} className="hover:bg-slate-blue-50/50">
                  <td className="p-4 font-bold text-slate-blue-600">
                    {i === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> : i === 1 ? <Medal className="w-6 h-6 text-gray-400" /> : i === 2 ? <Medal className="w-6 h-6 text-amber-700" /> : \`#\${i + 1}\`}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-ink">{user.name}</div>
                    <div className="text-xs text-muted">{user.badges?.join(', ')}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-blue-700">{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
`;

const Report = `import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDetect, useDraft, useCreateComplaint } from '../api/hooks';
import { compressImage } from '../lib/image';
import { AiResultCard } from '../components/AiResultCard';
import { DuplicateModal } from '../components/DuplicateModal';
import { Camera, Upload, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const LocationPicker = ({ pos, setPos }: { pos: [number, number]; setPos: (p: [number, number]) => void }) => {
  useMapEvents({
    click(e) { setPos([e.latlng.lat, e.latlng.lng]); }
  });
  return <Marker position={pos} icon={markerIcon} draggable eventHandlers={{ dragend: (e) => { const marker = e.target; setPos([marker.getLatLng().lat, marker.getLatLng().lng]); } }} />;
};

export const Report = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const detectMutation = useDetect();
  const draftMutation = useDraft();
  const createMutation = useCreateComplaint();

  const [aiData, setAiData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [pos, setPos] = useState<[number, number]>([10.9574, 78.0809]);
  const [address, setAddress] = useState('');
  const [mainRoad, setMainRoad] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
    
    // Auto proceed to detect
    setStep(2);
    const fd = new FormData(); fd.append('file', compressed);
    detectMutation.mutate(fd, {
      onSuccess: (data) => {
        setAiData(data);
        setTitle(data.draft_title);
        setDesc(data.draft_description);
      },
      onError: () => {
        toast.error('AI Detection failed. You can proceed manually.');
        setAiData({ ai_issue_type: 'pothole', confidence: 0, severity: 'Medium', severity_reason: '', department_id: 'dept_roads', detector_mode: 'manual' });
      }
    });
  };

  const handleTypeChange = (newType: string) => {
    if (!file) return;
    setAiData({ ...aiData, ai_issue_type: newType });
    const fd = new FormData(); fd.append('file', file); fd.append('issue_type', newType);
    draftMutation.mutate(fd, {
      onSuccess: (data) => { setTitle(data.title); setDesc(data.description); }
    });
  };

  const submitFinal = (forceNew = false) => {
    if (!file || !aiData) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('issue_type', aiData.ai_issue_type);
    fd.append('severity', aiData.severity);
    fd.append('severity_reason', aiData.severity_reason || '');
    fd.append('title', title);
    fd.append('description', desc);
    fd.append('lat', pos[0].toString());
    fd.append('lng', pos[1].toString());
    fd.append('address', address);
    fd.append('main_road', mainRoad.toString());
    if (forceNew) fd.append('force_new', 'true');
    fd.append('language', 'en'); // TODO from user pref

    createMutation.mutate(fd, {
      onSuccess: (res) => {
        toast.success('Issue reported successfully!');
        navigate(\`/complaints/\${res.id}\`);
      },
      onError: (err: any) => {
        if (err.response?.status === 409) {
          setDuplicateData(err.response.data.duplicate_of);
        } else {
          toast.error(err.response?.data?.detail || 'Failed to submit report');
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">{t('nav.report')}</h1>
      
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-line -z-10 -translate-y-1/2" />
        {[1, 2, 3].map(i => (
          <div key={i} className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors \${step >= i ? 'bg-slate-blue-600 text-white' : 'bg-white border-2 border-line text-muted'}\`}>
            {i}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card p-8 text-center border-dashed border-2 border-slate-blue-300 bg-slate-blue-50/50">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-blue-600">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Upload a Photo</h2>
          <p className="text-muted mb-6">Take a clear picture of the issue for AI analysis.</p>
          <div className="flex gap-4 justify-center">
             <button onClick={() => fileInputRef.current?.click()} className="btn-primary h-12 px-6 flex items-center gap-2"><Camera/> Take Photo</button>
             <button onClick={() => fileInputRef.current?.click()} className="btn-secondary h-12 px-6 flex items-center gap-2"><Upload/> Browse</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="relative rounded-card overflow-hidden h-64 bg-black">
            <img src={preview} className="w-full h-full object-contain" />
            <button onClick={() => setStep(1)} className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">Retake</button>
          </div>
          
          {detectMutation.isPending ? (
            <div className="card p-8 flex flex-col items-center justify-center text-slate-blue-600 h-64">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-medium animate-pulse">AI is analyzing your image...</p>
            </div>
          ) : aiData && (
            <AiResultCard
              confidence={aiData.confidence}
              issueType={aiData.ai_issue_type}
              severity={aiData.severity}
              severityReason={aiData.severity_reason}
              department={aiData.department_id}
              isStub={aiData.detector_mode === 'stub'}
              title={title}
              description={desc}
              onTitleChange={setTitle}
              onDescChange={setDesc}
              onTypeChange={handleTypeChange}
            />
          )}
          
          <div className="flex justify-end pt-4">
            <button onClick={() => setStep(3)} disabled={!aiData} className="btn-primary h-11 px-8 text-lg w-full sm:w-auto">Next: Location</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="card p-4 space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="font-bold flex items-center gap-2"><MapPin className="text-slate-blue-600"/> Pinpoint Location</h3>
               <button onClick={() => navigator.geolocation.getCurrentPosition(p => setPos([p.coords.latitude, p.coords.longitude]))} className="text-sm text-slate-blue-600 font-medium hover:underline">Use Current GPS</button>
            </div>
            <div className="h-64 rounded-lg overflow-hidden border border-line z-0">
               <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker pos={pos} setPos={setPos} />
               </MapContainer>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street Address / Landmark (Optional)</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input w-full" placeholder="e.g. Near Bus Stand" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={mainRoad} onChange={e => setMainRoad(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-slate-blue-600 focus:ring-slate-blue-600" />
              This is on a main road / arterial road
            </label>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => submitFinal(false)} disabled={createMutation.isPending} className="btn-primary flex-2 w-2/3">
              {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}

      <DuplicateModal
        isOpen={!!duplicateData}
        onClose={() => setDuplicateData(null)}
        duplicate={duplicateData}
        isSubmitting={createMutation.isPending}
        onSubmitAnyway={() => { setDuplicateData(null); submitFinal(true); }}
        onSupport={() => {
           if(duplicateData) navigate(\`/complaints/\${duplicateData.id}\`);
        }}
      />
    </div>
  );
};
`;

const ComplaintDetail = `import { useParams, useNavigate } from 'react-router-dom';
import { useComplaint } from '../api/hooks';
import { StatusTimeline } from '../components/StatusTimeline';
import { CommentThread } from '../components/CommentThread';
import { SeverityChip } from '../components/SeverityChip';
import { StatusChip } from '../components/StatusChip';
import { TypeIcon } from '../components/TypeIcon';
import { UpvoteButton } from '../components/UpvoteButton';
import { useAuth } from '../context/AuthContext';
import { useUpvote, useFollow } from '../api/hooks';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { formatRelativeTime } from '../lib/utils';
import { Share2, MapPin, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: c, isLoading } = useComplaint(id || '');
  const { user } = useAuth();
  
  const upvoteMutation = useUpvote(id || '');
  const followMutation = useFollow(id || '');

  const [showOriginal, setShowOriginal] = useState(false);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!c) return <div className="p-8 text-center text-red-500">Complaint not found</div>;

  const isOwner = user?.id === c.user_id;
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  const displayTitle = showOriginal ? c.text_original.title : (c.language === i18n.language ? c.title : c.text_en.title || c.title);
  const displayDesc = showOriginal ? c.text_original.description : (c.language === i18n.language ? c.description : c.text_en.description || c.description);

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 pb-20">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>

        <div className="card overflow-hidden">
          <img src={\`\${API_BASE}/uploads/\${c.image}\`} alt={displayTitle} className="w-full h-72 object-cover bg-black" />
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <StatusChip status={c.status} />
              <SeverityChip severity={c.severity} />
              <span className="chip bg-slate-blue-50 text-slate-blue-700 border-slate-blue-200 flex items-center gap-1">
                <TypeIcon type={c.issue_type} className="w-3.5 h-3.5" /> {c.issue_type}
              </span>
              {c.verification.needs_review && (
                <span className="chip bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Needs Review</span>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2 text-ink">{displayTitle}</h1>
            <p className="text-ink whitespace-pre-wrap">{displayDesc}</p>
            
            {c.language !== 'en' && (
               <button onClick={() => setShowOriginal(!showOriginal)} className="text-xs text-slate-blue-600 mt-2 hover:underline">
                 {showOriginal ? 'Show translated' : 'Show original text'}
               </button>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-line">
              <div className="flex items-center gap-4">
                <UpvoteButton count={c.upvote_count} isUpvoted={c.is_upvoted} onUpvote={() => user && upvoteMutation.mutate()} disabled={!user} />
                <button onClick={() => user && followMutation.mutate()} disabled={!user} className="btn-secondary h-9 px-4">
                  {c.is_following ? 'Following' : 'Follow Updates'}
                </button>
              </div>
              <button className="p-2 text-muted hover:text-ink rounded-full hover:bg-slate-blue-50"><Share2 className="w-5 h-5"/></button>
            </div>
          </div>
        </div>

        <CommentThread complaintId={c.id} />
      </div>

      {/* Sidebar */}
      <div className="lg:w-80 space-y-6">
        <div className="card p-5">
          <h3 className="font-bold mb-4">Location</h3>
          <div className="h-40 rounded-lg overflow-hidden border border-line mb-3 z-0">
            <MapContainer center={[c.lat, c.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[c.lat, c.lng]} icon={markerIcon} />
            </MapContainer>
          </div>
          <p className="text-sm flex items-start gap-2 text-ink">
            <MapPin className="w-4 h-4 mt-0.5 text-slate-blue-500 flex-shrink-0" />
            <span>{c.address || 'Location not specified'}<br/><span className="text-muted text-xs">{c.lat.toFixed(5)}, {c.lng.toFixed(5)}</span></span>
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4">Status History</h3>
          <StatusTimeline history={c.history} />
        </div>

        {c.resolution_image && (
          <div className="card p-5 border-emerald-200 bg-emerald-50/30">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-emerald-800"><CheckCircle className="w-5 h-5"/> Resolution Proof</h3>
            <img src={\`\${API_BASE}/uploads/\${c.resolution_image}\`} className="w-full rounded-lg object-cover border border-emerald-200" alt="Resolved" />
          </div>
        )}

      </div>
    </div>
  );
};
`;

const AiResultCard = `import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TypeIcon } from './TypeIcon';
import { SeverityChip } from './SeverityChip';
import { cn } from '../lib/utils';

interface AiResultCardProps {
  confidence: number;
  issueType: string;
  severity: string;
  severityReason: string;
  department: string;
  isStub: boolean;
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onTypeChange?: (v: string) => void;
}

export const AiResultCard = ({
  confidence, issueType, severity, severityReason, department, isStub,
  title, description, onTitleChange, onDescChange, onTypeChange
}: AiResultCardProps) => {
  const { t } = useTranslation();
  const lowConfidence = confidence < 0.6;

  return (
    <div className="card p-5 space-y-4 border-2 border-slate-blue-200 bg-slate-blue-50/30">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <TypeIcon type={issueType} className="w-6 h-6" />
          <h3 className="font-semibold text-lg">{t('report.ai_analysis')}</h3>
          {isStub && <span className="chip bg-blue-100 text-blue-800 text-xs font-bold border-blue-200">Demo AI</span>}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-blue-700">{Math.round(confidence * 100)}% {t('report.confidence')}</div>
          <div className="w-24 h-1.5 bg-slate-blue-100 rounded-full mt-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: \`\${confidence * 100}%\` }}
              className={cn("h-full", confidence > 0.8 ? "bg-emerald-500" : confidence > 0.6 ? "bg-amber-500" : "bg-red-500")}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center text-sm">
        <SeverityChip severity={severity} />
        <span className="text-muted">•</span>
        <span className="font-medium text-ink">{department}</span>
      </div>
      {severityReason && <p className="text-sm text-muted bg-white p-2 rounded border border-line">{severityReason}</p>}

      {lowConfidence && onTypeChange && (
        <div className="mt-4">
          <p className="text-sm font-medium text-amber-700 mb-2">Confidence is low. Please confirm the issue type:</p>
          <div className="grid grid-cols-3 gap-2">
            {['pothole', 'water_leak', 'streetlight'].map(t => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={cn(
                  "p-2 rounded border flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  issueType === t ? "bg-slate-blue-600 text-white border-slate-blue-600" : "bg-white text-muted border-line hover:border-slate-blue-300"
                )}
              >
                <TypeIcon type={t} className="w-5 h-5" />
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 mt-4 pt-4 border-t border-line">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t('report.title')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">{t('report.description')}</label>
          <textarea
            value={description}
            onChange={(e) => onDescChange(e.target.value)}
            className="input w-full h-24 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/pages/Home.tsx', Home);
fs.writeFileSync('src/pages/Report.tsx', Report);
fs.writeFileSync('src/pages/ComplaintDetail.tsx', ComplaintDetail);
fs.writeFileSync('src/pages/Notifications.tsx', Notifications);
fs.writeFileSync('src/pages/OfficerQueue.tsx', OfficerQueue);
fs.writeFileSync('src/pages/Leaderboard.tsx', Leaderboard);
fs.writeFileSync('src/components/ComplaintCard.tsx', ComplaintCard);
fs.writeFileSync('src/components/AiResultCard.tsx', AiResultCard);

