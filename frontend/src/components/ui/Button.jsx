import React from 'react';
import { motion } from 'framer-motion';

const variantClasses = {
  solid:
    'bg-sanctuary-900 text-white hover:bg-sanctuary-800 active:bg-sanctuary-950 shadow-sm',
  outline:
    'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

const Button = ({
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
      transition={{ duration: 0.15 }}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
