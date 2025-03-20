import { supabase } from '../lib/supabase';
import { Property, Unit } from '../types/rental';

// Define CustomUnit interface to match AddRentalForm
interface CustomUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id?: string;
}

// Extend Property type to include property_type
interface ExtendedProperty extends Property {
  property_type?: 'residential' | 'commercial';
}

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
          area,
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
          area,
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

  // Create new rental with units
  async createRental(propertyData: Omit<ExtendedProperty, 'id'>, units: Omit<CustomUnit, 'id' | 'property_id'>[]) {
    // Begin a Supabase transaction by starting with the property creation
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert([{
        name: propertyData.name,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zip_code: propertyData.zip_code,
        total_units: propertyData.total_units,
        owner_id: propertyData.owner_id,
        organization_id: propertyData.organization_id,
        status: 'active',
        property_type: propertyData.property_type // Add property type if available
      }])
      .select()
      .single();

    if (propertyError) throw new Error(`Error creating property: ${propertyError.message}`);

    // If we have units to add, create them with the new property ID
    if (units && units.length > 0) {
      const unitsWithPropertyId = units.map(unit => ({
        ...unit,
        property_id: property.id,
      }));

      const { error: unitsError } = await supabase
        .from('units')
        .insert(unitsWithPropertyId);

      if (unitsError) {
        // If there's an error with the units, we should clean up by deleting the property
        await supabase.from('properties').delete().match({ id: property.id });
        throw new Error(`Error creating units: ${unitsError.message}`);
      }
    }

    return property;
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
          area,
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

  // Add units to a property
  async addUnitsToProperty(propertyId: string, units: Omit<Unit, 'id' | 'property_id'>[], organizationId: string) {
    // First, get the property to ensure it exists and belongs to the organization
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('organization_id', organizationId)
      .single();

    if (propertyError) throw new Error(`Property not found: ${propertyError.message}`);

    // Then add the units
    const unitsWithPropertyId = units.map(unit => ({
      ...unit,
      property_id: propertyId,
      organization_id: organizationId
    }));

    const { data, error } = await supabase
      .from('units')
      .insert(unitsWithPropertyId)
      .select();

    if (error) throw new Error(`Error adding units: ${error.message}`);
    return data as Unit[];
  },

  // Update unit
  async updateUnit(unitId: string, unitData: Partial<Unit>, organizationId: string) {
    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unitId)
      .eq('organization_id', organizationId)
      .select();

    if (error) throw new Error(`Error updating unit: ${error.message}`);
    return data[0] as Unit;
  },

  // Delete unit
  async deleteUnit(unitId: string, organizationId: string) {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId)
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Error deleting unit: ${error.message}`);
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
  },
  
  // Get all owners for an organization
  async getOwners(organizationId: string) {
    const { data, error } = await supabase
      .from('owners')
      .select(`
        id,
        first_name,
        last_name,
        email,
        company_name
      `)
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Error fetching owners: ${error.message}`);
    return data.map(owner => ({
      id: owner.id,
      name: owner.company_name || `${owner.first_name} ${owner.last_name}`,
      email: owner.email
    }));
  },
  
  // Get all property managers for an organization
  async getPropertyManagers(organizationId: string) {
    try {
      // Fetch all user profiles that belong to this organization and have a team_member record
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          team_members:team_members(id)
        `)
        .eq('organization_id', organizationId)
        .not('team_members', 'is', null);

      if (error) throw new Error(`Error fetching property managers: ${error.message}`);
      
      if (!data) return [];
      
      // Transform the data into the expected format
      return data.map(user => ({
        id: user.team_members[0]?.id || user.id, // Use team_member id if available, otherwise use user id
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || ''
      }));
    } catch (error) {
      console.error("Error in getPropertyManagers:", error);
      throw error;
    }
  }
}; 