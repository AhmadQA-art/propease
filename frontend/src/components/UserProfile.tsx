import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (user && !userProfile) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">
          !
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden bg-[#2C3539] flex items-center justify-center text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
        title={`${userProfile.first_name || ''} ${userProfile.last_name || ''}`}
      >
        {getInitials(userProfile.first_name || '', userProfile.last_name || '')}
      </button>

      {isOpen && (
        <div className="absolute right-full mr-2 top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-[#2C3539] truncate">
              {`${userProfile.first_name || ''} ${userProfile.last_name || ''}`}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {userProfile.email || user.email || ''}
            </p>
          </div>
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-[#2C3539] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4 mr-2 shrink-0" />
            My Account
          </Link>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-[#2C3539] hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2 shrink-0" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}