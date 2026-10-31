import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Filter } from 'lucide-react';
import attendanceApi from '../../api/attendanceApi';
import Badge from '../../components/common/Badge';

export const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecords = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await attendanceApi.getMyAttendance({ page: pageNum, size: 12 });
      if (res && res.data) {
        setRecords(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(0);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Attendance History</h1>
          <p className="text-xs text-slate-400">Complete log of your daily attendance, working durations, and verification stamps</p>
        </div>
        <button
          onClick={() => fetchRecords(page)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Shift</th>
                <th className="p-4 font-semibold">Check-In</th>
                <th className="p-4 font-semibold">Check-Out</th>
                <th className="p-4 font-semibold">Work Hours</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Late</th>
                <th className="p-4 font-semibold">Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading attendance history...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium text-white font-mono">{r.date}</td>
                    <td className="p-4 text-slate-300">{r.shiftName || 'General'}</td>
                    <td className="p-4 font-mono text-slate-200">{r.checkInTime || '-'}</td>
                    <td className="p-4 font-mono text-slate-200">{r.checkOutTime || '-'}</td>
                    <td className="p-4 font-mono text-slate-200">
                      {r.workingMinutes > 0
                        ? `${Math.floor(r.workingMinutes / 60)}h ${r.workingMinutes % 60}m`
                        : '-'}
                    </td>
                    <td className="p-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="p-4">
                      {r.lateMinutes > 0 ? (
                        <span className="text-amber-400 font-bold">{r.lateMinutes}m</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.overtimeMinutes > 0 ? (
                        <span className="text-sky-400 font-bold">+{r.overtimeMinutes}m</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Page {page + 1} of {totalPages}
            </span>
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
    </div>
  );
};

export default MyAttendance;
