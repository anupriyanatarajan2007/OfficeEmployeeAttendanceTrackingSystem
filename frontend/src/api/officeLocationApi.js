import axiosClient from './axiosClient';

export const officeLocationApi = {
  getActive: () => axiosClient.get('/office-location'),
  getAll: () => axiosClient.get('/office-location/all'),
  create: (data) => axiosClient.post('/office-location', data),
  update: (id, data) => axiosClient.put(`/office-location/${id}`, data),
  delete: (id) => axiosClient.delete(`/office-location/${id}`),
};

export default officeLocationApi;
