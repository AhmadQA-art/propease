const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all leases
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new lease
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lease by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lease
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Lease not found' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lease
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('leases')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
