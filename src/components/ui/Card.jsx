import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hoverable = false,
  padding = true,
  onClick,
}) => {
  const base = [
    'bg-white rounded-2xl border border-slate-100 shadow-card',
    padding ? 'p-5' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)' }}
        transition={{ duration: 0.2 }}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
