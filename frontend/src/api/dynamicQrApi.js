import axiosClient from './axiosClient';

export const dynamicQrApi = {
  getActiveQr: () => axiosClient.get('/qr/active'),
  verifyQr: (qrToken) => axiosClient.post('/qr/verify', { qrToken }),
};

export default dynamicQrApi;
