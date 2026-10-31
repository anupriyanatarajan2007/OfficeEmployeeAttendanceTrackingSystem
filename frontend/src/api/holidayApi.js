import axiosClient from './axiosClient';

export const holidayApi = {
  getAll: () => axiosClient.get('/holidays'),
  create: (data) => axiosClient.post('/holidays', data),
  delete: (id) => axiosClient.delete(`/holidays/${id}`),
};

export default holidayApi;
