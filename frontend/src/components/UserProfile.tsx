import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, LogOut, User } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchUserProfile() {
      if (user?.id) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const data = await response.json();
          setUserProfile(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }

    fetchUserProfile();
  }, [user]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-3 rounded-lg hover:bg-white transition-colors"
      >
        {userProfile ? (
          <>
            <div className="w-10 h-10 rounded-full bg-[#2C3539] flex items-center justify-center text-white text-sm font-medium">
              {getInitials(userProfile.first_name, userProfile.last_name)}
            </div>
            <div className="ml-3 text-left flex-1">
              <p className="text-sm font-medium text-[#2C3539]">
                {`${userProfile.first_name} ${userProfile.last_name}`}
              </p>
              <p className="text-xs text-[#6B7280] truncate">{userProfile.email}</p>
            </div>
          </>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        )}
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