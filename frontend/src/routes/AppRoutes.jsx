import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AttendanceCheckIn from '../pages/attendance/AttendanceCheckIn';
import AttendanceCheckOut from '../pages/attendance/AttendanceCheckOut';
import MyAttendance from '../pages/attendance/MyAttendance';
import AttendanceManagement from '../pages/attendance/AttendanceManagement';
import LiveQrDisplay from '../pages/qr/LiveQrDisplay';
import EmployeeList from '../pages/employees/EmployeeList';
import DepartmentList from '../pages/departments/DepartmentList';
import ShiftList from '../pages/shifts/ShiftList';
import OfficeLocationSettings from '../pages/office-location/OfficeLocationSettings';
import MyLeaves from '../pages/leave/MyLeaves';
import LeaveRequests from '../pages/leave/LeaveRequests';
import HolidayList from '../pages/holidays/HolidayList';
import AnomalyList from '../pages/anomalies/AnomalyList';
import ReportsPage from '../pages/reports/ReportsPage';
import NotificationPage from '../pages/notifications/NotificationPage';
import AuditLogsPage from '../pages/audit/AuditLogsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Routes - Common */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/check-in"
        element={
          <ProtectedRoute>
            <AttendanceCheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/check-out"
        element={
          <ProtectedRoute>
            <AttendanceCheckOut />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/my"
        element={
          <ProtectedRoute>
            <MyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves/my"
        element={
          <ProtectedRoute>
            <MyLeaves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        }
      />

      {/* HR & Admin Management Routes */}
      <Route
        path="/attendance/manage"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr/live"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <LiveQrDisplay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <EmployeeList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves/requests"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <LeaveRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <DepartmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shifts"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ShiftList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/office-location"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <OfficeLocationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holidays"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <HolidayList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/anomalies"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <AnomalyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Route */}
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
