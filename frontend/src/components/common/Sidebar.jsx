import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  CalendarCheck,
  CalendarDays,
  Users,
  Building2,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin, canManage } = useAuth();

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance/check-in', label: 'Check-In Wizard', icon: LogIn },
    { to: '/attendance/check-out', label: 'Check-Out', icon: LogOut },
    { to: '/attendance/my', label: 'My Attendance', icon: History },
    { to: '/leaves/my', label: 'My Leaves', icon: CalendarDays },
  ];

  const hrAdminLinks = [
    { to: '/attendance/manage', label: 'Attendance Records', icon: CalendarCheck },
    { to: '/qr/live', label: 'Live Kiosk QR', icon: QrCode },
    { to: '/employees', label: 'Employee Directory', icon: Users },
    { to: '/leaves/requests', label: 'Leave Requests', icon: FileText },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/shifts', label: 'Shift Policies', icon: Clock },
    { to: '/office-location', label: 'Office Geofencing', icon: MapPin },
    { to: '/holidays', label: 'Company Holidays', icon: CalendarDays },
    { to: '/anomalies', label: 'Anomaly Center', icon: AlertTriangle },
    { to: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
  ];

  const adminOnlyLinks = [
    { to: '/audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
  ];

  const renderNavSection = (title, links) => (
    <div className="space-y-1 py-3">
      {title && (
        <p
          className="px-3 text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </p>
      )}
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) =>
              isActive
                ? {
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    borderColor: 'var(--border-focus)',
                  }
                : {
                    color: 'var(--text-secondary)',
                  }
            }
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'border shadow-sm'
                  : 'hover:bg-[var(--accent-light)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <aside
      className="w-64 glass-panel border-r flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 overflow-y-auto transition-colors duration-200"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      {renderNavSection('Self Service', employeeLinks)}
      {canManage && renderNavSection('Administration', hrAdminLinks)}
      {isAdmin && renderNavSection('Security & Compliance', adminOnlyLinks)}
    </aside>
  );
};

export default Sidebar;
