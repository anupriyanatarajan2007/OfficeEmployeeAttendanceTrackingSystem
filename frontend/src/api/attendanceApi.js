import axiosClient from './axiosClient';

export const attendanceApi = {
  checkIn: (data) => axiosClient.post('/attendance/check-in', data),
  checkOut: (data) => axiosClient.post('/attendance/check-out', data),
  verifyLocation: (data) => axiosClient.post('/attendance/verify-location', data),
  verifyFace: (employeeCode, data) =>
    axiosClient.post('/attendance/verify-face', data, { params: { employeeCode } }),
  verifyQr: (data) => axiosClient.post('/attendance/verify-qr', data),
  getToday: () => axiosClient.get('/attendance/today'),
  getMyAttendance: (params) => axiosClient.get('/attendance/my', { params }),
  getAllAttendance: (params) => axiosClient.get('/attendance', { params }),
  getSummaryStats: () => axiosClient.get('/attendance/summary'),
};

export default attendanceApi;
