import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import leaveApi from '../../api/leaveApi';
import Badge from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

export const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPending, setFilterPending] = useState(true);
  const { showToast } = useNotification();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = filterPending
        ? await leaveApi.getPending({ page: 0, size: 25 })
        : await leaveApi.getAll({ page: 0, size: 25 });
      if (res && res.data?.content) {
        setLeaves(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterPending]);

  const handleApprove = async (id, empName) => {
    try {
      await leaveApi.approve(id);
      showToast(`Approved leave for ${empName}`, 'success');
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (id, empName) => {
    const reason = window.prompt(`Rejection reason for ${empName}'s leave application:`);
    if (reason === null) return;
    try {
      await leaveApi.reject(id, reason || 'Denied by reviewer');
      showToast(`Rejected leave for ${empName}`, 'info');
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Leave Approval Queue</h1>
          <p className="text-xs text-slate-400">Review and authorize employee time-off and leave requests</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterPending(true)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterPending ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Only
            </button>
            <button
              onClick={() => setFilterPending(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                !filterPending ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Requests
            </button>
          </div>

          <button
            onClick={fetchLeaves}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium text-white">
                      <div>{l.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.employeeCode}</div>
                    </td>
                    <td className="p-4 text-slate-300">{l.department || 'Engineering'}</td>
                    <td className="p-4 font-semibold text-white">{l.leaveType}</td>
                    <td className="p-4 font-mono text-slate-300">
                      {l.startDate} <span className="text-slate-500">to</span> {l.endDate}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{l.reason}</td>
                    <td className="p-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="p-4 text-right">
                      {l.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(l.id, l.employeeName)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(l.id, l.employeeName)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] flex items-center gap-1 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
