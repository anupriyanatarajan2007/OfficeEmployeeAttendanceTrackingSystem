import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    green: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    purple: 'text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className="glass-card-interactive rounded-2xl p-5 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-glass-card)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs pt-0.5" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${currentTheme}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {trend && (
        <div
          className="mt-4 pt-3 border-t flex items-center text-xs"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <span className={trend.positive ? 'text-emerald-500 font-semibold mr-1.5' : 'text-rose-500 font-semibold mr-1.5'}>
            {trend.value}
          </span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
