import React from 'react';

const colorClasses = {
  green: 'bg-sanctuary-100 text-sanctuary-800',
  amber: 'bg-amber-100 text-amber-800',
  rose:  'bg-rose-100 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
  blue:  'bg-blue-100 text-blue-700',
};

const Badge = ({ children, color = 'green', className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase',
        colorClasses[color],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
