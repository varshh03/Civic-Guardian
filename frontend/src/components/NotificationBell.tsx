import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../api/hooks';

export const NotificationBell = () => {
  const { data } = useNotifications();
  const unread = data?.unread_count || 0;

  return (
    <Link to="/notifications" className="relative p-1.5 text-muted hover:text-ink transition-colors">
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
};
