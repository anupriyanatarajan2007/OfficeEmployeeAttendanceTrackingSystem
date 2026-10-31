export const THEMES = {
  DARK: {
    id: 'DARK',
    name: 'Dark Slate',
    description: 'Modern sleek dark theme (Default)',
    swatch: {
      bg: '#090d16',
      card: '#1e293b',
      accent: '#0ea5e9',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    chartColors: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  },
  LIGHT: {
    id: 'LIGHT',
    name: 'Executive Light',
    description: 'Clean, crisp daylight professional office theme',
    swatch: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#0284c7',
      border: '#cbd5e1',
    },
    chartColors: ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed'],
  },
  OCEAN: {
    id: 'OCEAN',
    name: 'Ocean Blue',
    description: 'Deep maritime navy with vivid sapphire accents',
    swatch: {
      bg: '#051020',
      card: '#0e2647',
      accent: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.25)',
    },
    chartColors: ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#818cf8'],
  },
  PURPLE: {
    id: 'PURPLE',
    name: 'Royal Purple',
    description: 'Regal midnight violet with amethyst glow',
    swatch: {
      bg: '#0d061a',
      card: '#231240',
      accent: '#c084fc',
      border: 'rgba(192, 132, 252, 0.25)',
    },
    chartColors: ['#c084fc', '#34d399', '#f59e0b', '#f43f5e', '#38bdf8'],
  },
  GREEN: {
    id: 'GREEN',
    name: 'Emerald Forest',
    description: 'Refreshing dark botanical emerald and mint tones',
    swatch: {
      bg: '#04140c',
      card: '#0b2e1d',
      accent: '#34d399',
      border: 'rgba(52, 211, 153, 0.25)',
    },
    chartColors: ['#34d399', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa'],
  },
  HIGH_CONTRAST: {
    id: 'HIGH_CONTRAST',
    name: 'High Contrast',
    description: 'Ultra-accessible pitch black with stark high-visibility accents',
    swatch: {
      bg: '#000000',
      card: '#121212',
      accent: '#facc15',
      border: '#ffffff',
    },
    chartColors: ['#facc15', '#4ade80', '#fb923c', '#f87171', '#38bdf8'],
  },
};

export const THEME_LIST = Object.values(THEMES);

export const DEFAULT_THEME = 'DARK';

export const getThemeConfig = (themeId) => {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
};
