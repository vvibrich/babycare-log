'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <Image
      src="/icon.svg"
      alt="BabyCare Log"
      width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
      height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
