import React, { useState, useRef, useEffect } from 'react';
import { User, Search, X } from 'lucide-react';

interface UserOption {
  id: string;
  name: string;
  imageUrl?: string;
}

interface UserSelectProps {
  users: UserOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export default function UserSelect({ users, value, onChange, placeholder, label }: UserSelectProps) {
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

  const selectedUser = users.find(user => user.id === value);
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-sm text-[#6B7280] block">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* Selected User Display / Search Input */}
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
                {selectedUser?.imageUrl ? (
                  <img
                    src={selectedUser.imageUrl}
                    alt={selectedUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <span className="text-[#2C3539]">{selectedUser?.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
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
                placeholder={value ? selectedUser?.name : placeholder}
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(user.id);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-[#2C3539]">{user.name}</span>
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
