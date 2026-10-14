import { Link } from 'react-router-dom';
import { MapPin, MessageSquare } from 'lucide-react';
import { SeverityChip } from './SeverityChip';
import { StatusChip } from './StatusChip';
import { TypeIcon } from './TypeIcon';
import { UpvoteButton } from './UpvoteButton';
import { useUpvote } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { getLocalizedComplaintTitle } from '../lib/localizeComplaint';

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

  const displayTitle = getLocalizedComplaintTitle(complaint, i18n.language);

  return (
    <div className="card p-4 flex gap-3 hover:shadow-card-hover transition-shadow">
      <Link to={`/complaints/${complaint.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-blue-50">
          <img
            src={`${API_BASE}/uploads/${complaint.image}`}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/80x80/E4EAF4/4A6491?text=${complaint.issue_type.charAt(0).toUpperCase()}`;
            }}
          />
        </div>
      </Link>

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

        <Link to={`/complaints/${complaint.id}`}>
          <h3 className="font-semibold text-sm text-ink mt-1 line-clamp-2 hover:text-slate-blue-600 transition-colors">{displayTitle}</h3>
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
