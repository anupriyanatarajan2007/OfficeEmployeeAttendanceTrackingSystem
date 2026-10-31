import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, Moon, Sun, RefreshCw } from 'lucide-react';
import shiftApi from '../../api/shiftApi';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    minimumWorkingMinutes: 480,
    overnight: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await shiftApi.getAll();
      if (res && res.data) {
        setShifts(res.data);
      }
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingShift) {
        await shiftApi.update(editingShift.id, formData);
        showToast('Shift updated successfully', 'success');
      } else {
        await shiftApi.create(formData);
        showToast('Shift created successfully', 'success');
      }
      setShowModal(false);
      setEditingShift(null);
      fetchShifts();
    } catch (err) {
      showToast(err.message || 'Failed to save shift', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (s) => {
    setEditingShift(s);
    setFormData({
      shiftName: s.shiftName,
      startTime: s.startTime,
      endTime: s.endTime,
      gracePeriodMinutes: s.gracePeriodMinutes,
      minimumWorkingMinutes: s.minimumWorkingMinutes,
      overnight: s.overnight || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete shift policy ${name}?`)) return;
  
    try {
      await shiftApi.delete(id);
      showToast('Shift deleted successfully', 'success');
      fetchShifts();
    } catch (err) {
      console.error('Failed to delete shift:', err);
      showToast(err.message || 'Failed to delete shift', 'error');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Shift Policies</h1>
          <p className="text-xs text-slate-400">Configure working hours, grace periods, minimum hours, and overnight shifts</p>
        </div>
        <button
          onClick={() => {
            setEditingShift(null);
            setFormData({
              shiftName: '',
              startTime: '09:00',
              endTime: '18:00',
              gracePeriodMinutes: 15,
              minimumWorkingMinutes: 480,
              overnight: false,
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shift Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading shift schedules...
          </div>
        ) : (
          shifts.map((s) => (
            <div key={s.id} className="glass-card-interactive rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${s.overnight ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {s.overnight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{s.shiftName}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.startTime} — {s.endTime} {s.overnight ? '(Overnight)' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.shiftName)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Grace Period</span>
                  <span className="text-white font-bold">{s.gracePeriodMinutes} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Min. Hours Required</span>
                  <span className="text-white font-bold">{Math.floor(s.minimumWorkingMinutes / 60)} hrs</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingShift ? 'Edit Shift Policy' : 'Create Shift Policy'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Shift Name *</label>
            <input
              type="text"
              required
              value={formData.shiftName}
              onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
              placeholder="e.g. Evening Shift"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Start Time (HH:mm) *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">End Time (HH:mm) *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Minimum Working (Minutes)</label>
              <input
                type="number"
                min="60"
                value={formData.minimumWorkingMinutes}
                onChange={(e) => setFormData({ ...formData, minimumWorkingMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="overnight"
              checked={formData.overnight}
              onChange={(e) => setFormData({ ...formData, overnight: e.target.checked })}
              className="rounded bg-slate-900 border-slate-800 text-sky-600 focus:ring-0"
            />
            <label htmlFor="overnight" className="text-slate-300 cursor-pointer">
              Overnight Shift (Crosses past midnight)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
            >
              {submitting ? 'Saving...' : 'Save Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftList;
