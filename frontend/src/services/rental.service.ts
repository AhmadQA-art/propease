import { supabase } from '../lib/supabase';
import { Property } from '../types/rental';

export const rentalService = {
  // Get all rentals for user's organization
  async getRentals(organizationId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units (
          id,
          unit_number,
          floor_plan,
          square_feet,
          bedrooms,
          bathrooms,
          rent_amount,
          status,
          created_at,
          updated_at
        ),
        owner:owner_id (
          id,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Property[];
  },

  // Get rental by ID
  async getRentalById(id: string, organizationId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units (
          id,
          unit_number,
          floor_plan,
          square_feet,
          bedrooms,
          bathrooms,
          rent_amount,
          status,
          created_at,
          updated_at
        ),
        owner:owner_id (
          id,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw new Error(error.message);
    return data as Property;
  },

  // Create new rental
  async createRental(rental: Omit<Property, 'id'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        name: rental.name,
        address: rental.address,
        city: rental.city,
        state: rental.state,
        zip_code: rental.zip_code,
        total_units: rental.total_units,
        owner_id: rental.owner_id,
        organization_id: rental.organization_id
      }])
      .select(`
        *,
        units (
          id,
          unit_number,
          floor_plan,
          square_feet,
          bedrooms,
          bathrooms,
          rent_amount,
          status
        ),
        owner:owner_id (
          id,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .single();

    if (error) throw new Error(error.message);
    return data as Property;
  },

  // Update rental
  async updateRental(id: string, rental: Partial<Property>, organizationId: string) {
    const { data, error } = await supabase
      .from('properties')
      .update(rental)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select(`
        *,
        units (
          id,
          unit_number,
          floor_plan,
          square_feet,
          bedrooms,
          bathrooms,
          rent_amount,
          status
        ),
        owner:owner_id (
          id,
          user:user_id (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .single();

    if (error) throw new Error(error.message);
    return data as Property;
  },

  // Delete rental
  async deleteRental(id: string, organizationId: string) {
    // First delete all associated units
    const { error: unitsError } = await supabase
      .from('units')
      .delete()
      .eq('property_id', id);

    if (unitsError) throw new Error(unitsError.message);

    // Then delete the property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw new Error(error.message);
  }
}; 