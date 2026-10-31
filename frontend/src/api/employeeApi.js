import axiosClient from './axiosClient';

export const employeeApi = {
  getAll: (params) => axiosClient.get('/employees', { params }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  getByCode: (code) => axiosClient.get(`/employees/code/${code}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  enrollFace: (id, data) => axiosClient.post(`/employees/${id}/enroll-face`, data),
  activate: (id) => axiosClient.put(`/employees/${id}/activate`),
};

export default employeeApi;
