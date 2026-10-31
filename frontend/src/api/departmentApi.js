
import axiosClient from './axiosClient';

export const departmentApi = {
  // Get all departments
  getAll: (activeOnly = false) =>
    axiosClient.get('/departments', {
      params: { activeOnly }
    }),

  // Get department by ID
  getById: (id) =>
    axiosClient.get(`/departments/${id}`),

  // Create department
  create: (data) =>
    axiosClient.post('/departments', data),

  // Update department
  update: (id, data) =>
    axiosClient.put(`/departments/${id}`, data),

  // Activate department
  activate: (id) =>
    axiosClient.put(`/departments/${id}/activate`),

  // Deactivate department
  deactivate: (id) =>
    axiosClient.put(`/departments/${id}/deactivate`),

  // Soft delete department
  delete: (id) =>
    axiosClient.delete(`/departments/${id}`),
};

export default departmentApi;
