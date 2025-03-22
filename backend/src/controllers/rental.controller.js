const { supabase } = require('../config/supabase');

class RentalController {
  // Get all rentals
  async getRentals(req, res) {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', req.user.id)
        .single();

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
            status
          ),
          owner:owners (
            id,
            user:user_profiles (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('organization_id', userProfile.organization_id);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get rental by ID
  async getRentalById(req, res) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (
            *,
            leases (
              *,
              tenant:tenants (
                id,
                user:user_profiles (
                  id,
                  first_name,
                  last_name,
                  email
                )
              )
            )
          ),
          owner:owners (
            id,
            user:user_profiles (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Rental not found' });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new rental
  async createRental(req, res) {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', req.user.id)
        .single();
      
      // Extract property and units data from request body
      const { property, units = [] } = req.body;
      
      if (!property) {
        return res.status(400).json({ error: 'Property data is required' });
      }

      // Validate that at least one unit is provided
      if (!units || units.length === 0) {
        return res.status(400).json({ error: 'At least one unit is required for a property' });
      }

      // Add organization_id to the property data
      const propertyData = {
        ...property,
        total_units: units.length, // Set total_units based on the actual number of units provided
        organization_id: userProfile.organization_id
      };

      // Create the property
      const { data: createdProperty, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (propertyError) {
        console.error('Property creation error:', propertyError);
        if (propertyError.message.includes('properties_total_units_check')) {
          return res.status(400).json({ error: 'Please add at least one unit to the property' });
        }
        throw propertyError;
      }

      // If units were provided, create them with the property_id
      if (units && units.length > 0) {
        // Map status values to valid database values - use only what's in the schema
        const validStatusMap = {
          'Available': 'Available', // From schema default
          'Occupied': 'Occupied',
          'Maintenance': 'Available', // Fallback to Available
          'Reserved': 'Available', // Fallback to Available
          'Unavailable': 'Available' // Fallback to Available
        };

        // Convert all numeric values from strings to numbers and only include fields in the schema
        const unitsWithIds = units.map(unit => ({
          unit_number: unit.unit_number,
          rent_amount: parseFloat(unit.rent_amount), 
          status: validStatusMap[unit.status] || 'Available',
          bedrooms: parseInt(unit.bedrooms, 10),
          bathrooms: parseFloat(unit.bathrooms),
          square_feet: parseInt(unit.square_feet, 10),
          property_id: createdProperty.id,
          organization_id: userProfile.organization_id,
          smart_lock_enabled: unit.smart_lock_enabled || false,
          floor_plan: unit.floor_plan || null
          // Removing fields not in schema (name, rentAmount, occupancyStatus)
        }));

        console.log('Inserting units with data:', JSON.stringify(unitsWithIds, null, 2));

        const { error: unitsError } = await supabase
          .from('units')
          .insert(unitsWithIds);

        if (unitsError) {
          // If there was an error creating units, delete the property to maintain consistency
          await supabase
            .from('properties')
            .delete()
            .eq('id', createdProperty.id);
          
          console.error('Units creation error:', unitsError);
          
          if (unitsError.message.includes('Could not find the')) {
            return res.status(400).json({ 
              error: 'Invalid unit data. Some fields are not supported by the database schema.'
            });
          }
          
          throw unitsError;
        }
      }

      // Fetch the complete property with units to return to the client
      const { data: completeProperty, error: fetchError } = await supabase
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
            status
          )
        `)
        .eq('id', createdProperty.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      res.status(201).json(completeProperty);
    } catch (error) {
      console.error('Error creating rental:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update rental with units
  async updateRental(req, res) {
    try {
      const { property, units } = req.body;
      const { id } = req.params;
      const { organization_id } = req.user; // Assuming from auth middleware

      // Fetch the current property to ensure it exists
      const { data: existingProperty, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization_id)
        .single();

      if (fetchError || !existingProperty) {
        return res.status(404).json({ error: 'Rental not found' });
      }

      // Update property details
      const { data: updatedProperty, error: propertyError } = await supabase
        .from('properties')
        .update(property)
        .eq('id', id)
        .eq('organization_id', organization_id)
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Handle units: add, update, mark as deleted (instead of physically deleting)
      if (units) {
        const { add, update, markAsDeleted } = units;

        // Add new units (check for duplicates first)
        if (add && add.length > 0) {
          // Get existing unit numbers for this property
          const { data: existingUnits, error: unitsError } = await supabase
            .from('units')
            .select('unit_number')
            .eq('property_id', id)
            .eq('organization_id', organization_id)
            .neq('status', 'deleted');
            
          if (unitsError) throw unitsError;
          
          const existingUnitNumbers = new Set(existingUnits.map(u => u.unit_number));
          
          // Check for duplicates
          const duplicateUnits = add.filter(unit => 
            existingUnitNumbers.has(unit.unit_number)
          );
          
          if (duplicateUnits.length > 0) {
            return res.status(400).json({
              error: 'Duplicate unit numbers found',
              duplicates: duplicateUnits.map(u => u.unit_number)
            });
          }

          // Add valid units
          const unitsToAdd = add.map(unit => ({
            ...unit,
            property_id: id,
            organization_id: organization_id,
          }));
          
          const { error: addError } = await supabase
            .from('units')
            .insert(unitsToAdd);
            
          if (addError) throw addError;
        }

        // Update existing units
        if (update && update.length > 0) {
          for (const unit of update) {
            const { id: unitId, ...unitData } = unit;
            const { error: updateError } = await supabase
              .from('units')
              .update(unitData)
              .eq('id', unitId)
              .eq('property_id', id)
              .eq('organization_id', organization_id);
              
            if (updateError) throw updateError;
          }
        }

        // Mark units as deleted (soft delete) rather than physically removing
        if (markAsDeleted && markAsDeleted.length > 0) {
          const { error: deleteError } = await supabase
            .from('units')
            .update({ status: 'deleted' })
            .in('id', markAsDeleted)
            .eq('property_id', id)
            .eq('organization_id', organization_id);
            
          if (deleteError) throw deleteError;
        }
      }

      // Fetch the updated property with units
      const { data: completeProperty, error: fetchUpdatedError } = await supabase
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
        .eq('id', id)
        .eq('organization_id', organization_id)
        .single();

      if (fetchUpdatedError) throw fetchUpdatedError;

      res.json(completeProperty);
    } catch (error) {
      console.error('Error updating rental:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete rental
  async deleteRental(req, res) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RentalController(); 