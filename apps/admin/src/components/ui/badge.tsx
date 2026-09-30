import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'gold'
    | 'live'
    | 'outline'
    | 'success'
    | 'warning'
    | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#5B50D6] text-white border-transparent shadow-xs',
    secondary: 'bg-[#EEEDFB] text-[#5B50D6] border-[#D8D4F7]',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
    live: 'bg-rose-50 text-rose-600 border-rose-300 font-extrabold',
    outline: 'border-slate-200 text-slate-700 bg-white/90 backdrop-blur-xs',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] rounded-md tracking-wider',
    default: 'px-2.5 py-1 text-xs rounded-lg',
    lg: 'px-3 py-1.5 text-sm rounded-xl font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold border transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-1.5 rtl:ml-1.5 rtl:mr-0 shrink-0" />
      )}
      {children}
    </span>
  );
}
