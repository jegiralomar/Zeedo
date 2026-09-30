'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default:
        'bg-[#5B50D6] text-white hover:bg-[#4A40C4] shadow-md shadow-indigo-500/20 border border-[#4A40C4]/30 active:scale-[0.98]',
      secondary:
        'bg-[#EEEDFB] text-[#5B50D6] hover:bg-[#E0DEFA] border border-[#D8D4F7] active:scale-[0.98]',
      gold:
        'bg-[#FFB800] text-[#1E2235] hover:bg-[#E6A600] font-black shadow-md shadow-amber-500/25 border border-amber-400 active:scale-[0.98]',
      outline:
        'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300 shadow-2xs active:scale-[0.98]',
      ghost:
        'hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:bg-slate-200/70',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 border border-rose-700 active:scale-[0.98]',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 border border-emerald-700 active:scale-[0.98]',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-xl gap-1.5',
      default: 'h-10 px-4 py-2 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base font-extrabold rounded-2xl gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-xl justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all duration-200 select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B50D6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
