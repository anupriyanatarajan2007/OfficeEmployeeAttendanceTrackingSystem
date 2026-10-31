import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Scan, UserCheck } from 'lucide-react';
import attendanceApi from '../../api/attendanceApi';

export const FaceCaptureStep = ({ employeeCode, onVerified, isVerified, faceData }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(faceData || null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

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
      console.warn('Webcam error:', err);
      setError(`Camera error: ${err.message}. Please enable webcam access or simulate facial verification.`);
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
    if (!isVerified && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

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
    verifyFacePayload(base64);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setError('');
    startCamera();
  };

  // Test simulation for environments without functional webcams
  const simulateFaceMatch = () => {
    // Generate sample image on canvas
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '20px sans-serif';
    ctx.fillText('Biometric Verified', 50, 150);

    const simulatedBase64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(simulatedBase64);
    stopCamera();
    verifyFacePayload(simulatedBase64);
  };

  const verifyFacePayload = async (faceDataPayload) => {
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.verifyFace(employeeCode, { faceData: faceDataPayload });
      if (res && res.data) {
        setVerificationResult(res.data);
        if (res.data.verified) {
          onVerified(faceDataPayload);
        } else {
          setError(res.data.message || 'Face verification failed: confidence score below threshold');
        }
      }
    } catch (err) {
      setError(err.message || 'Face verification service error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
          <Scan className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Step 2: Biometric Face Verification</h3>
          <p className="text-xs text-slate-400">Position your face inside the scanner frame</p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Video */}
        {cameraActive && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {/* Biometric Oval Guide with Animated Scanline */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 rounded-full border-2 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)] relative overflow-hidden">
                <div className="w-full h-1 bg-sky-400/80 shadow-[0_0_12px_#38bdf8] animate-scanline absolute" />
              </div>
            </div>
          </>
        )}

        {/* Captured Preview */}
        {capturedImage && !cameraActive && (
          <img
            src={capturedImage}
            alt="Face capture"
            className="w-full h-full object-cover"
          />
        )}

        {!cameraActive && !capturedImage && (
          <div className="text-center p-6 space-y-3">
            <Camera className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">Camera preview inactive</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition"
            >
              Start Webcam
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="glass-card rounded-xl p-4 text-center flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
          <span className="text-xs text-slate-300 font-medium">Extracting biometric vectors & matching profile...</span>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={retakePhoto}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition"
            >
              Recapture Face
            </button>
            <button
              onClick={simulateFaceMatch}
              className="px-3 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-600 text-xs font-medium text-white transition"
            >
              Simulate Match
            </button>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Face Verified Successfully</span>
          </div>
          {verificationResult?.confidenceScore && (
            <span className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-300">
              Score: {Math.round(verificationResult.confidenceScore * 100)}%
            </span>
          )}
        </div>
      )}

      {cameraActive && !loading && (
        <div className="flex justify-center gap-3">
          <button
            onClick={capturePhoto}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Verify Face</span>
          </button>
        </div>
      )}

      {!cameraActive && capturedImage && !isVerified && !loading && (
        <div className="flex justify-center gap-2">
          <button
            onClick={retakePhoto}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Photo</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceCaptureStep;
