import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, RefreshCw } from 'lucide-react';
import holidayApi from '../../api/holidayApi';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidayApi.getAll();
      if (res && res.data) {
        setHolidays(res.data);
      }
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await holidayApi.create({
        holidayName: name,
        holidayDate: date,
        description,
      });
      showToast('Holiday added to corporate calendar', 'success');
      setShowModal(false);
      setName('');
      setDate('');
      setDescription('');
      fetchHolidays();
    } catch (err) {
      showToast(err.message || 'Failed to add holiday', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, holidayName) => {
    if (!window.confirm(`Delete holiday ${holidayName}?`)) return;
    try {
      await holidayApi.delete(id);
      showToast('Holiday removed', 'info');
      fetchHolidays();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Company Holidays</h1>
          <p className="text-xs text-slate-400">Scheduled non-working days exempted from automated absent marking</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading holidays...
          </div>
        ) : holidays.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500">
            No holidays registered
          </div>
        ) : (
          holidays.map((h) => (
            <div key={h.id} className="glass-card-interactive rounded-2xl p-5 space-y-3 relative">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDelete(h.id, h.holidayName)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-mono text-purple-400 font-bold block">{h.holidayDate}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{h.holidayName}</h3>
                <p className="text-xs text-slate-400 mt-1">{h.description || 'Public holiday'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Corporate Holiday">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Holiday Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Labor Day"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Holiday Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or holiday description..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />
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
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidayList;
