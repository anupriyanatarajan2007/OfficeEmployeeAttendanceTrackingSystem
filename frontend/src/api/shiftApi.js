import axiosClient from './axiosClient';

export const shiftApi = {
  getAll: (activeOnly = false) => axiosClient.get('/shifts', { params: { activeOnly } }),
  getById: (id) => axiosClient.get(`/shifts/${id}`),
  create: (data) => axiosClient.post('/shifts', data),
  update: (id, data) => axiosClient.put(`/shifts/${id}`, data),
  delete: (id) => axiosClient.delete(`/shifts/${id}`),
};

export default shiftApi;
