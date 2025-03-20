import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`
          w-full px-3 py-2 border border-gray-200 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className || ''}
        `}
        ref={ref}
        {...props}
      />
    );
  }
); 