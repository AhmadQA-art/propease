import { supabase } from '../supabase/client';
import type { Lease } from '../supabase/types';

export const leaseApi = {
  async getLeases() {
    const { data, error } = await supabase
      .from('leases')
      .select('*');
    
    if (error) throw error;
    return data as Lease[];
  },

  async getLease(id: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Lease;
  },

  async createLease(lease: Omit<Lease, 'id'>) {
    const { data, error } = await supabase
      .from('leases')
      .insert(lease)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lease;
  },

  async updateLease(id: string, updates: Partial<Lease>) {
    const { data, error } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lease;
  },

  async getLeasesByProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('property_id', propertyId);
    
    if (error) throw error;
    return data as Lease[];
  },

  async getLeasesByTenant(tenantId: string) {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data as Lease[];
  },
};
