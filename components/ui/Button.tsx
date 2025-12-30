'use client';

import { ButtonProps } from '@/lib/types';

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  className = '' 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-purple to-primary-blue text-white glow-effect hover:scale-105 active:scale-95",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
