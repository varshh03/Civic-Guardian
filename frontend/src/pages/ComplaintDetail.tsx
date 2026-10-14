import { useParams, useNavigate } from 'react-router-dom';
import { useComplaint } from '../api/hooks';
import { StatusTimeline } from '../components/StatusTimeline';
import { CommentThread } from '../components/CommentThread';
import { SeverityChip } from '../components/SeverityChip';
import { StatusChip } from '../components/StatusChip';
import { TypeIcon } from '../components/TypeIcon';
import { UpvoteButton } from '../components/UpvoteButton';
import { OfficerStatusPanel } from '../components/OfficerStatusPanel';
import { useAuth } from '../context/AuthContext';
import { useUpvote, useFollow } from '../api/hooks';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { formatRelativeTime } from '../lib/utils';
import { Share2, MapPin, AlertTriangle, CheckCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedComplaintTitle, getLocalizedComplaintDesc } from '../lib/localizeComplaint';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: c, isLoading, error } = useComplaint(id || '');
  const { user } = useAuth();
  
  const upvoteMutation = useUpvote(id || '');
  const followMutation = useFollow(id || '');

  const [showOriginal, setShowOriginal] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: c?.title || 'Civic Issue',
        text: `Check this civic issue on Civic Guardian: ${c?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('complaint.link_copied') || 'Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 flex flex-col items-center justify-center gap-3 text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-slate-blue-600" />
        <p className="text-sm font-medium">{t('feed.loading') || 'Loading report details...'}</p>
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="max-w-md mx-auto p-8 card text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-ink">{t('complaint.not_found') || 'Report Not Found'}</h2>
        <p className="text-xs text-muted">The requested issue report could not be found or has been removed.</p>
        <button onClick={() => navigate('/feed')} className="btn-primary h-9 px-4 text-xs">
          {t('common.back') || 'Go Back'}
        </button>
      </div>
    );
  }

  const displayTitle = showOriginal 
    ? (c.text_original?.title || c.title) 
    : getLocalizedComplaintTitle(c, i18n.language);

  const displayDesc = showOriginal 
    ? (c.text_original?.description || c.description) 
    : getLocalizedComplaintDesc(c, i18n.language);

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 pb-20">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-slate-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back') || 'Back'}</span>
          </button>
          <span className="text-xs font-semibold text-muted bg-slate-100 px-2.5 py-0.5 rounded-full">
            ID: {c.id}
          </span>
        </div>

        <div className="card overflow-hidden shadow-sm border border-line">
          <div className="relative bg-black h-72">
            <img
              src={`${API_BASE}/uploads/${c.image}`}
              alt={displayTitle}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/600x400/E4EAF4/4A6491?text=${c.issue_type}`;
              }}
            />
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <StatusChip status={c.status} />
              <SeverityChip severity={c.severity} />
              <span className="chip bg-slate-blue-50 text-slate-blue-700 border-slate-blue-200 flex items-center gap-1 text-xs">
                <TypeIcon type={c.issue_type} className="w-3.5 h-3.5" />
                <span>{t(`issue_type.${c.issue_type}`) || c.issue_type}</span>
              </span>
              {c.verification?.needs_review && (
                <span className="chip bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t('complaint.needs_review') || 'Needs Review'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-3 text-ink">{displayTitle}</h1>
            <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">{displayDesc}</p>
            
            {c.language !== 'en' && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs text-slate-blue-600 font-semibold mt-3 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{showOriginal ? (t('complaint.show_english') || 'Show translated') : (t('complaint.show_original') || 'Show original text')}</span>
              </button>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-line">
              <div className="flex items-center gap-3">
                <UpvoteButton
                  count={c.upvote_count}
                  isUpvoted={c.is_upvoted}
                  onUpvote={() => user && upvoteMutation.mutate()}
                  disabled={!user || upvoteMutation.isPending}
                />
                <button
                  onClick={() => user && followMutation.mutate()}
                  disabled={!user || followMutation.isPending}
                  className="btn-secondary h-9 px-4 text-xs font-semibold"
                >
                  {c.is_following ? (t('complaint.following') || 'Following') : (t('complaint.follow') || 'Follow Updates')}
                </button>
              </div>
              <button
                onClick={handleShare}
                className="p-2 text-muted hover:text-ink rounded-full hover:bg-slate-blue-50 transition-colors"
                title={t('complaint.share') || 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <OfficerStatusPanel complaint={c} />

        <CommentThread complaintId={c.id} />
      </div>

      <div className="lg:w-80 space-y-6">
        <div className="card p-5 space-y-3 shadow-sm border border-line">
          <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-blue-600" />
            <span>{t('report.step_location') || 'Location'}</span>
          </h3>
          <div className="h-44 rounded-lg overflow-hidden border border-line z-0">
            <MapContainer center={[c.lat, c.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <Marker position={[c.lat, c.lng]} icon={markerIcon} />
            </MapContainer>
          </div>
          <div className="text-xs text-ink space-y-1">
            <p className="font-semibold">{c.address || (t('app.municipality') || 'Municipal Corporation')}</p>
            <p className="text-muted text-[11px] font-mono">
              {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
            </p>
          </div>
        </div>

        <div className="card p-5 space-y-3 shadow-sm border border-line">
          <h3 className="font-bold text-sm text-ink">
            {t('complaint.timeline') || 'Status History'}
          </h3>
          <StatusTimeline history={c.history} />
        </div>

        {c.resolution_image && (
          <div className="card p-5 border-emerald-200 bg-emerald-50/30 space-y-3 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-4 h-4" />
              <span>{t('complaint.resolution_photo') || 'Resolution Proof'}</span>
            </h3>
            <img
              src={`${API_BASE}/uploads/${c.resolution_image}`}
              className="w-full rounded-lg object-cover border border-emerald-200"
              alt="Resolved"
            />
          </div>
        )}
      </div>
    </div>
  );
};
