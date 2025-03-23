import { supabase } from '../supabase/client';
import type { Owner, Tenant, Vendor, Person, PersonType, TeamMember } from '../../types/people';
import { apiToUiVendors, uiVendorToPerson } from '../adapters/vendorAdapter';
import { apiToUiVendor } from '../adapters/vendorAdapter';

// Pagination parameters interface
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
  filters?: Record<string, any>;
}

// API service for people-related operations
export const peopleApi = {
  // Get all people (combined list with pagination)
  getAllPeople: async (params: PaginationParams = {}): Promise<any> => {
    try {
      // Use Promise.all to fetch data from all three tables in parallel
      const [ownersResponse, tenantsResponse, vendorsResponse] = await Promise.all([
        // Get owners
        supabase
          .from('owners')
          .select('id, first_name, last_name, phone, email, company_name, owner_type, created_at')
          .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' }),
        
        // Get tenants  
        supabase
          .from('tenants')
          .select('id, first_name, last_name, phone, email, created_at, status, preferred_contact_methods')
          .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' }),
        
        // Get vendors - updated to use correct field names  
        supabase
          .from('vendors')
          .select('id, vendor_name, contact_person_name, phone, email, service_type, performance_rating, created_at')
          .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' })
      ]);

      // Check for errors
      if (ownersResponse.error) throw ownersResponse.error;
      if (tenantsResponse.error) throw tenantsResponse.error;
      if (vendorsResponse.error) throw vendorsResponse.error;

      // Transform data to match the Person interface
      const transformedOwners: Person[] = (ownersResponse.data || []).map((owner): Owner => ({
        id: owner.id,
        type: 'owner',
        name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone,
        status: 'active', // Default status since we're not using filters by status
        createdAt: owner.created_at,
        company_name: owner.company_name,
        owner_type: owner.owner_type,
        properties: []
      }));

      const transformedTenants: Person[] = (tenantsResponse.data || []).map((tenant): Tenant => ({
        id: tenant.id,
        type: 'tenant',
        name: `${tenant.first_name} ${tenant.last_name}`,
        email: tenant.email,
        phone: tenant.phone,
        status: (tenant.status as 'active' | 'inactive' | 'pending') || 'active',
        createdAt: tenant.created_at,
        unit: '', // Empty unit reference
        property: '', // Empty property reference
        preferredContactMethods: tenant.preferred_contact_methods,
        rentStatus: 'current' // Default value
      }));

      // Transform vendors data to match the Person interface
      const transformedVendors: Person[] = (vendorsResponse.data || []).map((vendor) => {
        // Use the vendor adapter to convert to UI format first, then to Person format
        const uiVendor = apiToUiVendor(vendor);
        return uiVendorToPerson(uiVendor);
      });

      // Combine all people
      const allPeople = [...transformedOwners, ...transformedTenants, ...transformedVendors];

      // Apply search if provided
      let filteredPeople = allPeople;
      if (params.searchQuery) {
        const query = params.searchQuery.toLowerCase();
        filteredPeople = allPeople.filter(person => 
          person.name.toLowerCase().includes(query) || 
          person.email?.toLowerCase().includes(query) || 
          person.phone?.toLowerCase().includes(query)
        );
      }

      // Apply pagination manually after combining results
      const total = filteredPeople.length;
      let paginatedPeople = filteredPeople;
      
      if (params.page !== undefined && params.pageSize !== undefined) {
        const startIndex = (params.page - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        paginatedPeople = filteredPeople.slice(startIndex, endIndex);
      }

      return {
        data: paginatedPeople,
        total: total,
        totalPages: Math.ceil(total / (params.pageSize || 10))
      };
    } catch (error) {
      console.error('Error fetching all people:', error);
      throw error;
    }
  },

  // Get owners with pagination
  getOwners: async (params: PaginationParams = {}): Promise<any> => {
    try {
      let query = supabase
        .from('owners')
        .select('id, first_name, last_name, phone, email, company_name, owner_type, created_at')
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' });

      // Apply search if provided
      if (params.searchQuery) {
        const searchQuery = params.searchQuery.toLowerCase();
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match the Owner interface
      const owners = data.map((owner): Owner => ({
        id: owner.id,
        type: 'owner',
        name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone,
        status: 'active', // Default status since actual schema has status
        createdAt: owner.created_at,
        company_name: owner.company_name,
        owner_type: owner.owner_type,
        properties: [] // Empty array since properties are in a separate table
      }));

      return {
        data: owners,
        total: count || 0,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0
      };
    } catch (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }
  },

  // Get tenants with pagination
  getTenants: async (params: PaginationParams = {}): Promise<any> => {
    try {
      console.log('Fetching tenants, params:', {
        page: params.page,
        pageSize: params.pageSize,
        searchQuery: params.searchQuery
      });
      
      // First get all tenants
      let query = supabase
        .from('tenants')
        .select(`
          id, 
          first_name, 
          last_name, 
          phone, 
          email, 
          created_at, 
          status, 
          preferred_contact_methods,
          leases(
            id,
            start_date,
            end_date,
            rent_amount,
            status,
            unit_id,
            units(
              id,
              unit_number,
              property_id,
              properties(
                id,
                name
              )
            )
          )
        `, { count: 'exact' })
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' });

      // Apply search if provided
      if (params.searchQuery) {
        const searchQuery = params.searchQuery.toLowerCase();
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Apply status filter
      if (params.filters?.status && params.filters.status.length > 0) {
        query = query.in('status', params.filters.status);
      }

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      // Log the count and pagination details
      console.log('Tenants fetch results:', {
        count,
        tenantsReturned: data?.length || 0,
        pageSize: params.pageSize || 10,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0,
        currentPage: params.page || 1
      });

      if (error) throw error;

      // Transform data to match the Tenant interface
      const tenants = data.map((tenant): Tenant => {
        // Find active lease
        const tenantLeases = tenant.leases || [];
        const activeLease = tenantLeases.length > 0 
          ? tenantLeases.find((lease: any) => lease.status === 'Active') || tenantLeases[0]
          : null;
        
        // Extract lease information if available
        let leaseInfo = null;
        if (activeLease) {
          // Use type assertions to handle complex nested objects
          const unit = activeLease.units as Record<string, any> || {};
          const property = unit.properties as Record<string, any> || {};
          
          leaseInfo = {
            id: activeLease.id,
            unitName: unit.unit_number || 'Unknown Unit',
            property: property.name || 'Unknown Property',
            rentAmount: activeLease.rent_amount,
            startDate: activeLease.start_date,
            endDate: activeLease.end_date,
            status: activeLease.status
          };
        }

        return {
          id: tenant.id,
          type: 'tenant',
          name: `${tenant.first_name} ${tenant.last_name}`,
          email: tenant.email,
          phone: tenant.phone,
          status: (tenant.status as 'active' | 'inactive' | 'pending') || 'active',
          createdAt: tenant.created_at,
          preferredContactMethods: tenant.preferred_contact_methods,
          rentStatus: 'current', // Default value
          lease: leaseInfo
        };
      });

      return {
        data: tenants,
        total: count || 0,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0
      };
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Get detailed information for a single tenant, including lease and documents
  getTenantDetails: async (tenantId: string): Promise<any> => {
    try {
      // First, get the tenant's basic information
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          id,
          first_name,
          last_name,
          phone,
          email,
          status,
          created_at
        `)
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;
      if (!tenant) throw new Error('Tenant not found');

      // Next, get the tenant's active lease information
      const { data: leases, error: leaseError } = await supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          rent_amount,
          status,
          unit_id,
          units(
            id,
            unit_number,
            property_id,
            properties(
              id,
              name
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .order('start_date', { ascending: false });

      if (leaseError) throw leaseError;

      // Find the most recent active lease
      const activeLease = leases?.length > 0 
        ? leases.find((lease: any) => lease.status === 'Active') || leases[0]
        : null;

      // Get tenant documents using correct field names and relationship
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select(`
          id,
          document_name,
          document_url,
          created_at,
          document_type
        `)
        .eq('related_to_id', tenantId)
        .eq('related_to_type', 'tenant')
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      // Format lease data if available
      let leaseInfo = null;
      if (activeLease) {
        // Use type assertions for nested objects
        const unit = activeLease.units as Record<string, any> || {};
        const property = unit.properties as Record<string, any> || {};
        
        leaseInfo = {
          id: activeLease.id,
          unitName: unit.unit_number || 'Unknown Unit',
          property: property.name || 'Unknown Property',
          rentAmount: activeLease.rent_amount,
          startDate: activeLease.start_date,
          endDate: activeLease.end_date,
          status: activeLease.status
        };
      }

      // Format documents with correct field mappings
      const formattedDocuments = documents?.map((doc: any) => ({
        id: doc.id,
        name: doc.document_name || `Document ${doc.document_type || ''}`,
        date: doc.created_at,
        url: doc.document_url || '#'
      })) || [];

      // Return the complete tenant details
      return {
        id: tenant.id,
        name: `${tenant.first_name} ${tenant.last_name}`,
        email: tenant.email,
        phone: tenant.phone,
        imageUrl: null, // No image in this API
        lease: leaseInfo,
        documents: formattedDocuments
      };
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      throw error;
    }
  },

  // Get vendors with pagination
  getVendors: async (params: PaginationParams = {}): Promise<any> => {
    try {
      console.log('Fetching vendors, params:', {
        page: params.page,
        pageSize: params.pageSize,
        searchQuery: params.searchQuery
      });
      
      // First get all vendors
      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' });

      // Apply search if provided
      if (params.searchQuery) {
        const searchQuery = params.searchQuery.toLowerCase();
        query = query.or(`vendor_name.ilike.%${searchQuery}%,contact_person_name.ilike.%${searchQuery}%,contact_person_email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Apply status filter
      if (params.filters?.status && params.filters.status.length > 0) {
        query = query.in('status', params.filters.status);
      }

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      // Log the count and pagination details
      console.log('Vendors fetch results:', {
        count,
        vendorsReturned: data?.length || 0,
        pageSize: params.pageSize || 10,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0,
        currentPage: params.page || 1
      });

      if (error) throw error;

      // First transform to UiVendor format
      const uiVendors = apiToUiVendors(data);
      
      // Then transform to Person/Vendor interface for use in PeopleTable
      const vendors = uiVendors.map(uiVendorToPerson);

      return {
        data: vendors,
        total: count || 0,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  // Get team members with pagination
  getTeamMembers: async (params: PaginationParams = {}): Promise<any> => {
    try {
      let query = supabase
        .from('team_members')
        .select(`
          id, 
          job_title, 
          department, 
          created_at, 
          updated_at, 
          user_profiles:user_id (
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            status
          ),
          roles:role_id (
            id,
            name
          )
        `)
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' });

      // Apply search if provided
      if (params.searchQuery) {
        const searchQuery = params.searchQuery.toLowerCase();
        query = query.or(`user_profiles.first_name.ilike.%${searchQuery}%,user_profiles.last_name.ilike.%${searchQuery}%,user_profiles.phone.ilike.%${searchQuery}%,user_profiles.email.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match the TeamMember interface
      const teamMembers = data.map((member: any): TeamMember => {
        const userProfile = member.user_profiles;
        const role = member.roles;
        
        return {
          id: member.id,
          type: 'team',
          name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '',
          email: userProfile?.email,
          phone: userProfile?.phone,
          status: (userProfile?.status as 'active' | 'inactive' | 'pending') || 'active',
          createdAt: member.created_at,
          role: role?.name || member.job_title,
          department: member.department,
          imageUrl: null // Add image URL if available
        };
      });

      return {
        data: teamMembers,
        total: count || 0,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0
      };
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  // Create a new owner
  createOwner: async (ownerData: Partial<Owner>): Promise<Owner> => {
    try {
      // Ensure we have the required fields
      if (!ownerData.firstName || !ownerData.lastName) {
        throw new Error('First name and last name are required');
      }

      // Convert to database structure
      const dbData = {
        first_name: ownerData.firstName,
        last_name: ownerData.lastName,
        email: ownerData.email,
        phone: ownerData.phone,
        company_name: ownerData.company_name,
        organization_id: '00000000-0000-0000-0000-000000000000' // Default organization ID for demo
      };

      const { data, error } = await supabase
        .from('owners')
        .insert(dbData)
        .select('*')
        .single();

      if (error) throw error;

      // Return the owner with our frontend structure
      return {
        id: data.id,
        type: 'owner',
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        status: 'active', // Default status
        createdAt: data.created_at,
        company_name: data.company_name,
        properties: [] // Properties would need a separate insert into owner_properties
      };
    } catch (error) {
      console.error('Error creating owner:', error);
      throw error;
    }
  },

  // Create a new tenant
  createTenant: async (tenantData: Partial<Tenant>): Promise<Tenant> => {
    try {
      // Ensure we have the required fields
      if (!tenantData.firstName || !tenantData.lastName) {
        throw new Error('First name and last name are required');
      }

      // Check for organization_id
      if (!tenantData.organization_id) {
        console.error('Organization ID is missing in tenant creation data');
        throw new Error('Organization ID is required. Please make sure you are logged in with proper permissions.');
      }

      console.log('Using organization ID for tenant creation:', tenantData.organization_id);

      // Convert to database structure
      const dbData: Record<string, any> = {
        first_name: tenantData.firstName,
        last_name: tenantData.lastName,
        email: tenantData.email,
        phone: tenantData.phone,
        status: tenantData.status || 'active',
        organization_id: tenantData.organization_id,
        preferred_contact_methods: tenantData.preferredContactMethods || null
      };
      
      // NOTE: Removed lease fields as they no longer exist in the schema
      console.log('Tenant data for database insertion:', dbData);

      const { data, error } = await supabase
        .from('tenants')
        .insert(dbData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating tenant:', error);
        
        // Provide more helpful error messages for common issues
        if (error.message && error.message.includes('foreign key constraint')) {
          throw new Error('Failed to create tenant: Foreign key constraint violated. Please contact support.');
        } else {
          throw new Error(error.message || 'Failed to create tenant');
        }
      }

      // Return the tenant with our frontend structure
      return {
        id: data.id,
        type: 'tenant',
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        status: (data.status as 'active' | 'inactive' | 'pending') || 'active',
        createdAt: data.created_at,
        unit: '', // Empty unit reference
        property: tenantData.property || '', // Property is not stored directly in tenants table
        preferredContactMethods: data.preferred_contact_methods,
        rentStatus: 'current' // Default value
      };
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  // Create a new vendor
  createVendor: async (data: any): Promise<any> => {
    try {
      // Log the data being received
      console.log('Creating vendor with data:', data);

      // Check for required fields
      if (!data.vendor_name) {
        throw new Error('Vendor name is required');
      }

      // Check for organization_id
      if (!data.organization_id) {
        console.error('Organization ID is missing in vendor creation data');
        throw new Error('Organization ID is required. Please make sure you are logged in with proper permissions.');
      }

      console.log('Using organization ID for vendor creation:', data.organization_id);

      // Create the vendor data object
      const vendorData = {
        vendor_name: data.vendor_name,
        service_type: data.service_type || null,
        email: data.email || null,
        phone: data.phone || null,
        payment_terms: data.payment_terms || null,
        notes: data.notes || null,
        contact_person_name: data.contact_person_name || null,
        contact_person_email: data.contact_person_email || null,
        organization_id: data.organization_id, // No default - must be provided
        user_id: data.user_id || null, // Will be populated from the auth token if available
      };

      // Insert the new vendor into the database
      const { data: newVendor, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        
        // Provide more helpful error messages for common issues
        if (error.message.includes('foreign key constraint')) {
          throw new Error('Failed to create vendor: Invalid organization ID provided. Please contact support.');
        } else {
          throw new Error(error.message || 'Failed to create vendor');
        }
      }

      console.log('Vendor created successfully:', newVendor);
      return newVendor;
    } catch (error: any) {
      console.error('Error in createVendor:', error);
      throw error;
    }
  },

  // Update a person's data
  updatePerson: async (id: string, type: PersonType, data: Partial<Person>): Promise<Person> => {
    try {
      console.log(`Updating ${type} with ID ${id}:`, data);

      // Handle each person type separately due to schema differences
      switch (type) {
        case 'owner': {
          const ownerData = data as Partial<Owner>;
          const updateData: Record<string, any> = {};
          
          // Basic person fields
          if (data.name) {
            const nameParts = data.name.split(' ');
            updateData.first_name = nameParts[0];
            updateData.last_name = nameParts.slice(1).join(' ');
          }
          if (data.email) updateData.email = data.email;
          if (data.phone) updateData.phone = data.phone;
          if (data.status) updateData.status = data.status;
          
          // Owner-specific fields
          if (ownerData.company_name) updateData.company_name = ownerData.company_name;
          
          // Update owner in database
          const { data: updatedData, error } = await supabase
            .from('owners')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
            
          if (error) throw error;
          
          return {
            id: updatedData.id,
            type: 'owner',
            name: `${updatedData.first_name} ${updatedData.last_name}`,
            email: updatedData.email,
            phone: updatedData.phone,
            status: (updatedData.status as 'active' | 'inactive' | 'pending') || 'active',
            createdAt: updatedData.created_at,
            company_name: updatedData.company_name,
            properties: [] // Properties would need a separate fetch
          };
        }
        
        case 'tenant': {
          const tenantData = data as Partial<Tenant>;
          const updateData: Record<string, any> = {};
          
          // Basic person fields
          if (data.name) {
            const nameParts = data.name.split(' ');
            updateData.first_name = nameParts[0];
            updateData.last_name = nameParts.slice(1).join(' ');
          }
          if (data.email) updateData.email = data.email;
          if (data.phone) updateData.phone = data.phone;
          if (data.status) updateData.status = data.status;
          
          // Tenant-specific fields - removed lease fields
          if (tenantData.preferredContactMethods) updateData.preferred_contact_methods = tenantData.preferredContactMethods;
          
          // Update tenant in database
          const { data: updatedData, error } = await supabase
            .from('tenants')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
            
          if (error) throw error;
          
          return {
            id: updatedData.id,
            type: 'tenant',
            name: `${updatedData.first_name} ${updatedData.last_name}`,
            email: updatedData.email,
            phone: updatedData.phone,
            status: (updatedData.status as 'active' | 'inactive' | 'pending') || 'active',
            createdAt: updatedData.created_at,
            unit: '', // Empty unit reference
            property: '', // Empty property reference
            preferredContactMethods: updatedData.preferred_contact_methods,
            rentStatus: 'current' // Default value
          };
        }
        
        case 'vendor': {
          const vendorData = data as Partial<Vendor>;
          
          // Prepare vendor data object with fields from the vendor schema
          const updateData: Record<string, any> = {};
          
          // Map relevant fields from the input data to the vendor schema
          updateData.vendor_name = vendorData.name || vendorData.vendor_name || vendorData.company_name;
          updateData.email = vendorData.email;
          updateData.phone = vendorData.phone;
          
          // Vendor-specific fields
          if (vendorData.service_type) updateData.service_type = vendorData.service_type;
          if (vendorData.contact_person_name) updateData.contact_person_name = vendorData.contact_person_name;
          if (vendorData.contact_person_email) updateData.contact_person_email = vendorData.contact_person_email;
          if (vendorData.notes) updateData.notes = vendorData.notes;
          if (vendorData.payment_terms) updateData.payment_terms = vendorData.payment_terms;
          if (vendorData.performance_rating) updateData.performance_rating = vendorData.performance_rating;
          
          // Only update if there are fields to update
          if (Object.keys(updateData).length === 0) {
            throw new Error('No valid update fields provided');
          }

          // Update vendor in database
          const { data: updatedData, error } = await supabase
            .from('vendors')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

          if (error) throw error;

          // Convert to UI format through the adapter
          const uiVendor = apiToUiVendor(updatedData);
          return uiVendorToPerson(uiVendor);
        }
        
        case 'team': {
          const teamData = data as Partial<TeamMember>;
          const updateData: Record<string, any> = {};
          
          // Basic person fields
          if (data.name) {
            const nameParts = data.name.split(' ');
            updateData.first_name = nameParts[0];
            updateData.last_name = nameParts.slice(1).join(' ');
          }
          if (data.email) updateData.email = data.email;
          if (data.phone) updateData.phone = data.phone;
          if (data.status) updateData.status = data.status;
          
          // Team-specific fields
          if (teamData.role) updateData.role = teamData.role;
          if (teamData.department) updateData.department = teamData.department;
          
          // Update team member in database
          const { data: updatedData, error } = await supabase
            .from('team_members')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
            
          if (error) throw error;
          
          return {
            id: updatedData.id,
            type: 'team',
            name: `${updatedData.first_name} ${updatedData.last_name}`,
            email: updatedData.email,
            phone: updatedData.phone,
            status: (updatedData.status as 'active' | 'inactive' | 'pending') || 'active',
            createdAt: updatedData.created_at,
            role: updatedData.role,
            department: updatedData.department
          };
        }
        
        default:
          throw new Error(`Unsupported person type: ${type}`);
      }
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  },

  // Delete a person
  deletePerson: async (id: string, personType: PersonType): Promise<void> => {
    try {
      let table: string;

      // Determine table based on person type
      switch (personType) {
        case 'owner':
          table = 'owners';
          break;
        case 'tenant':
          table = 'tenants';
          break;
        case 'vendor':
          table = 'vendors';
          break;
        default:
          throw new Error(`Unsupported person type: ${personType}`);
      }

      // Delete the record
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${personType}:`, error);
      throw error;
    }
  },

  // Bulk delete people
  bulkDelete: async (ids: string[], personType: PersonType): Promise<void> => {
    try {
      let table: string;

      // Determine table based on person type
      switch (personType) {
        case 'owner':
          table = 'owners';
          break;
        case 'tenant':
          table = 'tenants';
          break;
        case 'vendor':
          table = 'vendors';
          break;
        default:
          throw new Error(`Unsupported person type: ${personType}`);
      }

      // Delete the records
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error(`Error bulk deleting ${personType}:`, error);
      throw error;
    }
  },

  // Get owners with their properties
  getOwnersWithProperties: async (params: PaginationParams = {}): Promise<any> => {
    try {
      console.log('Fetching owners with properties, params:', {
        page: params.page,
        pageSize: params.pageSize,
        searchQuery: params.searchQuery,
        ownerTypes: params.filters?.ownerTypes
      });

      // First get all owners
      let ownersQuery = supabase
        .from('owners')
        .select('id, first_name, last_name, phone, email, company_name, owner_type, created_at', { count: 'exact' })
        .order(params.sortBy || 'created_at', { ascending: params.sortOrder !== 'desc' });

      // Apply search if provided
      if (params.searchQuery) {
        const searchQuery = params.searchQuery.toLowerCase();
        ownersQuery = ownersQuery.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      // Apply owner type filters if provided
      if (params.filters?.ownerTypes && params.filters.ownerTypes.length > 0) {
        ownersQuery = ownersQuery.in('owner_type', params.filters.ownerTypes);
      }

      // Apply pagination
      if (params.page !== undefined && params.pageSize !== undefined) {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        ownersQuery = ownersQuery.range(from, to);
      }

      const { data: ownersData, error: ownersError, count } = await ownersQuery;

      // Log the count and pagination details
      console.log('Owners fetch results:', {
        count,
        ownersReturned: ownersData?.length || 0,
        pageSize: params.pageSize || 10,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0,
        currentPage: params.page || 1
      });

      if (ownersError) throw ownersError;
      
      // Now get the properties for each owner
      const ownerIds = ownersData.map(owner => owner.id);
      
      // Query owner_properties join with properties to get property data
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('owner_properties')
        .select(`
          owner_id,
          property_id,
          properties(id, name)
        `)
        .in('owner_id', ownerIds);
      
      if (propertiesError) throw propertiesError;
      
      // Debug the first item to understand the structure
      if (propertiesData && propertiesData.length > 0) {
        console.log('Example property data item:', propertiesData[0]);
      }
      
      // Create a map of owner ID to properties
      const ownerPropertiesMap: Record<string, Array<{id: string, name: string}>> = {};
      
      // Initialize empty arrays for each owner
      ownerIds.forEach(id => {
        ownerPropertiesMap[id] = [];
      });
      
      // Add properties to each owner when available
      if (propertiesData) {
        for (const item of propertiesData) {
          const ownerId = item.owner_id;
          const propertyId = item.property_id;
          
          // Skip if owner ID is missing
          if (!ownerId || !ownerPropertiesMap[ownerId]) continue;
          
          // Use the property_id as fallback
          let propertyName = 'Unknown Property';
          
          // Try to access property data - handle as a record with any structure
          if (item.properties) {
            // Using type assertion to handle various possible structures
            const propData = item.properties as any;
            if (typeof propData === 'object' && propData.name) {
              propertyName = propData.name;
            }
          }
          
          // Create a property entry
          ownerPropertiesMap[ownerId].push({
            id: propertyId || '',
            name: propertyName
          });
        }
      }
      
      // Transform data to match the Owner interface
      const owners = ownersData.map((owner): Owner => ({
        id: owner.id,
        type: 'owner',
        name: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        phone: owner.phone,
        status: 'active', // Default status
        createdAt: owner.created_at,
        company_name: owner.company_name,
        owner_type: owner.owner_type,
        properties: ownerPropertiesMap[owner.id] || [] // Add the properties for this owner
      }));

      return {
        data: owners,
        total: count || 0,
        totalPages: count ? Math.ceil(count / (params.pageSize || 10)) : 0
      };
    } catch (error) {
      console.error('Error fetching owners with properties:', error);
      throw error;
    }
  }
}; 