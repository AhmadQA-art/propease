import { supabase } from '../supabase/client';
import type { Payment } from '../supabase/types';

export const paymentApi = {
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*');
    
    if (error) throw error;
    return data as Payment[];
  },

  async getPayment(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  async createPayment(payment: Omit<Payment, 'id'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  async updatePayment(id: string, updates: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Payment;
  },

  async getPaymentsByLease(leaseId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId);
    
    if (error) throw error;
    return data as Payment[];
  },
};
