import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, THEME_LIST, DEFAULT_THEME, getThemeConfig } from '../themes/themes';
import userApi from '../api/userApi';
import authApi from '../api/authApi';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setCurrentTheme] = useState(() => {
    // 1. Try logged-in user's saved preference
    try {
      const savedUserStr = localStorage.getItem('attendflow_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.themePreference && THEMES[savedUser.themePreference.toUpperCase()]) {
          return savedUser.themePreference.toUpperCase();
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    // 2. Try standalone theme storage
    const localTheme = localStorage.getItem('attendflow_theme');
    if (localTheme && THEMES[localTheme.toUpperCase()]) {
      return localTheme.toUpperCase();
    }

    // 3. Fallback to default
    return DEFAULT_THEME;
  });

  const [saving, setSaving] = useState(false);
  const [themeError, setThemeError] = useState(null);

  // Apply theme to documentElement whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync theme when user logs in or updates
  const syncUserTheme = useCallback((userThemePreference) => {
    if (userThemePreference && THEMES[userThemePreference.toUpperCase()]) {
      const normalized = userThemePreference.toUpperCase();
      setCurrentTheme(normalized);
      localStorage.setItem('attendflow_theme', normalized);
      document.documentElement.setAttribute('data-theme', normalized);
    }
  }, []);

  const changeTheme = async (newThemeKey) => {
    if (!newThemeKey) return;
    const normalizedKey = newThemeKey.toUpperCase();
    if (!THEMES[normalizedKey]) {
      console.warn(`Invalid theme key: ${newThemeKey}`);
      return;
    }

    // 1. Instant UI update
    setCurrentTheme(normalizedKey);
    document.documentElement.setAttribute('data-theme', normalizedKey);
    localStorage.setItem('attendflow_theme', normalizedKey);
    setThemeError(null);

    // 2. Update cached user in localStorage if present
    try {
      const savedUserStr = localStorage.getItem('attendflow_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        savedUser.themePreference = normalizedKey;
        localStorage.setItem('attendflow_user', JSON.stringify(savedUser));
      }
    } catch (e) {
      console.warn('Failed to update local user theme cache:', e);
    }

    // 3. Persist to Backend API if user is authenticated
    const token = localStorage.getItem('attendflow_token');
    if (token) {
      setSaving(true);
      try {
        await userApi.updateTheme(normalizedKey);
      } catch (err) {
        // Fallback to authApi if userApi failed
        try {
          await authApi.updateThemePreference(normalizedKey);
        } catch (authErr) {
          console.error('Failed to persist theme preference to backend:', authErr);
          setThemeError('Theme applied locally. Could not sync with your account on the server.');
        }
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        changeTheme,
        syncUserTheme,
        saving,
        themeError,
        themes: THEMES,
        themeList: THEME_LIST,
        currentThemeConfig: getThemeConfig(theme),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
