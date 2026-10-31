import React, { useState } from 'react';
import { Bell, LogOut, Shield, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import ThemeSelector from './ThemeSelector';

export const Navbar = () => {
  const { user, logout, isAdmin, isHr } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 h-16 glass-panel border-b px-6 flex items-center justify-between transition-colors duration-200"
      style={{
        backgroundColor: 'var(--navbar-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AttendFlow
          </span>
          <span
            className="text-[10px] ml-2 px-2 py-0.5 rounded-full font-semibold border"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-color)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {isAdmin ? 'ADMIN PORTAL' : isHr ? 'HR CONSOLE' : 'EMPLOYEE'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Centralized Multi-Theme Selector */}
        <ThemeSelector />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-xl relative transition"
            style={{
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-light)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 animate-pulse"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  ringColor: 'var(--bg-primary)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: 'var(--bg-glass)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] flex items-center gap-1 font-medium transition"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y py-2" style={{ borderColor: 'var(--border-subtle)' }}>
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className="py-2.5 px-2 rounded-lg cursor-pointer transition text-xs"
                      style={{
                        backgroundColor: n.isRead ? 'transparent' : 'var(--accent-light)',
                        opacity: n.isRead ? 0.65 : 1,
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</span>
                        {!n.isRead && (
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Profile Area */}
        <div
          className="flex items-center gap-3 pl-3 border-l"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm"
            style={{
              backgroundColor: 'var(--bg-glass-card)',
              color: 'var(--accent-color)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {user?.employeeName ? user.employeeName[0] : user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {user?.employeeName || user?.username}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {user?.employeeCode ? `${user.employeeCode} • ` : ''}
              {user?.department || (isAdmin ? 'System Admin' : isHr ? 'Human Resources' : 'Staff')}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            aria-label="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
