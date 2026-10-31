import axiosClient from './axiosClient';

export const leaveApi = {
  apply: (data) => axiosClient.post('/leaves/apply', data),
  getMyLeaves: (params) => axiosClient.get('/leaves/my', { params }),
  getPending: (params) => axiosClient.get('/leaves/pending', { params }),
  getAll: (params) => axiosClient.get('/leaves', { params }),
  approve: (id) => axiosClient.put(`/leaves/${id}/approve`),
  reject: (id, reason) => axiosClient.put(`/leaves/${id}/reject`, null, { params: { reason } }),
  cancel: (id) => axiosClient.put(`/leaves/${id}/cancel`),
};

export default leaveApi;
