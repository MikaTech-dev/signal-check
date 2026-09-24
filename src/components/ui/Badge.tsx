import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'default',
  dot = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    info: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    neutral: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-cyan-400',
    neutral: 'bg-zinc-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border tracking-wide select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
