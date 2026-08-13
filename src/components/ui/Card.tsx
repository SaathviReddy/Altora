import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: 'ivory' | 'cream' | 'goldOutline';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  variant = 'ivory',
  className = '',
  ...props
}) => {
  const bgStyles = {
    ivory: 'bg-ivory border border-charcoal/10',
    cream: 'bg-cream border border-charcoal/5',
    goldOutline: 'bg-ivory border border-gold/40'
  };

  const hoverStyle = hoverEffect 
    ? 'hover:border-gold/60 hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]' 
    : 'transition-colors duration-200';

  return (
    <div
      className={`p-6 rounded shadow-[0_2px_8px_rgba(26,26,26,0.02)] ${bgStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
