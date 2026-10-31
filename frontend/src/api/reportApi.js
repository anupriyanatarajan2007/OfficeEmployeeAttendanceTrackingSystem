import axiosClient from './axiosClient';

export const reportApi = {
  getPreview: (params) => axiosClient.get('/reports/preview', { params }),
  downloadExcel: (params) =>
    axiosClient.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    }),
  downloadPdf: (params) =>
    axiosClient.get('/reports/export/pdf', {
      params,
      responseType: 'blob',
    }),
};

export default reportApi;
