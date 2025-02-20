import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization_id: string | null;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, profileData: {
    first_name: string;
    last_name: string;
    organization_name: string;
    role: string;
    phone: string;
    organization_subscription: 'trial' | 'basic' | 'premium' | 'enterprise';
  }) => Promise<void>;
  requestAccess: (name: string, organizationName: string, jobTitle: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  requestAccess: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile function
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check and set initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        const profile = await fetchUserProfile(data.user.id);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      
      // Navigate to login page
      window.location.href = '/login';  // Using window.location to ensure complete reset
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      throw error;
    }
  };

  const signup = async (email: string, password: string, profileData: {
    first_name: string;
    last_name: string;
    organization_name: string;
    role: string;
    phone: string;
    organization_subscription: 'trial' | 'basic' | 'premium' | 'enterprise';
  }) => {
    let userId: string | undefined;
    let organizationId: string | undefined;

    try {
      console.log('Starting signup process for:', email);

      // 1. Create the user in authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: profileData.role
          }
        }
      });

      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        console.error('No user data received after signup');
        throw new Error('No user data received after signup');
      }

      userId = authData.user.id;
      console.log('User created successfully with ID:', userId);

      // 2. Create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            name: profileData.organization_name,
            subscription_status: profileData.organization_subscription
          }
        ])
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      if (!orgData) {
        console.error('No organization data received after creation');
        throw new Error('No organization data received after creation');
      }

      organizationId = orgData.id;
      console.log('Organization created successfully with ID:', organizationId);

      // 3. Create the user profile
      console.log('Creating user profile for user:', userId);
      
      // First, check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error checking existing profile:', checkError);
        throw new Error(`Failed to check existing profile: ${checkError.message}`);
      }

      const userProfileData = {
        id: userId,
        email: email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        organization_id: organizationId,
        phone: profileData.phone
      };

      console.log('User profile data to be inserted:', userProfileData);

      let profileResult;
      if (existingProfile) {
        console.log('Updating existing profile');
        profileResult = await supabase
          .from('user_profiles')
          .update(userProfileData)
          .eq('id', userId);
      } else {
        console.log('Creating new profile');
        profileResult = await supabase
          .from('user_profiles')
          .insert([userProfileData]);
      }

      const { error: profileError } = profileResult;

      if (profileError) {
        console.error('Detailed profile error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('User profile created successfully');

      // 4. Verify everything was created
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          organization_id,
          phone,
          organizations:organization_id (id, name, subscription_status)
        `)
        .eq('id', userId)
        .single();

      if (verifyError) {
        console.error('Profile verification error:', {
          code: verifyError.code,
          message: verifyError.message,
          details: verifyError.details,
          hint: verifyError.hint
        });
        throw new Error(`Failed to verify profile creation: ${verifyError.message}`);
      }

      if (!verifyProfile) {
        console.error('No profile found after creation');
        throw new Error('Profile creation failed - no profile found');
      }

      console.log('Profile verified successfully:', verifyProfile);

      // Set the user immediately after successful signup
      setUser(authData.user);
      console.log('Signup process completed successfully');

    } catch (error) {
      console.error('Signup process failed:', error);

      // Attempt to clean up if we have partial creation
      if (userId) {
        try {
          if (organizationId) {
            await supabase.from('organizations').delete().eq('id', organizationId);
          }
          await supabase.from('user_profiles').delete().eq('id', userId);
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }

      throw error;
    }
  };
  

  const requestAccess = async (name: string, organizationName: string, jobTitle: string) => {
    try {
      // You'll need to create this table in your Supabase database
      const { error } = await supabase
        .from('access_requests')
        .insert([
          {
            name,
            organization_name: organizationName,
            job_title: jobTitle,
            status: 'pending'
          }
        ]);

      if (error) throw error;
    } catch (error) {
      throw new Error('Failed to submit access request');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userProfile,
        isAuthenticated, 
        isLoading,
        login, 
        logout,
        signup,
        requestAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 