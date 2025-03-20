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

  // Update rental
  async updateRental(req, res) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
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