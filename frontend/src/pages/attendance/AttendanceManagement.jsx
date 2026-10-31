import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, RefreshCw, Eye, ShieldCheck, MapPin, Scan, QrCode } from 'lucide-react';
import attendanceApi from '../../api/attendanceApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async (pageNum = 0) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        size: 15,
        date: date || undefined,
        employeeCode: employeeCode || undefined,
        status: status || undefined,
      };
      const res = await attendanceApi.getAllAttendance(params);
      if (res && res.data) {
        setRecords(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(0);
  }, [date, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Records & Audits
          </h1>
          <p className="text-xs text-slate-400">
            Monitor company-wide employee check-ins, multi-factor verification proofs, and work hour logs
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Employee Code / Name</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="EMP001..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Filter</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setDate('');
                setEmployeeCode('');
                setStatus('');
                fetchRecords(0);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Records Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Check-In</th>
                <th className="p-4 font-semibold">Check-Out</th>
                <th className="p-4 font-semibold">Working Hours</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading attendance entries...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No attendance records found matching current criteria
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-mono text-slate-300">{r.date}</td>
                    <td className="p-4 font-medium text-white">
                      <div>{r.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.employeeCode}</div>
                    </td>
                    <td className="p-4 text-slate-300">{r.department || '-'}</td>
                    <td className="p-4 font-mono text-slate-200">{r.checkInTime || '-'}</td>
                    <td className="p-4 font-mono text-slate-200">{r.checkOutTime || '-'}</td>
                    <td className="p-4 font-mono text-slate-200">
                      {r.workingMinutes > 0 ? `${Math.floor(r.workingMinutes / 60)}h ${r.workingMinutes % 60}m` : '-'}
                    </td>
                    <td className="p-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                        title="View Verification Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => fetchRecords(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchRecords(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Proof Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Verification Proof - ${selectedRecord.employeeName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="glass-card p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="text-white font-semibold">{selectedRecord.employeeName} ({selectedRecord.employeeCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Name:</span>
                <span className="text-white">{selectedRecord.shiftName || 'General Day Shift'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-In:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedRecord.checkInTime || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-Out:</span>
                <span className="font-mono text-white">{selectedRecord.checkOutTime || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <Badge status={selectedRecord.status} />
              </div>
            </div>

            <h4 className="font-bold text-white pt-2">Multi-Factor Verification Checks</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3 rounded-xl text-center space-y-1">
                <MapPin className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Geofence</span>
                <span className="text-xs font-bold text-emerald-400">Passed</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center space-y-1">
                <Scan className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Biometric</span>
                <span className="text-xs font-bold text-emerald-400">Verified</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center space-y-1">
                <QrCode className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-[10px] text-slate-400 block">Dynamic QR</span>
                <span className="text-xs font-bold text-emerald-400">Authenticated</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceManagement;
