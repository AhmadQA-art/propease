const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { supabase } = require('../config/supabase');

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the department
 *         name:
 *           type: string
 *           description: The department name
 *         organization_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the organization this department belongs to
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the department was created
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Leasing"
 *         organization_id: "123e4567-e89b-12d3-a456-426614174001"
 *         created_at: "2024-03-18T12:00:00Z"
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     description: Retrieve all departments for the current organization. Requires authentication.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { organization_id } = req.user;
    
    const { data, error, count } = await supabase
      .from('departments')
      .select('*', { count: 'exact' })
      .eq('organization_id', organization_id)
      .order('name');
      
    if (error) throw error;
    
    res.json({
      data: data || [],
      count: count || 0
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     description: Create a new department in the organization. Requires authentication.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const { id: user_id, organization_id } = req.user;
    
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    
    console.log(`Creating department '${name}' for organization ${organization_id}`);
    
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name,
        organization_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department
 *     description: Update a department by ID. Requires authentication.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { organization_id } = req.user;
    
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }
    
    // First check if the department exists and belongs to the user's organization
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();
      
    if (checkError || !existingDept) {
      return res.status(404).json({ error: 'Department not found or access denied' });
    }
    
    const { data, error } = await supabase
      .from('departments')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     description: Delete a department by ID. Requires authentication.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { organization_id } = req.user;
    
    // First check if the department exists and belongs to the user's organization
    const { data: existingDept, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();
      
    if (checkError || !existingDept) {
      return res.status(404).json({ error: 'Department not found or access denied' });
    }
    
    // Check if department is in use by any team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id')
      .eq('department_id', id)
      .limit(1);
      
    if (teamError) throw teamError;
    
    if (teamMembers && teamMembers.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department that is assigned to team members' 
      });
    }
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
