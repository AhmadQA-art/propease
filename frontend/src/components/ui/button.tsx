import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'outline':
          return 'bg-white border border-gray-200 text-[#2C3539] hover:bg-gray-50';
        case 'destructive':
          return 'bg-red-600 text-white hover:bg-red-700';
        default:
          return 'bg-[#2C3539] text-white hover:bg-[#3d474c]';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1 text-sm';
        case 'lg':
          return 'px-6 py-3 text-lg';
        default:
          return 'px-4 py-2';
      }
    };
    
    return (
      <button
        ref={ref}
        className={`
          ${getVariantClasses()}
          ${getSizeClasses()}
          rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539]
          disabled:opacity-50 disabled:pointer-events-none
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
); 