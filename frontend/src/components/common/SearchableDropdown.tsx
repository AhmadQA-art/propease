import React, { useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface Option {
  id: string;
  label: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = Array.isArray(value) 
    ? options.filter(opt => value.includes(opt.id))
    : options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(option.id)
        ? currentValue.filter(id => id !== option.id)
        : [...currentValue, option.id];
      onChange(newValue);
    } else {
      onChange(option.id);
      setIsOpen(false);
    }
  };

  const handleRemove = (optionId: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(id => id !== optionId));
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={`relative ${className}`}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="w-full min-h-[38px] px-3 py-2 text-left bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {multiple ? (
                  Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
                    selectedOptions.map(opt => (
                      <span
                        key={opt.id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm"
                      >
                        {opt.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(opt.id);
                          }}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">{placeholder}</span>
                  )
                ) : (
                  <span className={selectedOptions ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedOptions ? (selectedOptions as Option).label : placeholder}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="w-[var(--radix-popover-trigger-width)] p-1 bg-white rounded-lg shadow-lg border border-gray-200"
            sideOffset={4}
          >
            <div className="p-2">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                />
              </div>
              <div className="max-h-60 overflow-auto">
                {filteredOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm rounded-md
                      ${multiple 
                        ? Array.isArray(value) && value.includes(option.id)
                          ? 'bg-[#2C3539] text-white'
                          : 'hover:bg-gray-100'
                        : value === option.id
                          ? 'bg-[#2C3539] text-white'
                          : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {((multiple && Array.isArray(value) && value.includes(option.id)) ||
                        (!multiple && value === option.id)) && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
};

export default SearchableDropdown; 