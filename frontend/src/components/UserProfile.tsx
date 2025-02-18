import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, LogOut, User } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { handleError } from '@/utils/errorHandler';
import { toast } from 'react-hot-toast';

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!userProfile) {
    return (
      <div className="flex items-center w-full p-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="ml-3 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-white transition-colors"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2C3539] flex items-center justify-center text-white text-sm font-medium shrink-0">
          {getInitials(userProfile.first_name, userProfile.last_name)}
        </div>
        <div className="ml-3 text-left flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2C3539] truncate">
            {`${userProfile.first_name} ${userProfile.last_name}`}
          </p>
          <p className="text-xs text-[#6B7280] truncate max-w-[150px]">
            {userProfile.email}
          </p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#6B7280] ml-2 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
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