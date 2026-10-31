import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Scan, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import employeeApi from '../../api/employeeApi';
import departmentApi from '../../api/departmentApi';
import shiftApi from '../../api/shiftApi';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FaceEnrollmentModal from './FaceEnrollmentModal';
import { useNotification } from '../../context/NotificationContext';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [enrollingEmp, setEnrollingEmp] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    empCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '',
    shiftId: '',
    username: '',
    password: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { showToast } = useNotification();

  const fetchEmployees = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll({
        page: pageNum,
        size: 10,
        keyword: keyword || undefined,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
      });
      if (res && res.data) {
        setEmployees(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          departmentApi.getAll(true),
          shiftApi.getAll(true),
        ]);
        if (dRes && dRes.data) setDepartments(dRes.data);
        if (sRes && sRes.data) setShifts(sRes.data);
      } catch (err) {
        console.error('Failed to load departments/shifts:', err);
      }
    };
    loadMetadata();
    fetchEmployees(0);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(0);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        shiftId: formData.shiftId ? Number(formData.shiftId) : undefined,
      };

      if (editingEmp) {
        await employeeApi.update(editingEmp.id, payload);
        showToast('Employee updated successfully', 'success');
      } else {
        await employeeApi.create(payload);
        showToast('New employee onboarded successfully', 'success');
      }

      setShowAddModal(false);
      setEditingEmp(null);
      resetForm();
      fetchEmployees(page);
    } catch (err) {
      setFormError(err.message || 'Failed to save employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      empCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      designation: '',
      departmentId: '',
      shiftId: '',
      username: '',
      password: '',
    });
  };

  const handleActivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to activate ${name}?`)) return;
  
    try {
      await employeeApi.activate(id);
      showToast(`${name} activated`, 'success');
      fetchEmployees(page);
    } catch (err) {
      showToast(err.message || 'Failed to activate employee', 'error');
    }
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      empCode: emp.empCode,
      firstName: emp.firstName || emp.name?.split(' ')[0] || '',
      lastName: emp.lastName || emp.name?.split(' ')[1] || '',
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation || '',
      departmentId: emp.departmentId || '',
      shiftId: emp.shiftId || '',
      username: emp.username || '',
      password: '',
    });
    setShowAddModal(true);
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await employeeApi.delete(id);
      showToast(`${name} deactivated`, 'info');
      fetchEmployees(page);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-400">Manage employee accounts, biometric enrollment, and shift assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingEmp(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name, code, designation..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.departmentName}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setSelectedDept('');
                setSelectedStatus('');
                fetchEmployees(0);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Employee Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Designation</th>
                <th className="p-4 font-semibold">Assigned Shift</th>
                <th className="p-4 font-semibold">Face Enrolled</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading employee directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No employees found matching criteria
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium text-white">
                      <div>{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.empCode} • {emp.email}</div>
                    </td>
                    <td className="p-4 text-slate-300">{emp.department || 'Engineering'}</td>
                    <td className="p-4 text-slate-300">{emp.designation || '-'}</td>
                    <td className="p-4 text-slate-300">{emp.shiftName || 'General Day Shift'}</td>
                    <td className="p-4">
                      {emp.faceEnrolled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                        </span>
                      ) : (
                        <button
                          onClick={() => setEnrollingEmp(emp)}
                          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold text-[11px] underline"
                        >
                          <Scan className="w-3.5 h-3.5" /> Enroll Now
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={emp.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEnrollingEmp(emp)}
                          title="Capture/Update Face Biometric"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                        >
                          <Scan className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {emp.status === 'ACTIVE' ? (
  <button
    onClick={() => handleDeactivate(emp.id, emp.name)}
    title="Deactivate"
    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
  >
    <XCircle className="w-4 h-4" />
  </button>
) : (
  <button
    onClick={() => handleActivate(emp.id, emp.name)}
    title="Activate"
    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 transition"
  >
    <CheckCircle2 className="w-4 h-4" />
  </button>
)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingEmp ? `Edit Employee - ${editingEmp.name}` : 'Onboard New Employee'}
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Employee Code *</label>
              <input
                type="text"
                required
                disabled={!!editingEmp}
                value={formData.empCode}
                onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                placeholder="EMP002"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Assigned Shift</label>
              <select
                value={formData.shiftId}
                onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.shiftName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0100"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {!editingEmp && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-sky-400">Portal Login Credentials</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Username (Default: code)</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="emp002"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Defaults to employee123"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingEmp ? 'Update Employee' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Face Biometric Enrollment Modal */}
      {enrollingEmp && (
        <FaceEnrollmentModal
          isOpen={!!enrollingEmp}
          employee={enrollingEmp}
          onClose={() => setEnrollingEmp(null)}
          onEnrolled={() => fetchEmployees(page)}
        />
      )}
    </div>
  );
};

export default EmployeeList;
