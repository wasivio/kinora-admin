import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-semibold',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    gold: 'bg-gold-primary/10 text-gold-light border border-gold-primary/30',
    success: 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40',
    warning: 'bg-amber-950/40 text-amber-300 border border-amber-800/40',
    danger: 'bg-red-950/40 text-red-300 border border-red-800/40',
    info: 'bg-sky-950/40 text-sky-300 border border-sky-800/40',
    neutral: 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/40',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
