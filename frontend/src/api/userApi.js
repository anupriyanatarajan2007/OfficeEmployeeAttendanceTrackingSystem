import axiosClient from './axiosClient';

export const userApi = {
  getProfile: () => axiosClient.get('/users/me'),
  updateTheme: (themePreference) => axiosClient.put('/users/me/theme', { themePreference }),
};

export default userApi;
