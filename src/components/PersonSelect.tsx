import React, { useState, useRef, useEffect } from 'react';
import { User, Search, X } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  email: string;
}

interface PersonSelectProps {
  persons: Person[];
  value: Person | null;
  onChange: (value: Person | null) => void;
  placeholder: string;
  label: string;
}

export default function PersonSelect({ persons, value, onChange, placeholder, label }: PersonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#2C3539] mb-2">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* Selected Person Display / Search Input */}
        <div
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#2C3539] focus-within:border-transparent cursor-pointer"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {value && !isOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <span className="text-[#2C3539]">{value.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({value.email})</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                ref={inputRef}
                type="text"
                className="w-full focus:outline-none"
                placeholder={value ? value.name : placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredPersons.length > 0 ? (
              filteredPersons.map(person => (
                <div
                  key={person.id}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(person);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <span className="text-[#2C3539]">{person.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({person.email})</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
