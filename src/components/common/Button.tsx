import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090B] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA771C] text-black font-semibold hover:brightness-110 shadow-gold-glow active:scale-[0.98] focus:ring-gold-primary',
    secondary:
      'bg-[#18181B] text-[#F4F4F5] border border-zinc-800 hover:border-gold-primary/50 hover:bg-[#202024] focus:ring-zinc-700',
    outline:
      'bg-transparent text-gold-primary border border-gold-primary/40 hover:bg-gold-primary/10 hover:border-gold-primary focus:ring-gold-primary',
    danger:
      'bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:text-red-300 focus:ring-red-600',
    ghost:
      'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60 focus:ring-zinc-700',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
