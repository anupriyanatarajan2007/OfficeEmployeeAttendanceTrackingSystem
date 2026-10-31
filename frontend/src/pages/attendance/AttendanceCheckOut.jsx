import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import attendanceApi from '../../api/attendanceApi';

export const AttendanceCheckOut = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedRecord, setCompletedRecord] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await attendanceApi.getToday();
        if (res && res.data) {
          setTodayRecord(res.data);
        }
      } catch (err) {
        setError('Failed to fetch today record: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  const handleCheckOut = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Default to HQ coords if GPS permission is not granted
      let lat = 12.9716;
      let lon = 77.5946;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch (ignored) {}
      }

      const res = await attendanceApi.checkOut({
        latitude: lat,
        longitude: lon,
        notes: notes || 'Standard shift punch-out',
      });

      if (res && res.data) {
        setCompletedRecord(res.data);
        showToast('Check-out recorded successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Check-out request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Shift Check-Out</h1>
        <p className="text-xs text-slate-400">Complete your daily shift and record net working hours</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!completedRecord ? (
          <>
            {/* Shift Summary Card */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400">TODAY'S SHIFT</span>
                <span className="text-xs font-mono text-sky-400 font-bold">
                  {todayRecord?.shiftName || 'General Day Shift'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Check-In Time:</span>
                  <p className="text-white font-mono font-bold text-sm mt-0.5">
                    {todayRecord?.checkInTime || 'No check-in recorded'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Shift Hours:</span>
                  <p className="text-white font-mono text-sm mt-0.5">09:00 - 18:00</p>
                </div>
              </div>

              {todayRecord?.checkOutTime && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  You have already checked out today at <span className="font-mono font-bold">{todayRecord.checkOutTime}</span>.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Daily Work Summary / Optional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Tasks completed today, handovers, or comments..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <button
              onClick={handleCheckOut}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{submitting ? 'Processing Punch-Out...' : 'Confirm Shift Check-Out'}</span>
            </button>
          </>
        ) : (
          /* Checkout Receipt */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Shift Check-Out Recorded</h2>
              <p className="text-xs text-slate-400">Great work today! Your working metrics have been finalized.</p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-left text-xs space-y-3 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Check-Out Time:</span>
                <span className="text-white font-mono font-bold">{completedRecord.checkOutTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Working Time:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {Math.floor(completedRecord.workingMinutes / 60)}h {completedRecord.workingMinutes % 60}m
                </span>
              </div>
              {completedRecord.overtimeMinutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Overtime Recorded:</span>
                  <span className="text-sky-400 font-mono font-bold">{completedRecord.overtimeMinutes} mins</span>
                </div>
              )}
              {completedRecord.earlyCheckoutMinutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Early Departure:</span>
                  <span className="text-amber-400 font-mono font-bold">{completedRecord.earlyCheckoutMinutes} mins</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCheckOut;
