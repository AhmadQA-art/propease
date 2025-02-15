import { supabase } from '../supabase/client';
import type { MaintenanceRequest } from '../supabase/types';

export const maintenanceApi = {
  async getMaintenanceRequests() {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*');
    
    if (error) throw error;
    return data as MaintenanceRequest[];
  },

  async getMaintenanceRequest(id: string) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as MaintenanceRequest;
  },

  async createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data as MaintenanceRequest;
  },

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MaintenanceRequest;
  },

  async deleteMaintenanceRequest(id: string) {
    const { error } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
