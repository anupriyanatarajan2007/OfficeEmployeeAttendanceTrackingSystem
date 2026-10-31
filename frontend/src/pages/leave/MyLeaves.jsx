import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, RefreshCw, XCircle } from 'lucide-react';
import leaveApi from '../../api/leaveApi';
import Badge from '../../components/common/Badge';
import ApplyLeaveModal from './ApplyLeaveModal';
import { useNotification } from '../../context/NotificationContext';

export const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { showToast } = useNotification();

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyLeaves({ page: 0, size: 20 });
      if (res && res.data?.content) {
        setLeaves(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending leave request?')) return;
    try {
      await leaveApi.cancel(id);
      showToast('Leave request cancelled', 'info');
      fetchMyLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Leave Applications</h1>
          <p className="text-xs text-slate-400">View and track your applied time-off requests and approvals</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Start Date</th>
                <th className="p-4 font-semibold">End Date</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Reviewer</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No leave applications submitted yet
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-semibold text-white">{l.leaveType}</td>
                    <td className="p-4 font-mono text-slate-300">{l.startDate}</td>
                    <td className="p-4 font-mono text-slate-300">{l.endDate}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{l.reason}</td>
                    <td className="p-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="p-4 text-slate-400">{l.approvedBy || '-'}</td>
                    <td className="p-4 text-right">
                      {l.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(l.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onApplied={fetchMyLeaves}
      />
    </div>
  );
};

export default MyLeaves;
