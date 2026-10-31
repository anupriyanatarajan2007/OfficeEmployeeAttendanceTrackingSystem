import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import attendanceApi from '../../api/attendanceApi';

export const LocationStep = ({ onVerified, isVerified, locationData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [verificationResult, setVerificationResult] = useState(locationData || null);

  const requestLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        await verifyWithBackend(lat, lon);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(`Unable to retrieve your location: ${err.message}. Please enable GPS permissions or use test coordinates.`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Test toggle: Allow HQ location coordinates for test simulation
  const useTestOfficeCoordinates = async () => {
    setLoading(true);
    setError('');
    // 12.9716, 77.5946 (Bangalore HQ)
    const lat = 12.9716;
    const lon = 77.5946;
    setCoords({ lat, lon });
    await verifyWithBackend(lat, lon);
  };

  const verifyWithBackend = async (latitude, longitude) => {
    try {
      const res = await attendanceApi.verifyLocation({ latitude, longitude });
      if (res && res.data) {
        setVerificationResult(res.data);
        if (res.data.verified) {
          onVerified({
            latitude,
            longitude,
            distance: res.data.distanceFromOfficeMeters,
            officeName: res.data.officeName,
          });
        } else {
          setError(res.data.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Location verification request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVerified && !verificationResult) {
      requestLocation();
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Step 1: Geofence Verification</h3>
          <p className="text-xs text-slate-400">Verifying presence within permitted office premises</p>
        </div>
      </div>

      {loading && (
        <div className="glass-card rounded-2xl p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Detecting GPS coordinates & verifying geofence...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={requestLocation}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Retry GPS
            </button>
            <button
              onClick={useTestOfficeCoordinates}
              className="px-3 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-600 text-xs font-semibold text-white transition"
            >
              Simulate HQ Coordinates
            </button>
          </div>
        </div>
      )}

      {isVerified && verificationResult && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Location Verified: {verificationResult.officeName}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="glass-card p-3 rounded-xl">
              <span className="text-slate-400">Calculated Distance:</span>
              <p className="text-white font-bold mt-0.5">{verificationResult.distanceFromOfficeMeters} meters</p>
            </div>
            <div className="glass-card p-3 rounded-xl">
              <span className="text-slate-400">Allowed Perimeter:</span>
              <p className="text-white font-bold mt-0.5">Within {verificationResult.allowedRadiusMeters} meters</p>
            </div>
          </div>
        </div>
      )}

      {!isVerified && !loading && !error && (
        <div className="flex justify-center">
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/20 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Detect Current Location</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationStep;
