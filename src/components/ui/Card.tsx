import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl',
    elevated: 'bg-zinc-900 border border-zinc-700/80 shadow-lg text-zinc-100 rounded-xl',
    bordered: 'bg-black/60 border border-zinc-800 text-zinc-100 rounded-xl',
  };

  return (
    <div className={cn(variantStyles[variant], 'p-5 sm:p-6 transition-all', className)} {...props}>
      {children}
    </div>
  );
};
