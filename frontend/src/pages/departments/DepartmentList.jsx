
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import departmentApi from '../../api/departmentApi';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotification();

  // =========================
  // FETCH DEPARTMENTS
  // =========================
  const fetchDepartments = async () => {
    setLoading(true);

    try {
      const res = await departmentApi.getAll();

      if (res && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDept) {
        await departmentApi.update(editingDept.id, {
          departmentName: name,
          description
        });

        showToast('Department updated successfully', 'success');
      } else {
        await departmentApi.create({
          departmentName: name,
          description
        });

        showToast('Department created successfully', 'success');
      }

      setShowModal(false);
      setEditingDept(null);
      setName('');
      setDescription('');

      fetchDepartments();

    } catch (err) {
      showToast(
        err.message || 'Failed to save department',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // OPEN EDIT
  // =========================
  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.departmentName);
    setDescription(dept.description || '');
    setShowModal(true);
  };

  // =========================
  // ACTIVATE DEPARTMENT
  // =========================
  const handleActivate = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to activate ${deptName}?`)) {
      return;
    }

    try {
      await departmentApi.activate(id);

      showToast(
        `${deptName} activated successfully`,
        'success'
      );

      fetchDepartments();

    } catch (err) {
      console.error('Failed to activate department:', err);

      showToast(
        err.message || 'Failed to activate department',
        'error'
      );
    }
  };

  // =========================
  // DEACTIVATE DEPARTMENT
  // =========================
  const handleDeactivate = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${deptName}?`)) {
      return;
    }

    try {
      await departmentApi.deactivate(id);

      showToast(
        `${deptName} deactivated successfully`,
        'info'
      );

      fetchDepartments();

    } catch (err) {
      console.error('Failed to deactivate department:', err);

      showToast(
        err.message || 'Failed to deactivate department',
        'error'
      );
    }
  };

  // =========================
  // DELETE DEPARTMENT
  // =========================
  const handleDelete = async (id, deptName) => {
    if (!window.confirm(`Delete department ${deptName}?`)) {
      return;
    }

    try {
      await departmentApi.delete(id);

      showToast(
        'Department deleted',
        'info'
      );

      fetchDepartments();

    } catch (err) {
      console.error('Failed to delete department:', err);

      showToast(
        err.message || 'Failed to delete department',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Departments
          </h1>

          <p className="text-xs text-slate-400">
            Manage organizational departments and business units
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDept(null);
            setName('');
            setDescription('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>

      </div>

      {/* =========================
          DEPARTMENT CARDS
      ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {loading ? (

          <div className="col-span-3 text-center py-12 text-slate-400">

            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />

            Loading departments...

          </div>

        ) : departments.length === 0 ? (

          <div className="col-span-3 text-center py-12 text-slate-400">
            No departments found.
          </div>

        ) : (

          departments.map((dept) => (

            <div
              key={dept.id}
              className="glass-card-interactive rounded-2xl p-5 space-y-3 relative"
            >

              {/* =========================
                  TOP SECTION
              ========================= */}
              <div className="flex items-start justify-between">

                {/* Department Icon */}
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Building2 className="w-5 h-5" />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-1">

                  {/* EDIT */}
                  <button
                    onClick={() => openEdit(dept)}
                    title="Edit Department"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* ACTIVATE / DEACTIVATE */}
                  {dept.active ? (

                    <button
                      onClick={() =>
                        handleDeactivate(
                          dept.id,
                          dept.departmentName
                        )
                      }
                      title="Deactivate Department"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>

                  ) : (

                    <button
                      onClick={() =>
                        handleActivate(
                          dept.id,
                          dept.departmentName
                        )
                      }
                      title="Activate Department"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                  )}

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      handleDelete(
                        dept.id,
                        dept.departmentName
                      )
                    }
                    title="Delete Department"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>

              {/* =========================
                  DEPARTMENT DETAILS
              ========================= */}
              <div>

                <div className="flex items-center justify-between gap-2">

                  <h3 className="text-base font-bold text-white">
                    {dept.departmentName}
                  </h3>

                  {/* STATUS */}
                  {dept.active ? (

                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>

                  ) : (

                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      INACTIVE
                    </span>

                  )}

                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {dept.description || 'No description provided'}
                </p>

              </div>

            </div>

          ))

        )}

      </div>

      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingDept
            ? 'Edit Department'
            : 'Create Department'
        }
      >

        <form
          onSubmit={handleSave}
          className="space-y-4 text-xs"
        >

          {/* DEPARTMENT NAME */}
          <div>

            <label className="block font-medium text-slate-300 mb-1">
              Department Name *
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operations"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />

          </div>

          {/* DESCRIPTION */}
          <div>

            <label className="block font-medium text-slate-300 mb-1">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Brief overview of department functions..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            />

          </div>

          {/* MODAL BUTTONS */}
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
              {submitting
                ? 'Saving...'
                : 'Save Department'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};

export default DepartmentList;