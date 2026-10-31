import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  LogIn,
  LogOut,
  QrCode,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import attendanceApi from '../api/attendanceApi';

export const Dashboard = () => {
  const { user, canManage } = useAuth();
  const { currentThemeConfig } = useTheme();
  const [stats, setStats] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const themeColors = currentThemeConfig?.chartColors || ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (canManage) {
          const statsRes = await attendanceApi.getSummaryStats();
          if (statsRes && statsRes.data) {
            setStats(statsRes.data);
          }
          const recentRes = await attendanceApi.getAllAttendance({ page: 0, size: 6 });
          if (recentRes && recentRes.data?.content) {
            setRecentAttendance(recentRes.data.content);
          }
        }

        // Load today's check-in status for user
        const todayRes = await attendanceApi.getToday();
        if (todayRes && todayRes.data) {
          setTodayRecord(todayRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [canManage]);

  // Analytics dataset for charts
  const attendanceTrends = [
    { name: 'Mon', Present: 42, Absent: 3, Late: 5 },
    { name: 'Tue', Present: 45, Absent: 2, Late: 3 },
    { name: 'Wed', Present: 44, Absent: 4, Late: 2 },
    { name: 'Thu', Present: 46, Absent: 1, Late: 3 },
    { name: 'Fri', Present: 43, Absent: 3, Late: 4 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 24 },
    { name: 'Operations', value: 12 },
    { name: 'HR', value: 6 },
    { name: 'Product', value: 8 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border shadow-sm"
        style={{
          backgroundColor: 'var(--bg-glass)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user?.employeeName || user?.username}!
            </h1>
          </div>
          <p className="text-xs md:text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            {canManage
              ? 'Real-time overview of workforce attendance, biometric verification health, and geofence tracking.'
              : 'Record your daily attendance using secure Geofence, Face Biometrics, and Live Office QR.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3 z-10">
          {!todayRecord?.checkInTime && (
            <Link
              to="/attendance/check-in"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 20px -4px var(--accent-glow)',
              }}
            >
              <LogIn className="w-4 h-4" />
              <span>Check-In Now</span>
            </Link>
          )}

          {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
            <Link
              to="/attendance/check-out"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Check-Out</span>
            </Link>
          )}

          {canManage && (
            <Link
              to="/qr/live"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition"
              style={{
                backgroundColor: 'var(--bg-glass-card)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <QrCode className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
              <span>Live Office QR Kiosk</span>
            </Link>
          )}
        </div>
      </div>

      {/* Employee Today's Status Widget */}
      <div
        className="glass-card rounded-2xl p-6 border"
        style={{
          backgroundColor: 'var(--bg-glass-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-2xl border"
              style={{
                backgroundColor: todayRecord?.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-light)',
                color: todayRecord?.status === 'PRESENT' ? '#10b981' : 'var(--accent-color)',
                borderColor: todayRecord?.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
              }}
            >
              <CalendarCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                TODAY'S STATUS
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge status={todayRecord?.status || 'NOT_CHECKED_IN'} />
                {todayRecord?.checkInTime && (
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    Check-In at {todayRecord.checkInTime}
                  </span>
                )}
                {todayRecord?.checkOutTime && (
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    • Check-Out at {todayRecord.checkOutTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/attendance/my"
              className="text-xs font-semibold flex items-center gap-1 transition"
              style={{ color: 'var(--accent-color)' }}
            >
              <span>View Full Attendance History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Management Metric Cards (Admin / HR) */}
      {canManage && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Workforce"
              value={stats?.totalEmployees ?? 1}
              subtitle="Registered team members"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Present Today"
              value={stats?.presentToday ?? (todayRecord?.status === 'PRESENT' ? 1 : 0)}
              subtitle="Verified on premise"
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              title="Late Arrivals"
              value={stats?.lateToday ?? 0}
              subtitle="Past grace cutoff"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Unresolved Anomalies"
              value={stats?.unresolvedAnomalies ?? 0}
              subtitle="Security alerts"
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Bar Chart */}
            <div
              className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4 border"
              style={{
                backgroundColor: 'var(--bg-glass-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Weekly Attendance Trends
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current Week</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="Present" fill={themeColors[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Late" fill={themeColors[2]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill={themeColors[3]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Breakdown */}
            <div
              className="glass-card rounded-2xl p-6 space-y-4 border"
              style={{
                backgroundColor: 'var(--bg-glass-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Department Distribution
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={themeColors[index % themeColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Live Logs Table */}
          <div
            className="glass-card rounded-2xl p-6 space-y-4 border"
            style={{
              backgroundColor: 'var(--bg-glass-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Today's Attendance Logs
              </h3>
              <Link
                to="/attendance/manage"
                className="text-xs font-semibold transition"
                style={{ color: 'var(--accent-color)' }}
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Check-In</th>
                    <th className="pb-3 font-semibold">Check-Out</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                        No check-ins recorded yet today
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.map((record) => (
                      <tr key={record.id} className="transition">
                        <td className="py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          <div>{record.employeeName}</div>
                          <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {record.employeeCode}
                          </div>
                        </td>
                        <td className="py-3" style={{ color: 'var(--text-secondary)' }}>
                          {record.department || 'Engineering'}
                        </td>
                        <td className="py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {record.checkInTime || '-'}
                        </td>
                        <td className="py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {record.checkOutTime || '-'}
                        </td>
                        <td className="py-3">
                          <Badge status={record.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
