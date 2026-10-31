import axiosClient from './axiosClient';

export const anomalyApi = {
  getAll: (params) => axiosClient.get('/anomalies', { params }),
  getUnresolved: () => axiosClient.get('/anomalies/unresolved'),
  resolve: (id, resolutionNote) =>
    axiosClient.put(`/anomalies/${id}/resolve`, null, { params: { resolutionNote } }),
};

export default anomalyApi;
