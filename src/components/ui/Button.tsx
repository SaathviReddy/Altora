import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded';
  
  const variants = {
    primary: 'bg-charcoal text-cream hover:bg-opacity-90 active:scale-[0.98]',
    secondary: 'bg-brown text-cream hover:bg-opacity-90 active:scale-[0.98]',
    outline: 'border border-charcoal/20 text-charcoal hover:bg-charcoal/5 active:scale-[0.98]',
    gold: 'bg-gold text-charcoal font-semibold hover:bg-opacity-90 active:scale-[0.98]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs tracking-wider uppercase',
    md: 'px-5 py-2.5 text-sm tracking-wide',
    lg: 'px-8 py-3.5 text-base tracking-wide font-semibold'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
