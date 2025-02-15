import { supabase } from '../supabase/client';
import type { Property } from '../supabase/types';

export const propertyApi = {
  async getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*');
    
    if (error) throw error;
    return data as Property[];
  },

  async getProperty(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  async createProperty(property: Omit<Property, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  async updateProperty(id: string, updates: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  async deleteProperty(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
