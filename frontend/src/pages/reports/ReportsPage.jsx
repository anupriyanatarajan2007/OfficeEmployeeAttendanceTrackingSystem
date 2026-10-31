import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Filter, RefreshCw, Eye } from 'lucide-react';
import reportApi from '../../api/reportApi';
import { useNotification } from '../../context/NotificationContext';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('DAILY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useNotification();

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getPreview({
        reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        employeeCode: employeeCode || undefined,
        department: department || undefined,
      });
      if (res && res.data) {
        setPreviewData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate report preview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const blob = await reportApi.downloadExcel({
        reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        employeeCode: employeeCode || undefined,
        department: department || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${reportType.toLowerCase()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Excel report downloaded successfully', 'success');
    } catch (err) {
      showToast('Excel download failed: ' + err.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await reportApi.downloadPdf({
        reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        employeeCode: employeeCode || undefined,
        department: department || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${reportType.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('PDF report downloaded successfully', 'success');
    } catch (err) {
      showToast('PDF download failed: ' + err.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Get table columns dynamically from keys of preview data
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Reports & Exports
          </h1>
          <p className="text-xs text-slate-400">
            Generate printable PDF reports and formatted multi-column Excel (.xlsx) spreadsheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-400 mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="DAILY">Daily Attendance</option>
              <option value="ABSENTEES">Absentees Log</option>
              <option value="LATE_ARRIVALS">Late Arrivals</option>
              <option value="OVERTIME">Overtime Hours</option>
              <option value="ANOMALIES">Security Anomalies</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Employee Code</label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="e.g. EMP001"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>{loading ? 'Compiling...' : 'Preview Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Dataset Preview ({previewData.length} records)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {reportType} REPORT
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 sticky top-0 backdrop-blur-md">
                {columns.map((col) => (
                  <th key={col} className="p-3.5 font-semibold capitalize whitespace-nowrap">
                    {col.replace(/([A-Z])/g, ' $1')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 5} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Generating report dataset...
                  </td>
                </tr>
              ) : previewData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 5} className="p-8 text-center text-slate-500">
                    Click "Preview Report" or download directly to generate report file
                  </td>
                </tr>
              ) : (
                previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition">
                    {columns.map((col) => (
                      <td key={col} className="p-3.5 text-slate-300 whitespace-nowrap">
                        {String(row[col] ?? '-')}
                      </td>
                    ))}
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

export default ReportsPage;
