import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
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