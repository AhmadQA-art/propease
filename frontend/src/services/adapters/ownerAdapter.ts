import { Owner as ApiOwner } from '../api/owners';

// Define the UI Owner type to match what OwnerTable expects
export interface UiOwner {
  id: string;
  user_profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  company_name: string;
  business_type: string;
  status: string;
  created_at: string;
  notes?: string;
  address?: string;
  tax_id?: string;
  property_count?: number;
}

/**
 * Transforms owner data from API format to UI format
 * This function handles both the manual API response format and the auto-generated API format
 * @param apiOwner Owner data from API
 * @returns Owner data in UI format
 */
export const apiToUiOwner = (apiOwner: any): UiOwner => {
  console.log('Converting API owner to UI format:', apiOwner);
  
  if (!apiOwner || typeof apiOwner !== 'object') {
    console.error('Invalid owner data:', apiOwner);
    // Return a placeholder object to avoid errors
    return {
      id: 'unknown-' + Date.now(),
      user_profiles: {
        first_name: 'Unknown',
        last_name: 'Owner',
        email: '',
        phone: '',
      },
      company_name: '',
      business_type: '',
      status: 'inactive',
      created_at: new Date().toISOString(),
    };
  }
  
  // Check if this is coming from the manual API or auto API by inspecting properties
  // Auto API will have direct properties like first_name, while manual might have nested user_profiles
  const isAutoApi = apiOwner.first_name !== undefined || apiOwner.last_name !== undefined || apiOwner.email !== undefined;
  
  if (isAutoApi) {
    // Auto API format - convert from direct properties
    return {
      id: apiOwner.id || `temp-${Date.now()}`,
      user_profiles: {
        first_name: apiOwner.first_name || '',
        last_name: apiOwner.last_name || '',
        email: apiOwner.email || '',
        phone: apiOwner.phone || '',
      },
      company_name: apiOwner.company_name || '',
      business_type: apiOwner.business_type || '',
      status: apiOwner.status || 'active',
      created_at: apiOwner.created_at || new Date().toISOString(),
      notes: apiOwner.notes,
      address: apiOwner.address,
      tax_id: apiOwner.tax_id,
      property_count: apiOwner.property_count || 0,
    };
  } else {
    // Manual API format - handle standard response with nested user_profiles
    const userProfiles = apiOwner.user_profiles || {};
    
    return {
      id: apiOwner.id || `temp-${Date.now()}`,
      user_profiles: {
        first_name: apiOwner.first_name || userProfiles.first_name || '',
        last_name: apiOwner.last_name || userProfiles.last_name || '',
        email: apiOwner.email || userProfiles.email || '',
        phone: apiOwner.phone || userProfiles.phone || '',
      },
      company_name: apiOwner.company_name || '',
      business_type: apiOwner.business_type || '',
      status: apiOwner.status || 'active',
      created_at: apiOwner.created_at || new Date().toISOString(),
      notes: apiOwner.notes,
      address: apiOwner.address,
      tax_id: apiOwner.tax_id,
      property_count: apiOwner.property_count || 0,
    };
  }
};

/**
 * Transforms an array of owners from API format to UI format
 * @param apiOwners Array of owners from API (either format)
 * @returns Array of owners in UI format
 */
export const apiToUiOwners = (apiOwners: any[]): UiOwner[] => {
  console.log(`Converting ${apiOwners.length} API owners to UI format`);
  
  // Check if we have valid data
  if (!Array.isArray(apiOwners)) {
    console.error('Invalid owners data received:', apiOwners);
    return [];
  }
  
  try {
    return apiOwners.map(apiToUiOwner);
  } catch (error) {
    console.error('Error transforming owners data:', error);
    return [];
  }
}; 