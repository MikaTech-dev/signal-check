import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border tracking-tight select-none',
  {
    variants: {
      variant: {
        default: 'bg-zinc-100 text-zinc-800 border-zinc-200',
        purple: 'bg-purple-50 text-purple-950 border-purple-200/80 font-semibold',
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        warning: 'bg-amber-50 text-amber-900 border-amber-200',
        danger: 'bg-rose-50 text-rose-900 border-rose-200',
        outline: 'bg-transparent text-zinc-700 border-zinc-300',
        secondary: 'bg-zinc-100 text-zinc-800 border-zinc-200',
        destructive: 'bg-rose-50 text-rose-900 border-rose-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'default',
  dot = false,
  ...props
}) => {
  const dotColors: Record<string, string> = {
    default: 'bg-zinc-400',
    purple: 'bg-purple-700',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
    outline: 'bg-zinc-400',
    secondary: 'bg-zinc-400',
    destructive: 'bg-rose-600',
  };

  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant || 'default'])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export { badgeVariants };
