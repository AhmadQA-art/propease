import axios from 'axios';
import { supabase } from '@/services/supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting auth session:', error);
  }
  return config;
});

export const invitationApi = {
  async verifyInvitation(token: string, email: string) {
    try {
      const response = await api.get(`/invite/verify/${token}`, {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying invitation:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  async acceptInvitation(token: string, data: {
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    try {
      const response = await api.post(`/invite/accept/${token}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error accepting invitation:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  async inviteTeamMember(data: {
    email: string;
    jobTitle?: string;
    department?: string;
  }) {
    try {
      const response = await api.post('/invite/team/invite', data);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting team member:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  async inviteTenant(data: {
    email: string;
    name?: string;
    phone?: string;
    language_preference?: string;
    vehicles?: any;
    pets?: any;
    emergency_contact?: any;
  }) {
    try {
      const response = await api.post('/invite/tenant/invite', data);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting tenant:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  async inviteVendor(data: {
    email: string;
    contact_name?: string;
    phone?: string;
    service_type?: string;
    business_type?: string;
    service_areas?: string[];
    service_availability?: any;
    emergency_service?: boolean;
    payment_terms?: string;
    hourly_rate?: number;
  }) {
    try {
      const response = await api.post('/invite/vendor/invite', data);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting vendor:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  async inviteOwner(data: {
    email: string;
    name?: string;
    phone?: string;
    company_name?: string;
    address?: string;
    business_type?: string;
    tax_id?: string;
    payment_schedule?: string;
    payment_method?: string;
    notes?: string;
  }) {
    try {
      const response = await api.post('/invite/owner/invite', data);
      return response.data;
    } catch (error: any) {
      console.error('Error inviting owner:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
}; 