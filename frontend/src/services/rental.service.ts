import { supabase } from '../lib/supabase';
import { Property, Unit } from '../types/rental';

// Define CustomUnit interface to match AddRentalForm
interface CustomUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // Correctly uses area
  status: 'vacant' | 'occupied' | 'deleted';
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id?: string;
}

// Extend Property type to include property_type
interface ExtendedProperty extends Omit<Property, 'property_type'> {
  property_type: 'residential' | 'commercial';
}

const updateUnit = async (
  unitId: string,
  unitData: Omit<Unit, 'id' | 'property_id'>,
  organizationId: string
): Promise<Unit> => {
  try {
    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unitId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw new Error(`Error updating unit: ${error.message}`);
    if (!data) throw new Error('Unit not found');

    return data;
  } catch (error) {
    console.error('Error in updateUnit:', error);
    throw error;
  }
};

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
        organization_id: propertyData.organization_id
      }));
  
      const { error: unitsError } = await supabase
        .from('units')
        .insert(unitsWithPropertyId);
  
      if (unitsError) {
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
    try {
      // First, get the property to ensure it exists and belongs to the organization
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('organization_id', organizationId)
        .single();

      if (propertyError) throw new Error(`Property not found: ${propertyError.message}`);

      // If no units to add, return early
      if (!units || units.length === 0) {
        return [];
      }

      // Get existing unit numbers for this property (including deleted ones)
      const { data: allExistingUnits, error: existingUnitsError } = await supabase
        .from('units')
        .select('id, unit_number, status')
        .eq('property_id', propertyId);

      if (existingUnitsError) throw new Error(`Error checking existing units: ${existingUnitsError.message}`);

      // Filter to only active units
      const activeUnits = (allExistingUnits || []).filter(unit => unit.status !== 'deleted');
      
      // Create a map of active unit numbers -> id for duplicate checking
      const activeUnitMap = new Map<string, string>();
      activeUnits.forEach(unit => {
        activeUnitMap.set(unit.unit_number, unit.id);
      });

      // Check for duplicate unit numbers
      const duplicateUnits = units.filter(unit => activeUnitMap.has(unit.unit_number));
      
      if (duplicateUnits.length > 0) {
        throw new Error(`Unit number(s) ${duplicateUnits.map(u => u.unit_number).join(', ')} already exist in this property`);
      }

      // Prepare units with property ID
      const unitsWithPropertyId = units.map(unit => ({
        ...unit,
        property_id: propertyId,
        organization_id: organizationId
      }));

      // Add the units
      const { data, error } = await supabase
        .from('units')
        .insert(unitsWithPropertyId)
        .select();

      if (error) throw new Error(`Error adding units: ${error.message}`);
      return data as Unit[];
    } catch (error) {
      console.error('Error in addUnitsToProperty:', error);
      throw error;
    }
  },

  // Update unit
  updateUnit,

  // Comprehensive update for property and units
  async updateRentalWithUnits(
    propertyId: string,
    propertyData: Partial<Property>,
    unitsData: { 
      add: Omit<Unit, 'id' | 'property_id'>[];
      update: Unit[];
      markAsDeleted: string[]; // Unit IDs to mark as deleted
    },
    organizationId: string
  ): Promise<Property> {
    try {
      // Step 1: Update property data first
      const { data: updatedProperty, error: propertyError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId)
        .eq('organization_id', organizationId)
        .select()
        .single();
        
      if (propertyError) throw new Error(`Property update failed: ${propertyError.message}`);

      // Step 2: Handle unit operations

      // Step 2.1: Check for duplicate unit numbers before adding
      if (unitsData.add && unitsData.add.length > 0) {
        // Get existing unit numbers for this property
        const { data: existingUnits, error: unitsError } = await supabase
          .from('units')
          .select('unit_number')
          .eq('property_id', propertyId)
          .eq('organization_id', organizationId)
          .neq('status', 'deleted');
          
        if (unitsError) throw new Error(`Error checking unit numbers: ${unitsError.message}`);
        
        const existingUnitNumbers = new Set(existingUnits.map(u => u.unit_number));
        
        // Check for duplicates
        const duplicateUnits = unitsData.add.filter(unit => 
          existingUnitNumbers.has(unit.unit_number)
        );
        
        if (duplicateUnits.length > 0) {
          throw new Error(`Duplicate unit numbers found: ${duplicateUnits.map(u => u.unit_number).join(', ')}`);
        }

        // Add new units
        const unitsToAdd = unitsData.add.map(unit => ({
          ...unit,
          property_id: propertyId,
          organization_id: organizationId
        }));
        
        const { error: addError } = await supabase
          .from('units')
          .insert(unitsToAdd);
          
        if (addError) throw new Error(`Error adding units: ${addError.message}`);
      }

      // Step 2.2: Update existing units
      if (unitsData.update && unitsData.update.length > 0) {
        for (const unit of unitsData.update) {
          const { id: unitId, ...unitData } = unit;
          if (!unitId) continue;
          
          const { error: updateError } = await supabase
            .from('units')
            .update({
              ...unitData,
              organization_id: organizationId
            })
            .eq('id', unitId)
            .eq('property_id', propertyId);
            
          if (updateError) throw new Error(`Error updating unit ${unitId}: ${updateError.message}`);
        }
      }

      // Step 2.3: Mark units as deleted (soft delete)
      if (unitsData.markAsDeleted && unitsData.markAsDeleted.length > 0) {
        const { error: deleteError } = await supabase
          .from('units')
          .update({ status: 'deleted' })
          .in('id', unitsData.markAsDeleted)
          .eq('property_id', propertyId)
          .eq('organization_id', organizationId);
          
        if (deleteError) throw new Error(`Error marking units as deleted: ${deleteError.message}`);
      }

      // Step 3: Fetch the updated property with its units
      const { data: completeProperty, error: fetchError } = await supabase
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
            smart_lock_enabled
          )
        `)
        .eq('id', propertyId)
        .eq('organization_id', organizationId)
        .single();

      if (fetchError) throw new Error(`Error fetching updated property: ${fetchError.message}`);
      
      // Filter out deleted units for UI
      if (completeProperty.units) {
        completeProperty.units = completeProperty.units.filter(unit => unit.status !== 'deleted');
      }
      
      return completeProperty;
    } catch (error) {
      console.error('Error in updateRentalWithUnits:', error);
      throw error;
    }
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
