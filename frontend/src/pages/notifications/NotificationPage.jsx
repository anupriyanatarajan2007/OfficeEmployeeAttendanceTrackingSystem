import React, { useEffect } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const NotificationPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notifications Center</h1>
          <p className="text-xs text-slate-400">View real-time attendance alerts, leave review status, and announcements</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No notifications at this time</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`p-4 transition cursor-pointer flex items-start justify-between gap-4 ${
                n.isRead ? 'opacity-60 hover:bg-slate-800/30' : 'bg-sky-500/5 hover:bg-sky-500/10'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />}
                  <h3 className="text-sm font-bold text-white">{n.title}</h3>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  {n.createdAt ? n.createdAt.replace('T', ' ').substring(0, 19) : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
