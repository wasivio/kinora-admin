import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'gold-border' | 'glass';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#121215] border border-zinc-800/80 shadow-card-dark',
    'gold-border': 'bg-[#121215] border border-gold-primary/30 shadow-gold-glow',
    glass: 'bg-[#121215]/80 backdrop-blur-md border border-zinc-800/60',
  };

  return (
    <div
      className={`rounded-xl p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
