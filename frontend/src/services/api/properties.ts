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

  async getPropertiesByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId);
    
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

  async searchProperties(query: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);
    
    if (error) throw error;
    return data as Property[];
  },

  async linkPropertyToOwner(propertyId: string, ownerId: string) {
    const { data, error } = await supabase
      .from('properties')
      .update({ owner_id: ownerId })
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) throw error;
    
    try {
      await supabase
        .from('owner_properties')
        .upsert({ 
          owner_id: ownerId, 
          property_id: propertyId 
        }, { 
          onConflict: 'owner_id,property_id' 
        });
    } catch (error) {
      console.log('Note: owner_properties table might not exist or is not needed');
    }
    
    return data as Property;
  }
};
