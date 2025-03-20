import { createHybridService } from './hybrid.service';
import { API_CONFIG } from '@/config/api.config';

// Property type definition
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: 'available' | 'rented' | 'maintenance';
  created_at: string;
  updated_at: string;
  organization_id: string;
}

// Create hybrid service for properties
const { supabaseOperations, customOperations } = createHybridService<Property>('properties');

export const propertyService = {
  // Basic CRUD operations using Supabase
  ...supabaseOperations,

  // Custom operations that require business logic
  async createPropertyWithMetadata(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
    return customOperations.post<Property>('/create-with-metadata', property);
  },

  async updatePropertyWithHistory(id: string, property: Partial<Property>) {
    return customOperations.put<Property>(`/${id}/update-with-history`, property);
  },

  async getPropertiesByOrganization(organizationId: string) {
    return supabaseOperations.list({
      filter: { organization_id: organizationId },
      sort: [{ field: 'created_at', direction: 'desc' }]
    });
  },

  async getAvailableProperties() {
    return supabaseOperations.list({
      filter: { status: 'available' },
      sort: [{ field: 'price', direction: 'asc' }]
    });
  },

  async markPropertyAsRented(id: string) {
    return customOperations.put<Property>(`/${id}/mark-rented`, {
      status: 'rented',
      updated_at: new Date().toISOString()
    });
  },

  async schedulePropertyMaintenance(id: string, maintenanceDetails: {
    description: string;
    scheduled_date: string;
    estimated_cost: number;
  }) {
    return customOperations.post<Property>(`/${id}/schedule-maintenance`, maintenanceDetails);
  }
};

// Export the service
export default propertyService; 