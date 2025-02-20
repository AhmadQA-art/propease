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

      const rentalData = {
        ...req.body,
        organization_id: userProfile.organization_id
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(rentalData)
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
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