import React from 'react';
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        'text-zinc-600 bg-clip-text inline-block',
        disabled
          ? ''
          : 'bg-gradient-to-r from-purple-950 via-purple-600 to-purple-950 bg-[length:200%_100%] animate-shine',
        className
      )}
      style={{
        backgroundImage: disabled
          ? undefined
          : 'linear-gradient(120deg, rgba(59, 7, 100, 0.8) 0%, rgba(147, 51, 234, 1) 50%, rgba(59, 7, 100, 0.8) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: disabled ? 'inherit' : 'transparent',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
};
