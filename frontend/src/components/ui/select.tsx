import React, { createContext, useContext, useState } from 'react';

const SelectContext = createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Select = ({ children, defaultValue, value, onValueChange }: SelectProps) => {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
      {children}
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        type="button"
        className={`
          w-full px-3 py-2 border border-gray-200 rounded-lg text-left
          focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent
          ${className || ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </button>
      {isOpen && (
        <div 
          className="fixed inset-0 h-full w-full z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute mt-1 w-full z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const SelectItem = ({ value, children }: SelectItemProps) => {
  const { onValueChange } = useContext(SelectContext);
  
  return (
    <div
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </div>
  );
}; 