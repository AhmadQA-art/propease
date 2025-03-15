import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile whenever the user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        // Fetch from user_profiles table
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // Create a basic profile from user data
          const fallbackProfile = {
            first_name: user.email?.split('@')[0] || 'User',
            last_name: '',
            email: user.email,
            id: user.id
          };
          
          setUserProfile(fallbackProfile);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        // Create a basic profile from user data
        setUserProfile({
          first_name: user.email?.split('@')[0] || 'User',
          last_name: '',
          email: user.email,
          id: user.id
        });
      }
    };

    fetchUserProfile();
  }, [user]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Logged in successfully');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error logging in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create a new profile for the user in the user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            // Add other user data as needed
          });

        if (profileError) {
          throw profileError;
        }

        // Check if we have an invitation role in the URL
        const searchParams = new URLSearchParams(window.location.search);
        const invitationToken = searchParams.get('invitation');
        const role = searchParams.get('role');
        const organizationId = searchParams.get('organization_id');

        if (invitationToken && role && organizationId) {
          try {
            // Verify the invitation token
            const inviteResponse = await fetch(`/api/invites/verify/${invitationToken}`);
            
            if (!inviteResponse.ok) {
              console.error('Invalid invitation token');
              return;
            }
            
            // Assign the role to the user
            const assignRoleResponse = await fetch('/api/users/assign-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: data.user.id,
                role: role,
                organizationId: organizationId
              }),
            });

            if (!assignRoleResponse.ok) {
              throw new Error(`HTTP error! status: ${assignRoleResponse.status}`);
            }

            console.log('Role assigned successfully');
          } catch (assignRoleError: any) {
            console.error('Error assigning role:', assignRoleError);
            toast.error(assignRoleError.message || 'Error assigning role');
          }
        }
      }

      toast.success('Account created successfully');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Error creating account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error signing out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error('Error sending password reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}