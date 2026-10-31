import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, MapPin, Scan, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LocationStep from '../../components/attendance/LocationStep';
import FaceCaptureStep from '../../components/attendance/FaceCaptureStep';
import QrScannerStep from '../../components/attendance/QrScannerStep';
import attendanceApi from '../../api/attendanceApi';

export const AttendanceCheckIn = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationData, setLocationData] = useState(null);

  const [faceVerified, setFaceVerified] = useState(false);
  const [faceData, setFaceData] = useState(null);

  const [qrVerified, setQrVerified] = useState(false);
  const [qrToken, setQrToken] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [completedRecord, setCompletedRecord] = useState(null);
  const [error, setError] = useState('');

  const handleLocationVerified = (data) => {
    setLocationVerified(true);
    setLocationData(data);
    setCurrentStep(2);
  };

  const handleFaceVerified = (data) => {
    setFaceVerified(true);
    setFaceData(data);
    setCurrentStep(3);
  };

  const handleQrVerified = (token) => {
    setQrVerified(true);
    setQrToken(token);
    submitCheckIn(token);
  };

  const submitCheckIn = async (finalQrToken) => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        faceData: faceData,
        qrToken: finalQrToken || qrToken,
        notes: 'Verified via Web Portal',
      };

      const res = await attendanceApi.checkIn(payload);
      if (res && res.data) {
        setCompletedRecord(res.data);
        setCurrentStep(4);
        showToast('Check-in successfully recorded!', 'success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to complete attendance check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Attendance Check-In Wizard
        </h1>
        <p className="text-xs text-slate-400">
          Complete the 3-step verification process to authenticate and record your shift check-in
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
            currentStep === 1
              ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
              : locationVerified
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500'
          }`}>
            <MapPin className="w-4 h-4" />
            <span>1. Location</span>
          </div>

          <div className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
            currentStep === 2
              ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
              : faceVerified
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500'
          }`}>
            <Scan className="w-4 h-4" />
            <span>2. Face ID</span>
          </div>

          <div className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
            currentStep === 3
              ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
              : qrVerified
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-500'
          }`}>
            <QrCode className="w-4 h-4" />
            <span>3. Office QR</span>
          </div>
        </div>
      </div>

      {/* Step Content Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <LocationStep
            isVerified={locationVerified}
            locationData={locationData}
            onVerified={handleLocationVerified}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <FaceCaptureStep
              employeeCode={user?.employeeCode || 'EMP001'}
              isVerified={faceVerified}
              faceData={faceData}
              onVerified={handleFaceVerified}
            />
            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Location</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <QrScannerStep
              isVerified={qrVerified}
              qrToken={qrToken}
              onVerified={handleQrVerified}
            />
            <div className="flex justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Face Verification</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && completedRecord && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Check-In Authenticated!</h2>
              <p className="text-xs text-slate-400">Your attendance has been officially timestamped and logged</p>
            </div>

            <div className="glass-card rounded-2xl p-5 max-w-sm mx-auto text-left text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="text-white font-semibold">{completedRecord.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-In Time:</span>
                <span className="text-emerald-400 font-mono font-bold">{completedRecord.checkInTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Name:</span>
                <span className="text-slate-200">{completedRecord.shiftName || 'General Day Shift'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">{completedRecord.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Late Arrival:</span>
                <span className={completedRecord.lateMinutes > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {completedRecord.lateMinutes > 0 ? `${completedRecord.lateMinutes} mins late` : 'On Time'}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCheckIn;
