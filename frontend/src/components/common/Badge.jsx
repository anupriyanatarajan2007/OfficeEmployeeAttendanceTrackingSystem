import React from 'react';

const variantClasses = {
  PRESENT: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  CHECKED_IN: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  ACTIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  SUCCESS: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',

  ABSENT: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  INACTIVE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  HIGH: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  SUSPENDED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',

  LATE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  HALF_DAY: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',

  LOW: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  ON_LEAVE: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  HOLIDAY: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  DEFAULT: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
};

export const Badge = ({ status, text, size = 'sm', className = '' }) => {
  const normalized = (status || '').toUpperCase();
  const classes = variantClasses[normalized] || variantClasses.DEFAULT;
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${classes} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {text || status}
    </span>
  );
};

export default Badge;
