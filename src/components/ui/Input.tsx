import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input_${Date.now()}`;
  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-wider text-brown mb-1.5 font-sans">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-ivory border ${error ? 'border-red-500' : 'border-charcoal/20 focus:border-gold'} rounded px-4 py-2.5 text-sm text-charcoal placeholder-charcoal/40 transition-all duration-200 outline-none font-sans ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>
      )}
    </div>
  );
};
