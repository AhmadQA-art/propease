import { Vendor } from '../../types/people';

// Define the UI Vendor type to match what VendorTable expects
export interface UiVendor {
  id: string;
  vendor_name: string;
  email: string;
  phone: string;
  service_type: string;
  contact_person_name: string;
  contact_person_email: string;
  created_at: string;
  performance_rating?: number;
  notes?: string;
  payment_terms?: string;
}

/**
 * Transforms vendor data from API format to UI format
 * @param apiVendor Vendor data from API
 * @returns Vendor data in UI format
 */
export const apiToUiVendor = (apiVendor: any): UiVendor => {
  console.log('Converting API vendor to UI format:', apiVendor);
  
  if (!apiVendor || typeof apiVendor !== 'object') {
    console.error('Invalid vendor data:', apiVendor);
    // Return a placeholder object to avoid errors
    return {
      id: 'unknown-' + Date.now(),
      vendor_name: 'Unknown Vendor',
      email: '',
      phone: '',
      service_type: '',
      contact_person_name: '',
      contact_person_email: '',
      created_at: new Date().toISOString(),
      performance_rating: 0
    };
  }
  
  return {
    id: apiVendor.id || `temp-${Date.now()}`,
    vendor_name: apiVendor.vendor_name || '',
    email: apiVendor.email || '',
    phone: apiVendor.phone || '',
    service_type: apiVendor.service_type || '',
    contact_person_name: apiVendor.contact_person_name || '',
    contact_person_email: apiVendor.contact_person_email || '',
    created_at: apiVendor.created_at || new Date().toISOString(),
    performance_rating: apiVendor.performance_rating || 0,
    notes: apiVendor.notes || '',
    payment_terms: apiVendor.payment_terms || ''
  };
};

/**
 * Transforms an array of vendors from API format to UI format
 * @param apiVendors Array of vendors from API
 * @returns Array of vendors in UI format
 */
export const apiToUiVendors = (apiVendors: any[]): UiVendor[] => {
  console.log(`Converting ${apiVendors?.length || 0} API vendors to UI format`);
  
  // Check if we have valid data
  if (!Array.isArray(apiVendors)) {
    console.error('Invalid vendors data received:', apiVendors);
    return [];
  }
  
  try {
    return apiVendors.map(apiToUiVendor);
  } catch (error) {
    console.error('Error transforming vendors data:', error);
    return [];
  }
};

/**
 * Transforms UI vendor data to API format for create/update operations
 * @param uiVendor Vendor data from UI
 * @returns Vendor data in API format
 */
export const uiToApiVendor = (uiVendor: Partial<UiVendor>): any => {
  return {
    vendor_name: uiVendor.vendor_name,
    email: uiVendor.email,
    phone: uiVendor.phone,
    service_type: uiVendor.service_type,
    contact_person_name: uiVendor.contact_person_name,
    contact_person_email: uiVendor.contact_person_email,
    notes: uiVendor.notes,
    payment_terms: uiVendor.payment_terms
  };
};

/**
 * Converts a UiVendor to the unified Person/Vendor interface used by PeopleTable
 * @param uiVendor UI vendor data
 * @returns The vendor in Vendor interface format
 */
export const uiVendorToPerson = (uiVendor: UiVendor): Vendor => {
  return {
    id: uiVendor.id,
    type: 'vendor',
    name: uiVendor.contact_person_name || 'Unknown Contact',
    email: uiVendor.email,
    phone: uiVendor.phone,
    status: 'active', // Vendors don't have status in the database
    createdAt: uiVendor.created_at,
    company_name: uiVendor.vendor_name, // Use vendor_name as company_name
    vendor_name: uiVendor.vendor_name, // Add the vendor_name directly
    contact_person_name: uiVendor.contact_person_name, // Add the contact person name
    contact_person_email: uiVendor.contact_person_email, // Add the contact person email
    service_type: uiVendor.service_type,
    rating: uiVendor.performance_rating || 0,
    lastService: '', // Not in schema, placeholder
    totalServices: 0  // Not in schema, placeholder
  };
}; 