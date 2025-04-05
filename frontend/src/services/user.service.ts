import { supabase } from './supabase/client';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  job_title?: string;
  department?: string;
  start_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the user profile from the database
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  
  return data as UserProfile;
};

/**
 * Fetches the organization details for the current user
 */
export const getUserOrganization = async (): Promise<Organization> => {
  // First get the user profile to get the organization_id
  const userProfile = await getUserProfile();
  
  console.log('User profile for organization fetch:', userProfile);
  
  // Check both possible field names to be safe
  const organizationId = userProfile.organization_id || (userProfile as any).org_id;
  
  if (!organizationId) {
    console.error('Organization ID not found in user profile. Available fields:', Object.keys(userProfile));
    throw new Error('User does not belong to an organization');
  }
  
  console.log(`Querying organization with ID: ${organizationId}`);
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();
    
  if (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
  
  return data as Organization;
};

/**
 * Fetches the user's role information
 */
export const getUserRole = async (): Promise<Role | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  // Get the user role with the role information
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      role:role_id (
        id,
        name,
        description,
        permissions
      )
    `)
    .eq('user_id', user.id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') { // Single row expected but not found
      console.log('No role assigned to user');
      return null;
    }
    console.error('Error fetching user role:', error);
    throw error;
  }
  
  return data?.role as Role;
};

/**
 * Updates the user profile in the database
 */
export const updateUserProfile = async (
  profileData: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'organization_id'>>
): Promise<UserProfile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data as UserProfile;
};

/**
 * Updates the current user's email
 */
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  
  if (error) {
    console.error('Error updating user email:', error);
    throw error;
  }
};

/**
 * Fetches the user's job title from the team_members table
 */
export const getUserJobTitle = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  console.log('Fetching job title for user:', user.id);
  
  // First, check if a record exists for this user
  const { data: checkData, error: checkError } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user.id);
    
  if (checkError) {
    console.error('Error checking team_members table:', checkError);
    throw checkError;
  }
  
  if (!checkData || checkData.length === 0) {
    console.log('No team member record exists for user:', user.id);
    return null;
  }
  
  console.log('Team member record found:', checkData);
  
  // Now fetch the job title
  const { data, error } = await supabase
    .from('team_members')
    .select('job_title')
    .eq('user_id', user.id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') { // Single row expected but not found
      console.log('No team member record found for user');
      return null;
    }
    console.error('Error fetching job title:', error);
    throw error;
  }
  
  console.log('Job title data retrieved:', data);
  
  return data?.job_title || null;
};

/**
 * Updates the user's job title in the team_members table
 */
export const updateUserJobTitle = async (jobTitle: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  // First check if user has a team_member record
  const { data: checkData, error: checkError } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', user.id);
  
  if (checkError) {
    console.error('Error checking for team member record:', checkError);
    throw checkError;
  }
  
  if (!checkData || checkData.length === 0) {
    console.log('No team member record found, cannot update job title');
    throw new Error('No team member record found for this user');
  }
  
  // Update the job title in the team_members table
  const { error } = await supabase
    .from('team_members')
    .update({ 
      job_title: jobTitle,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error updating job title:', error);
    throw error;
  }
  
  console.log('Job title updated successfully');
}; 