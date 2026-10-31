import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Filter } from 'lucide-react';
import auditApi from '../../api/auditApi';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await auditApi.getAllLogs({ page: pageNum, size: 20 });
      if (res && res.data) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System Compliance & Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of administrative operations, biometric enrollments, policy adjustments, and system events
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-sans">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">Entity Type</th>
                <th className="p-4 font-semibold">Entity ID</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-sans">
                    No audit records logged yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '-'}
                    </td>
                    <td className="p-4 text-sky-400 font-bold">{log.username}</td>
                    <td className="p-4 text-emerald-400 font-bold">{log.action}</td>
                    <td className="p-4 text-slate-300">{log.entityType || '-'}</td>
                    <td className="p-4 text-slate-400">{log.entityId || '-'}</td>
                    <td className="p-4 text-slate-300 max-w-sm truncate">{log.description}</td>
                    <td className="p-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-sans">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => fetchLogs(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchLogs(page + 1)}
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

export default AuditLogsPage;
