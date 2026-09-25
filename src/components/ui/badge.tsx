import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border tracking-tight select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#F5F5F4] text-[#171717] border-[#E7E5E4]',
        amber: 'bg-amber-50 text-amber-950 border-amber-200 font-semibold',
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        warning: 'bg-amber-50 text-amber-900 border-amber-200',
        danger: 'bg-rose-50 text-rose-900 border-rose-200',
        outline: 'bg-transparent text-[#57534E] border-[#D6D3D1]',
        secondary: 'bg-[#F5F5F4] text-[#171717] border-[#E7E5E4]',
        destructive: 'bg-rose-50 text-rose-900 border-rose-200',
        dark: 'bg-[#0A0A0A] text-[#FAFAF9] border-[#0A0A0A] font-semibold',
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
    default: 'bg-[#737373]',
    amber: 'bg-[#C7862B]',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
    outline: 'bg-[#737373]',
    secondary: 'bg-[#737373]',
    destructive: 'bg-rose-600',
    dark: 'bg-[#C7862B]',
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
