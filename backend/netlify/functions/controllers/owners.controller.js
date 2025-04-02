const { supabase } = require('../config/supabase');

const getOwners = async (req, res) => {
  console.log('=== getOwners controller called ===');
  console.log('Request headers:', req.headers);
  console.log('Request user:', req.user);
  console.log('Request query params:', req.query);

  try {
    console.log('Fetching owners for organization:', req.user.organization_id);

    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('organization_id', req.user.organization_id);

    if (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }

    console.log(`Found ${data.length} owners`);
    res.json(data);
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createOwner = async (req, res) => {
  try {
    console.log('Creating new owner with data:', req.body);
    
    // Update validation to match the schema fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Build data object with only valid fields for owners table (no created_by)
    const ownerData = {
      ...req.body,
      organization_id: req.user.organization_id,
      // Don't include created_by as this field doesn't exist in owners table
      created_at: new Date().toISOString()
    };

    console.log('Inserting owner with data:', ownerData);

    const { data, error } = await supabase
      .from('owners')
      .insert(ownerData)
      .select()
      .single();

    if (error) {
      console.error('Error creating owner:', error);
      throw error;
    }

    console.log('Successfully created owner:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Create owner error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getOwnerById = async (req, res) => {
  try {
    console.log('Fetching owner with ID:', req.params.id);

    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', req.params.id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (error) {
      console.error('Error fetching owner:', error);
      throw error;
    }

    if (!data) {
      console.log('Owner not found');
      return res.status(404).json({ error: 'Owner not found' });
    }

    console.log('Found owner:', data);
    res.json(data);
  } catch (error) {
    console.error('Get owner by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating owner ${id} with data:`, req.body);
    
    // Check if owner exists and belongs to the user's organization
    const { data: existingOwner, error: getError } = await supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .single();
    
    if (getError || !existingOwner) {
      console.error('Error finding owner to update:', getError);
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    // Build update data without updated_by field which doesn't exist in owners table
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
      // Don't include updated_by as this field doesn't exist in owners table
    };

    console.log('Updating owner with data:', updateData);

    const { data, error } = await supabase
      .from('owners')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating owner:', error);
      throw error;
    }

    console.log('Successfully updated owner:', data);
    res.json(data);
  } catch (error) {
    console.error('Update owner error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteOwner = async (req, res) => {
  try {
    console.log('Deleting owner with ID:', req.params.id);

    // Validate if owner exists and belongs to the organization
    const { data: existingOwner, error: fetchError } = await supabase
      .from('owners')
      .select('*')
      .eq('id', req.params.id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (fetchError || !existingOwner) {
      console.error('Owner not found or access denied');
      return res.status(404).json({ error: 'Owner not found or access denied' });
    }

    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', req.params.id)
      .eq('organization_id', req.user.organization_id);

    if (error) {
      console.error('Error deleting owner:', error);
      throw error;
    }

    console.log('Successfully deleted owner');
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    console.error('Delete owner error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOwners,
  createOwner,
  getOwnerById,
  updateOwner,
  deleteOwner
};
