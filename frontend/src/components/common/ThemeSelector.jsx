import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSelector = ({ compact = false }) => {
  const { theme, changeTheme, themeList, currentThemeConfig, saving, themeError } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="theme-menu-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        title="Change application theme"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition group ${
          isOpen
            ? 'border-[var(--accent-color)] bg-[var(--accent-light)]'
            : 'border-[var(--border-color)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-light)]'
        }`}
        style={{
          backgroundColor: 'var(--bg-glass-card)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Palette
            className="w-4 h-4 transition-transform group-hover:rotate-12"
            style={{ color: 'var(--accent-color)' }}
          />
          {!compact && (
            <span className="text-xs font-semibold tracking-tight">
              {currentThemeConfig?.name || 'Theme'}
            </span>
          )}
        </div>

        {/* Swatch indicator circle */}
        <span
          className="w-3 h-3 rounded-full border border-white/20 shadow-sm flex-shrink-0"
          style={{ backgroundColor: currentThemeConfig?.swatch?.accent || '#0ea5e9' }}
        />

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 text-[var(--text-secondary)] ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Theme Selection Dropdown Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="theme-menu-button"
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="px-2 pb-2.5 mb-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Theme & Appearance
              </span>
            </div>
            {saving && (
              <span className="text-[10px] animate-pulse" style={{ color: 'var(--accent-color)' }}>
                Saving...
              </span>
            )}
          </div>

          {/* Theme List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
            {themeList.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTheme(t.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition group ${
                    isSelected
                      ? 'ring-1'
                      : 'hover:bg-[var(--accent-light)]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                    borderColor: isSelected ? 'var(--accent-color)' : 'transparent',
                    ringColor: isSelected ? 'var(--accent-color)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Color Preview Swatch */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center p-1 border shadow-sm flex-shrink-0"
                      style={{
                        backgroundColor: t.swatch.bg,
                        borderColor: t.swatch.border,
                      }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: t.swatch.accent }}
                      />
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold leading-tight flex items-center gap-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.name}
                        {t.id === 'DARK' && (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded font-normal"
                            style={{
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent-color)',
                            }}
                          >
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] leading-snug line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: 'var(--accent-color)' }} />
                  )}
                </button>
              );
            })}
          </div>

          {themeError && (
            <div className="mt-2.5 p-2 rounded-lg text-[11px] leading-tight bg-rose-500/10 border border-rose-500/25 text-rose-400">
              {themeError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
