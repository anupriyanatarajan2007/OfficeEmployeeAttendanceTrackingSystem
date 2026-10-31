import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import attendanceApi from '../../api/attendanceApi';
import dynamicQrApi from '../../api/dynamicQrApi';

export const QrScannerStep = ({ onVerified, isVerified, qrToken }) => {
  const [manualToken, setManualToken] = useState(qrToken || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    setError('');
    try {
      const scanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setManualToken(decodedText);
          stopScanner();
          verifyToken(decodedText);
        },
        (errorMessage) => {
          // scanning frames
        }
      );
      setScannerActive(true);
    } catch (err) {
      console.warn('QR scanner camera error:', err);
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const verifyToken = async (tokenToVerify) => {
    const token = tokenToVerify || manualToken;
    if (!token || !token.trim()) {
      setError('Please enter or scan a valid QR token');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.verifyQr({ qrToken: token.trim() });
      if (res && res.data) {
        setVerificationResult(res.data);
        if (res.data.verified) {
          onVerified(token.trim());
        } else {
          setError(res.data.message || 'QR verification failed: token expired or invalid');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired QR token');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick testing: fetch the current live active QR token from backend directly!
  const fetchCurrentLiveToken = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dynamicQrApi.getActiveQr();
      if (res && res.data?.qrToken) {
        setManualToken(res.data.qrToken);
        await verifyToken(res.data.qrToken);
      }
    } catch (err) {
      setError('Failed to fetch live office QR token: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Step 3: Dynamic Office QR Verification</h3>
          <p className="text-xs text-slate-400">Scan the rotating QR code on the office display kiosk</p>
        </div>
      </div>

      {/* QR scanner camera container */}
      <div className="space-y-4">
        <div
          id="qr-reader-container"
          className={`w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-slate-800 ${
            scannerActive ? 'block min-h-[260px]' : 'hidden'
          }`}
        />

        {!scannerActive && !isVerified && (
          <div className="flex justify-center gap-3">
            <button
              onClick={startScanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Open QR Camera Scanner</span>
            </button>
            <button
              onClick={fetchCurrentLiveToken}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-xs font-semibold text-white transition shadow-lg shadow-sky-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Fill Current Live Office QR</span>
            </button>
          </div>
        )}

        {scannerActive && (
          <div className="text-center">
            <button
              onClick={stopScanner}
              className="px-4 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-medium text-white transition"
            >
              Close Camera Scanner
            </button>
          </div>
        )}
      </div>

      {/* Manual Token Input / Confirmation */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <label className="block text-xs font-medium text-slate-400">
          Or Enter QR Verification Payload
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            disabled={isVerified || loading}
            placeholder="Paste HMAC dynamic token: 1:1710600:..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition font-mono"
          />
          {!isVerified && (
            <button
              onClick={() => verifyToken()}
              disabled={loading || !manualToken}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-semibold text-white transition whitespace-nowrap"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
          )}
        </div>
      </div>

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isVerified && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Dynamic QR Token Authenticated</span>
          </div>
          {verificationResult?.officeName && (
            <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-300 font-medium">
              {verificationResult.officeName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default QrScannerStep;
