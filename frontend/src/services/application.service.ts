import { supabase, supabaseAdmin, getSupabaseClient } from '../lib/supabase';

// Define interfaces for the application service
export interface RentalApplication {
  id?: string;
  property_id: string;
  unit_id: string;
  application_date?: string;
  desired_move_in_date: string;
  lease_term: number; // in months
  monthly_income?: number;
  status?: 'pending' | 'approved' | 'rejected';
  background_check_status?: 'pending' | 'passed' | 'failed';
  credit_check_status?: 'pending' | 'approved' | 'rejected';
  has_pets: boolean;
  has_vehicles: boolean;
  is_employed: boolean;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  notes?: string;
  id_type: 'passport' | 'qid' | 'driving_license';
  applicant_id: number;
  applicant_name: string;
  applicant_email?: string;
  applicant_phone_number?: string;
  preferred_contact_method?: string[];
  organization_id: string;
  
  // Additional fields from database schema
  previous_address?: string;
  vehicle_details?: Record<string, any>;
  pet_details?: Record<string, any>;
  application_fee_paid?: boolean;
  employment_info?: Record<string, any>;
  rejection_reason?: string;
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  
  // Joined fields through select query
  unit?: {
    id: string;
    unit_number: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    floor_plan?: string;
  };
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  documents?: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    uploaded_at: string;
  }[];
}

export interface ApplicationDocument {
  id?: string;
  rental_application_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at?: string;
  uploaded_by?: string;
}

export const applicationService = {
  // Debug helper
  async checkAuth() {
    try {
      // Check if we have the service role key
      const hasServiceRole = !!supabaseAdmin;
      
      // Check current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Test a simple query with regular client
      const { data: testData, error: testError } = await supabase
        .from('rental_applications')
        .select('id')
        .limit(1);
      
      // Test listing files in the storage bucket instead of checking bucket existence
      const { data: filesData, error: filesError } = await supabase.storage
        .from('rental-application-docs')
        .list('', { limit: 1 });
      
      // Return debug information
      return {
        hasServiceRole,
        session: sessionData?.session ? {
          user: sessionData.session.user.email,
          role: sessionData.session.user.role,
        } : null,
        testQuery: {
          success: !testError,
          error: testError ? testError.message : null,
        },
        storageCheck: {
          success: !filesError,
          error: filesError ? filesError.message : null,
          message: filesError ? 'Storage bucket access failed' : 'Storage bucket access successful',
          data: filesData ? `Found ${filesData.length} file(s)` : null
        }
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  },

  // Create a new rental application
  async createApplication(applicationData: Omit<RentalApplication, 'id' | 'application_date' | 'status'>) {
    try {
      // Insert the new application
      const { data, error } = await supabase
        .from('rental_applications')
        .insert([{
          ...applicationData,
          application_date: new Date().toISOString(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check RLS policies.');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createApplication:', error);
      throw error;
    }
  },

  // Get all applications for a property
  async getPropertyApplications(propertyId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('rental_applications')
      .select(`
        *,
        unit:unit_id (
          id,
          unit_number
        )
      `)
      .eq('property_id', propertyId)
      .eq('organization_id', organizationId)
      .order('application_date', { ascending: false });

    if (error) throw new Error(`Error fetching applications: ${error.message}`);
    return data;
  },

  // Get application by ID
  async getApplicationById(applicationId: string, organizationId: string) {
    const { data, error } = await supabase
      .from('rental_applications')
      .select(`
        *,
        property:property_id (
          id,
          name,
          address,
          city,
          state
        ),
        unit:unit_id (
          id,
          unit_number,
          floor_plan,
          area,
          bedrooms,
          bathrooms,
          rent_amount
        ),
        documents:rental_application_documents (
          id,
          file_name,
          file_path,
          file_type,
          uploaded_at
        )
      `)
      .eq('id', applicationId)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw new Error(`Error fetching application: ${error.message}`);
    return data;
  },

  // Update application status
  async updateApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'approved' | 'rejected', 
    organizationId: string,
    additionalData?: Record<string, any>
  ) {
    const { data, error } = await supabase
      .from('rental_applications')
      .update({ 
        status,
        ...(additionalData || {}) // Spread additional data if provided
      })
      .eq('id', applicationId)
      .eq('organization_id', organizationId)
      .select();

    if (error) throw new Error(`Error updating application status: ${error.message}`);
    return data[0] as RentalApplication;
  },

  // Upload application document
  async uploadApplicationDocument(
    applicationId: string,
    file: File,
    documentType: string,
    organizationId: string
  ) {
    try {
      // First, get the current user's ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication error: No valid session found');
      }
      
      const userId = session.user.id;
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      // First upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `rental-application-docs/${organizationId}/${applicationId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Use supabaseAdmin client if available, otherwise fall back to regular client
      const client = getSupabaseClient(true);
      
      const { error: uploadError, data: uploadData } = await client.storage
        .from('rental-application-docs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        if (uploadError.message.includes('403')) {
          throw new Error('Permission denied. Please check storage bucket policies or service role key configuration.');
        }
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = client.storage
        .from('rental-application-docs')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get document URL');
      }
      
      // Create a record in the database - IMPORTANT: Use userId instead of organizationId for uploaded_by
      const { data, error } = await client
        .from('rental_application_documents')
        .insert([
          {
            rental_application_id: applicationId,
            file_name: file.name,
            file_path: urlData.publicUrl,
            file_type: documentType,
            uploaded_by: userId // Using the user ID instead of organization ID
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Database insert error:', error);
        if (error.code === '23503') {
          throw new Error(`Foreign key violation: ${error.details}`);
        }
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check RLS policies.');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  // Upload multiple application documents
  async uploadMultipleDocuments(
    applicationId: string,
    files: File[],
    documentType: string,
    organizationId: string
  ) {
    try {
      const results = [];
      const errors = [];
      let processedCount = 0;
      
      // Process each file sequentially
      for (const file of files) {
        try {
          console.log(`Processing file ${processedCount + 1}/${files.length}: ${file.name}`);
          
          const result = await this.uploadApplicationDocument(
            applicationId,
            file,
            documentType,
            organizationId
          );
          
          results.push(result);
          processedCount++;
          
          console.log(`Successfully uploaded ${processedCount}/${files.length} files`);
        } catch (error) {
          // Extract meaningful error message
          let errorMessage = '';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }
          
          console.error(`Error uploading file ${file.name}:`, error);
          errors.push({
            fileName: file.name,
            error: errorMessage
          });
        }
      }
      
      return {
        results,
        errors,
        totalUploaded: results.length,
        totalFailed: errors.length,
        allSuccessful: errors.length === 0
      };
    } catch (error) {
      console.error('Error in batch document upload:', error);
      throw new Error(`Failed to upload documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // Delete application document
  async deleteApplicationDocument(documentId: string, organizationId: string) {
    // First get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from('rental_application_documents')
      .select('*')
      .eq('id', documentId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) throw new Error(`Error fetching document: ${fetchError.message}`);

    // Extract file path from URL
    const url = new URL(document.file_path);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('rental-application-docs')
      .remove([filePath]);

    if (storageError) throw new Error(`Error deleting file: ${storageError.message}`);

    // Delete from database
    const { error } = await supabase
      .from('rental_application_documents')
      .delete()
      .eq('id', documentId)
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Error deleting document record: ${error.message}`);
    
    return true;
  }
}; 