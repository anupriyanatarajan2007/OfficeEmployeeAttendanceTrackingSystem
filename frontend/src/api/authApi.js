import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  getCurrentUser: () => axiosClient.get('/auth/me'),
  updateThemePreference: (themePreference) =>
    axiosClient.put('/auth/me/theme', { themePreference }),
};

export default authApi;
