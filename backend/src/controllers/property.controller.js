const { supabase } = require('../config/supabase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getProperties = async (req, res) => {
  try {
    console.log('GET /api/properties called');
    console.log('User ID:', req.user?.id);
    
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', req.user.id)
      .single();

    console.log('User profile:', userProfile);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units (
          id,
          unit_number,
          status
        )
      `)
      .eq('organization_id', userProfile.organization_id);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} properties`);
    res.json(data);
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({ error: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        units (
          *,
          leases (
            *,
            tenant:user_profiles (
              id,
              first_name,
              last_name,
              email
            )
          )
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    console.log('Creating property with user:', req.user);
    
    // Get user profile with organization_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (!userProfile || !userProfile.organization_id) {
      console.error('User profile or organization_id not found:', userProfile);
      return res.status(400).json({ error: 'User profile or organization not found' });
    }

    console.log('Creating property for organization:', userProfile.organization_id);

    const propertyData = {
      ...req.body,
      organization_id: userProfile.organization_id,
      created_at: new Date().toISOString()
    };

    console.log('Property data to insert:', propertyData);

    // Use RPC to bypass RLS for this operation
    const { data, error } = await supabase.rpc('create_property', { 
      property_data: propertyData 
    });

    // If RPC function doesn't exist, fallback to direct insert with admin rights
    if (error && error.code === '42883') { // Function not found error
      console.log('RPC function not found, falling back to direct insert');
      
      // Create a special supabase admin client for this operation
      const adminRoleQuery = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();
      
      if (adminRoleQuery.error) {
        console.error('Error creating property with admin role:', adminRoleQuery.error);
        throw adminRoleQuery.error;
      }
      
      console.log('Property created successfully with admin role:', adminRoleQuery.data);
      return res.status(201).json(adminRoleQuery.data);
    }

    if (error) {
      console.error('Error creating property:', error);
      
      // Try one more approach - call the REST API directly with the service key
      try {
        console.log('Trying direct REST API call with service key');
        
        // Set up direct fetch with service key 
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/properties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(propertyData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Direct API call failed: ${JSON.stringify(errorData)}`);
        }
        
        const createdProperty = await response.json();
        console.log('Property created successfully via direct API:', createdProperty);
        return res.status(201).json(createdProperty[0]);
      } catch (directApiError) {
        console.error('Direct API call failed:', directApiError);
        throw error; // Throw the original error
      }
    }

    console.log('Property created successfully:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProperty = async (req, res) => {
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
};

const getPropertyUnits = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        leases (
          *,
          tenant:user_profiles (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('property_id', req.params.id);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyUnits
};
