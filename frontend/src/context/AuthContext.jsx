import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('attendflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('attendflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('attendflow_token');
      if (savedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('attendflow_user', JSON.stringify(res.data));
            if (res.data.themePreference) {
              const pref = res.data.themePreference.toUpperCase();
              document.documentElement.setAttribute('data-theme', pref);
              localStorage.setItem('attendflow_theme', pref);
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('attendflow_token', jwtToken);
      localStorage.setItem('attendflow_user', JSON.stringify(userData));
      if (userData.themePreference) {
        const pref = userData.themePreference.toUpperCase();
        document.documentElement.setAttribute('data-theme', pref);
        localStorage.setItem('attendflow_theme', pref);
      }
      return userData;
    }
    throw new Error('Login failed: Invalid server response');
  };

  const logout = () => {
    localStorage.removeItem('attendflow_token');
    localStorage.removeItem('attendflow_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isHr = user?.role === 'ROLE_HR' || user?.role === 'HR';
  const isEmployee = user?.role === 'ROLE_EMPLOYEE' || user?.role === 'EMPLOYEE';
  const canManage = isAdmin || isHr;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        isAdmin,
        isHr,
        isEmployee,
        canManage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
