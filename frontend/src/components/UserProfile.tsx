import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, LogOut, User } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

interface UserProfileProps {
  name: string;
  email: string;
  imageUrl: string;
}

export default function UserProfile({ name, email, imageUrl }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-white transition-colors"
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3 text-left flex-1">
          <p className="text-sm font-medium text-[#2C3539]">{name}</p>
          <p className="text-xs text-[#6B7280] truncate">{email}</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#6B7280]" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-[#2C3539] hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4 mr-2" />
            My Account
          </Link>
          <button
            onClick={async () => {
              setIsOpen(false);
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                navigate('/login');
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-[#2C3539] hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}