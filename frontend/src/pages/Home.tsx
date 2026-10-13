import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../api/hooks';
import { KARUR_CENTER } from '../lib/geo';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, Navigation2, Layers, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusChip } from '../components/StatusChip';
import { SeverityChip } from '../components/SeverityChip';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const createIcon = (color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.35);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#64748b',
  Acknowledged: '#3b82f6',
  'In Progress': '#8b5cf6',
  Resolved: '#10b981',
  Rejected: '#ef4444'
};

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444'
};

export const Home = () => {
  const { t, i18n } = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [colorMode, setColorMode] = useState<'status' | 'severity'>('status');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data, isLoading } = useComplaints();
  const complaints = data?.items || [];

  const filtered = complaints.filter(c => 
    (filterType === 'all' || c.issue_type === filterType) &&
    (filterStatus === 'all' || c.status === filterStatus)
  );

  const LocateButton = () => {
    const map = useMap();
    return (
      <button
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
              toast.success(t('map.locate_me') || 'Location found!');
            },
            () => toast.error('Unable to retrieve GPS location')
          );
        }}
        className="absolute top-4 right-4 z-[400] bg-white p-2.5 rounded-xl shadow-lg border border-line text-slate-blue-700 hover:bg-slate-blue-50 active:scale-95 transition-all"
        title={t('map.locate_me') || 'Locate Me'}
      >
        <Navigation2 className="w-5 h-5 fill-slate-blue-600" />
      </button>
    );
  };

  return (
    <div className="relative h-[calc(100vh-8.5rem)] bg-white rounded-2xl overflow-hidden shadow-sm border border-line flex flex-col md:flex-row">
      <div className="md:hidden p-2.5 bg-surface border-b border-line flex items-center justify-between z-10">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5 text-slate-blue-600" />
          <span>{t('officer.filters') || 'Filters'} ({filtered.length})</span>
        </button>
        <span className="text-xs text-muted font-medium">
          {filtered.length} {t('leaderboard.reports') || 'reports'}
        </span>
      </div>

      <div
        className={`md:w-72 border-r border-line p-4 overflow-y-auto bg-surface flex-shrink-0 flex flex-col gap-4 z-20 ${
          mobileFilterOpen ? 'block absolute inset-0 z-30' : 'hidden md:flex'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-ink">
            <Filter className="w-4 h-4 text-slate-blue-600"/>
            <span>{t('officer.filters') || 'Filters'}</span>
          </div>
          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-1 rounded-lg text-muted hover:text-ink md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-ink mb-1.5 block">
            {t('map.color_by') || 'Color Pins By'}
          </label>
          <select
            value={colorMode}
            onChange={e => setColorMode(e.target.value as any)}
            className="input w-full text-xs"
          >
            <option value="status">{t('status.label') || 'Status'}</option>
            <option value="severity">{t('severity.label') || 'Severity'}</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-ink mb-1.5 block">
            {t('feed.filter_type') || 'Issue Category'}
          </label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="input w-full text-xs"
          >
            <option value="all">{t('officer.all_types') || 'All Types'}</option>
            <option value="pothole">{t('issue_type.pothole') || 'Road Damage'}</option>
            <option value="water_leak">{t('issue_type.water_leak') || 'Water Leak'}</option>
            <option value="streetlight">{t('issue_type.streetlight') || 'Faulty Streetlight'}</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-ink mb-1.5 block">
            {t('feed.filter_status') || 'Resolution Status'}
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input w-full text-xs"
          >
            <option value="all">{t('officer.all_statuses') || 'All Statuses'}</option>
            <option value="Submitted">{t('status.Submitted') || 'Submitted'}</option>
            <option value="Acknowledged">{t('status.Acknowledged') || 'Acknowledged'}</option>
            <option value="In Progress">{t('status.InProgress') || 'In Progress'}</option>
            <option value="Resolved">{t('status.Resolved') || 'Resolved'}</option>
          </select>
        </div>

        {mobileFilterOpen && (
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="btn-primary h-9 text-xs w-full mt-2"
          >
            {t('common.apply') || 'Apply Filters'}
          </button>
        )}

        <div className="mt-auto pt-4 border-t border-line text-xs text-muted flex items-center justify-between">
          <span>{t('analytics.total') || 'Total Reports'}:</span>
          <span className="font-bold text-ink">{filtered.length}</span>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={KARUR_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocateButton />
          <MarkerClusterGroup chunkedLoading>
            {filtered.map(c => {
              const color = colorMode === 'status' ? STATUS_COLORS[c.status] : SEVERITY_COLORS[c.severity] || '#999';
              const displayTitle = c.language === i18n.language ? c.title : (c.text_original?.title || c.title);
              return (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={createIcon(color)}>
                  <Popup>
                    <div className="w-52 p-1">
                      <img
                        src={`${API_BASE}/uploads/${c.image}`}
                        className="w-full h-24 object-cover rounded-lg mb-2 shadow-xs"
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/120x80/E4EAF4/4A6491?text=${c.issue_type}`;
                        }}
                      />
                      <div className="font-bold text-xs mb-1 line-clamp-2 text-ink">{displayTitle}</div>
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        <StatusChip status={c.status} />
                        <SeverityChip severity={c.severity} />
                      </div>
                      <Link
                        to={`/complaints/${c.id}`}
                        className="btn-primary text-[11px] h-7 px-3 w-full flex items-center justify-center font-semibold"
                      >
                        {t('complaint.view_details') || 'View Details →'}
                      </Link>
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
