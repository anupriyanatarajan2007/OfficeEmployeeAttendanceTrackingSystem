import axiosClient from './axiosClient';

export const auditApi = {
  getAllLogs: (params) => axiosClient.get('/audit-logs', { params }),
};

export default auditApi;
