import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Check } from 'lucide-react';
import anomalyApi from '../../api/anomalyApi';
import Badge from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

export const AnomalyList = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useNotification();

  const fetchAnomalies = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await anomalyApi.getAll({ page: pageNum, size: 15 });
      if (res && res.data) {
        setAnomalies(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies(0);
  }, []);

  const handleResolve = async (id) => {
    const note = window.prompt('Resolution note:');
    if (note === null) return;

    try {
      await anomalyApi.resolve(id, note || 'Resolved by administrator inspection');
      showToast('Anomaly marked as resolved', 'success');
      fetchAnomalies(page);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Security & Attendance Anomaly Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time detection of geofence perimeter violations, biometric mismatches, and QR replay attacks
          </p>
        </div>
        <button
          onClick={() => fetchAnomalies(page)}
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
                <th className="p-4 font-semibold">Detected At</th>
                <th className="p-4 font-semibold">Severity</th>
                <th className="p-4 font-semibold">Anomaly Type</th>
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading security anomalies...
                  </td>
                </tr>
              ) : anomalies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No anomalies recorded. All verification factors healthy.
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {a.detectedAt ? a.detectedAt.replace('T', ' ').substring(0, 19) : '-'}
                    </td>
                    <td className="p-4">
                      <Badge status={a.severity} />
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">{a.anomalyType}</td>
                    <td className="p-4 text-slate-300">
                      {a.employee ? `${a.employee.name} (${a.employee.empCode})` : 'Unknown / System'}
                    </td>
                    <td className="p-4 text-slate-400 max-w-sm">{a.description}</td>
                    <td className="p-4">
                      <Badge status={a.resolved ? 'RESOLVED' : 'PENDING'} />
                    </td>
                    <td className="p-4 text-right">
                      {!a.resolved ? (
                        <button
                          onClick={() => handleResolve(a.id)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Resolved</span>
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

export default AnomalyList;
