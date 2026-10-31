import React, { useState, useEffect } from 'react';
import { MapPin, Save, RefreshCw, Compass, ShieldCheck } from 'lucide-react';
import officeLocationApi from '../../api/officeLocationApi';
import { useNotification } from '../../context/NotificationContext';

export const OfficeLocationSettings = () => {
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const [formData, setFormData] = useState({
    officeName: '',
    latitude: '',
    longitude: '',
    allowedRadiusMeters: '',
  });
  const { showToast } = useNotification();

  const fetchOffice = async () => {
    setLoading(true);
    try {
      const res = await officeLocationApi.getActive();
      if (res && res.data) {
        setOffice(res.data);
        setFormData({
          officeName: res.data.officeName,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          allowedRadiusMeters: res.data.allowedRadiusMeters,
        });
      }
    } catch (err) {
      console.error('Failed to load office location:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffice();
  }, []);

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setDetectingGps(false);
        showToast('Set office coordinates to your current GPS position!', 'success');
      },
      (err) => {
        setDetectingGps(false);
        showToast('GPS Detection Failed: ' + err.message, 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        officeName: formData.officeName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        allowedRadiusMeters: parseFloat(formData.allowedRadiusMeters),
      };

      if (office?.id) {
        await officeLocationApi.update(office.id, payload);
      } else {
        await officeLocationApi.create(payload);
      }
      showToast('Office geofence settings updated successfully', 'success');
      fetchOffice();
    } catch (err) {
      showToast(err.message || 'Failed to update location', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Office Geofencing Configuration
        </h1>
        <p className="text-xs text-slate-400">
          Configure physical office latitude, longitude coordinates and allowed check-in perimeter radius in meters
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Active Geofence Location</span>
              <p className="text-xs text-slate-400">Enforced by the verification engine on all check-ins</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={detectingGps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 transition"
          >
            <Compass className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
            <span>Use My Current GPS Position</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Office Name *</label>
            <input
              type="text"
              required
              value={formData.officeName}
              onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
              placeholder="e.g. Headquarters Tech Park"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Latitude (Decimal) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="12.9716"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Longitude (Decimal) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="77.5946"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Allowed Geofence Radius (Meters) *
            </label>
            <input
              type="number"
              min="10"
              max="50000"
              required
              value={formData.allowedRadiusMeters}
              onChange={(e) => setFormData({ ...formData, allowedRadiusMeters: e.target.value })}
              placeholder="150"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: For local desktop/browser testing, you can increase this radius (e.g. 5,000m - 10,000m) to easily verify from home.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Updating Geofence...' : 'Save Geofence Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficeLocationSettings;
