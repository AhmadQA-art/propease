import { PersonType } from '../types/people';
import { supabase } from '../lib/supabase';

export interface CreatePersonData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: PersonType;
  organization_id: string;
  invitation_methods: {
    email: boolean;
    sms: boolean;
  };
  [key: string]: any; // For additional type-specific fields
}

export const peopleService = {
  async createPerson(data: CreatePersonData) {
    // First create the user profile with only the common fields
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        organization_id: data.organization_id,
        status: 'active'
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw new Error('Failed to create user profile');
    }

    // Prepare person-specific data based on type
    let personData: Record<string, any> = {
      user_profile_id: profile.id,
      organization_id: data.organization_id,
    };

    // Add type-specific fields
    switch (data.type) {
      case 'team':
        personData = {
          ...personData,
          department: data.department,
          role: data.role,
          job_title: data.job_title,
          contact_method: data.contact_method
        };
        break;
      case 'tenant':
        personData = {
          ...personData,
          contact_preferences: data.contact_preferences
        };
        break;
      case 'vendor':
        personData = {
          ...personData,
          service_type: data.service_type,
          business_type: data.business_type,
          contact_phone: data.contact_phone,
          notes: data.notes
        };
        break;
      case 'owner':
        personData = {
          ...personData,
          company_name: data.company_name
        };
        break;
    }

    // Insert into the specific person type table
    const { data: person, error: personError } = await supabase
      .from(data.type === 'team' ? 'team_members' :
            data.type === 'tenant' ? 'tenants' :
            data.type === 'vendor' ? 'vendors' : 'owners')
      .insert([personData])
      .select()
      .single();

    if (personError) {
      console.error(`Error creating ${data.type}:`, personError);
      // Cleanup the user profile if person creation fails
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profile.id);
      throw new Error(`Failed to create ${data.type}`);
    }

    return { profile, person };
  },

  async uploadDocuments(personId: string, files: File[]) {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${personId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Create document record in the documents table
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert([{
          person_id: personId,
          file_name: file.name,
          file_path: fileName,
          file_type: fileExt,
          size: file.size,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (docError) {
        console.error('Error creating document record:', docError);
        throw docError;
      }

      return doc;
    });

    return Promise.all(uploadPromises);
  },

  async sendInvitations(personId: string, methods: { email: boolean; sms: boolean }) {
    // Create invitation records
    const { data: invitations, error: inviteError } = await supabase
      .from('invitations')
      .insert(
        Object.entries(methods)
          .filter(([_, isEnabled]) => isEnabled)
          .map(([method]) => ({
            person_id: personId,
            method,
            status: 'pending',
            sent_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
          }))
      )
      .select();

    if (inviteError) {
      console.error('Error creating invitations:', inviteError);
      throw new Error('Failed to create invitations');
    }

    // TODO: Implement actual email/SMS sending logic here
    // This could involve calling a serverless function or external service

    return invitations;
  },
}; 