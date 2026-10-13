import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ThumbsUp, Trash2, X, MessageSquare, Send, CornerDownRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComments, useAddComment, useDeleteComment, useMarkHelpful, type Comment as CommentType } from '../api/hooks';
import { formatRelativeTime, cn } from '../lib/utils';
import toast from 'react-hot-toast';

export const CommentThread = ({ complaintId }: { complaintId: string }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(complaintId);
  const addComment = useAddComment(complaintId);
  const deleteComment = useDeleteComment();
  const markHelpful = useMarkHelpful();
  
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate({ text: text.trim(), parent_id: replyTo || undefined }, {
      onSuccess: () => {
        setText('');
        setReplyTo(null);
        toast.success(t('complaint.comment_added') || 'Comment posted successfully');
      },
      onError: () => {
        toast.error('Failed to post comment. Please try again.');
      }
    });
  };

  const topLevel = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center gap-2 text-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-slate-blue-600" />
        <span>{t('complaint.loading_comments') || 'Loading comments...'}</span>
      </div>
    );
  }

  const CommentItem = ({ c, isReply = false }: { c: CommentType; isReply?: boolean }) => {
    const isOwner = user?.id === c.user_id;
    const hasSupported = (c.helpful || []).includes(user?.id || '');
    const authorName = c.author_name || 'Citizen';
    const authorInitial = authorName.charAt(0).toUpperCase() || 'C';

    return (
      <div className={cn("py-3 transition-colors", isReply ? "ml-6 pl-3 sm:ml-8 sm:pl-4 border-l-2 border-slate-blue-200 mt-2 bg-slate-50/50 rounded-r-lg p-2" : "border-b border-line last:border-0")}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-blue-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-blue-700 text-xs shadow-sm">
            {authorInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-ink">{authorName}</span>
              {c.is_official && (
                <span className="flex items-center gap-1 text-[10px] bg-slate-blue-100 text-slate-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                  <Shield className="w-3 h-3" /> {t('common.official') || 'Official'}
                </span>
              )}
              <span className="text-xs text-muted ml-auto">{formatRelativeTime(c.created_at, i18n.language)}</span>
            </div>
            <p className="text-sm text-ink mt-1 whitespace-pre-wrap break-words">{c.text}</p>
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => user && markHelpful.mutate(c.id)}
                disabled={!user || markHelpful.isPending}
                className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors", hasSupported ? "text-slate-blue-600 font-semibold" : "text-muted hover:text-ink")}
              >
                <ThumbsUp className={cn("w-3.5 h-3.5", hasSupported && "fill-slate-blue-600")} />
                <span>{c.helpful_count || 0} {t('complaint.helpful') || 'Helpful'}</span>
              </button>
              {!isReply && user && (
                <button
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="flex items-center gap-1 text-xs font-medium text-muted hover:text-slate-blue-600 transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>{t('complaint.reply') || 'Reply'}</span>
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => deleteComment.mutate(c.id)}
                  disabled={deleteComment.isPending}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 ml-auto transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('common.delete') || 'Delete'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="font-bold text-base flex items-center gap-2 text-ink">
          <MessageSquare className="w-5 h-5 text-slate-blue-600" />
          <span>{t('complaint.comments') || 'Comments'}</span>
          <span className="bg-slate-blue-50 text-slate-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
            {comments.length}
          </span>
        </h3>
      </div>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-4">
          {replyTo && (
            <div className="flex justify-between items-center mb-2 p-2 bg-slate-blue-50 border border-slate-blue-200 rounded-lg text-xs">
              <span className="text-slate-blue-700 font-semibold flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5" />
                {t('complaint.replying_to') || 'Replying to comment...'}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-muted hover:text-ink p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, 500))}
                placeholder={replyTo ? (t('complaint.type_reply') || 'Write your reply...') : (t('complaint.add_comment') || 'Share details, updates, or comments...')}
                className="input w-full h-20 resize-none text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted">{text.length}/500</span>
                <button
                  type="submit"
                  disabled={!text.trim() || addComment.isPending}
                  className="btn-primary h-8 px-4 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {addComment.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{replyTo ? (t('complaint.post_reply') || 'Post Reply') : (t('complaint.post_comment') || 'Post Comment')}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-muted border border-line">
          {t('complaint.login_to_comment') || 'Please log in to add a comment or discussion.'}
        </div>
      )}

      <div className="space-y-1 divide-y divide-line">
        {topLevel.length === 0 ? (
          <div className="text-center text-muted py-6 text-xs space-y-1">
            <p className="font-medium">{t('complaint.no_comments') || 'No comments yet.'}</p>
            <p>{t('complaint.first_comment') || 'Be the first to join the conversation!'}</p>
          </div>
        ) : (
          topLevel.map(c => (
            <div key={c.id}>
              <CommentItem c={c} />
              {getReplies(c.id).map(r => <CommentItem key={r.id} c={r} isReply />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
