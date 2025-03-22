import { api } from './client';

export interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  owner_type: string;
  business_type?: string;
  status: string;
  created_at: string;
}

export interface OwnerFilters {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOwnerData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  owner_type: string;
  business_type?: string;
  notes?: string;
}

export const ownersApi = {
  getOwners: async (filters: OwnerFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchQuery) params.append('search', filters.searchQuery);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/owners?${params.toString()}`);
    return response.data;
  },

  getOwnerById: async (id: string): Promise<Owner> => {
    const response = await api.get(`/owners/${id}`);
    return response.data;
  },

  createOwner: async (data: CreateOwnerData): Promise<Owner> => {
    const response = await api.post('/owners', data);
    return response.data;
  },

  updateOwner: async (id: string, data: Partial<CreateOwnerData>): Promise<Owner> => {
    const response = await api.put(`/owners/${id}`, data);
    return response.data;
  },

  deleteOwner: async (id: string): Promise<void> => {
    await api.delete(`/owners/${id}`);
  }
}; 
