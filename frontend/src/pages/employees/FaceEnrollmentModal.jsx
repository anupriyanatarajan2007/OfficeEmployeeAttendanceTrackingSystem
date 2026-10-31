import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import Modal from '../../components/common/Modal';
import employeeApi from '../../api/employeeApi';
import { useNotification } from '../../context/NotificationContext';

export const FaceEnrollmentModal = ({ isOpen, onClose, employee, onEnrolled }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotification();

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      setError('Failed to access webcam: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setError('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64);
    stopCamera();
  };

  const simulateEnrollmentCapture = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Profile: ${employee?.empCode}`, 50, 150);

    const simulatedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(simulatedBase64);
    stopCamera();
  };

  const handleEnroll = async () => {
    if (!capturedImage) return;
    setLoading(true);
    setError('');
    try {
      await employeeApi.enrollFace(employee.id, { faceData: capturedImage });
      showToast(`Face profile enrolled for ${employee.name}`, 'success');
      if (onEnrolled) onEnrolled();
      onClose();
    } catch (err) {
      setError(err.message || 'Face enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enroll Facial Biometrics - ${employee?.name || ''}`}
    >
      <div className="space-y-4 text-xs">
        <canvas ref={canvasRef} className="hidden" />

        <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
          {cameraActive && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-56 rounded-full border-2 border-sky-400/60 relative overflow-hidden">
                  <div className="w-full h-1 bg-sky-400/80 shadow-[0_0_12px_#38bdf8] animate-scanline absolute" />
                </div>
              </div>
            </>
          )}

          {capturedImage && !cameraActive && (
            <img src={capturedImage} alt="Captured Face" className="w-full h-full object-cover" />
          )}

          {!cameraActive && !capturedImage && (
            <div className="text-center p-4 space-y-2">
              <Camera className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-slate-400">Webcam inactive</p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-medium"
              >
                Restart Camera
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          {cameraActive ? (
            <div className="flex gap-2 w-full justify-between">
              <button
                type="button"
                onClick={simulateEnrollmentCapture}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
              >
                Simulate Face Capture
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Sample</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full justify-between">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                disabled={loading || !capturedImage}
                onClick={handleEnroll}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Saving Embedding...' : 'Save Face Enrollment'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FaceEnrollmentModal;
