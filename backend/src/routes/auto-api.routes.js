const express = require('express');
const router = express.Router();
const AutoApiService = require('../services/auto-api.service');
const { authenticateToken } = require('../middleware/auth.middleware');

// Add a route to log when the auto-API is accessed
router.use((req, res, next) => {
  console.log('=== Auto API accessed ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  next();
});

// List of resources that should be available through auto-generated APIs
const autoApiResources = [
  // Property Management
  'properties',
  'units',
  'property_metrics',
  'property_managers',
  'property_inspections',
  'property_stakeholders',
  
  // People Management
  'owners',
  'tenants',
  'vendors',
  'team_members',
  
  // Document Management
  'documents',
  'leases',
  'lease_addendums',
  'lease_renewals',
  
  // Financial Management
  'bank_accounts',
  'bank_account_types',
  'expenses',
  'invoices',
  'invoice_items',
  'invoice_payments',
  'payments',
  'payment_categories',
  'payment_methods',
  'payment_schedules',
  'payment_transactions',
  'financial_summaries',
  
  // Maintenance Management
  'maintenance_requests',
  'maintenance_comments',
  'maintenance_ticket_history',
  'maintenance_types',
  
  // Communication
  'announcements',
  'announcement_targets',
  'announcement_schedules',
  'announcement_types',
  'communication_logs',
  
  // Application Management
  'rental_applications',
  
  // Organization Management
  'organizations',
  'organization_invitations',
  
  // User Management
  'user_profiles',
  'user_roles',
  'roles',
  
  // General
  'tasks',
  'notifications',
  'activity_logs'
];

// List of resources that don't have a created_by column
const tablesWithoutCreatedBy = [
  'owners',
  'tenants',
  'vendors',
  'users'
];

// Create auto API endpoints for each resource
autoApiResources.forEach(resourceName => {
  console.log(`[AutoAPI] Setting up auto-generated API for: ${resourceName}`);
  const service = new AutoApiService(resourceName);
  const resourceRouter = express.Router();
  
  /**
   * @swagger
   * /api/auto/{resource}:
   *   get:
   *     summary: Get all records for a resource
   *     description: Auto-generated endpoint to retrieve all records
   *     parameters:
   *       - in: path
   *         name: resource
   *         required: true
   *         schema:
   *           type: string
   *         description: Resource name
   *     responses:
   *       200:
   *         description: List of records
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  resourceRouter.get('/', async (req, res) => {
    try {
      const options = {
        filters: {},
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      };
      
      // Process filter parameters (format: filter[field_name]=value)
      Object.entries(req.query).forEach(([key, value]) => {
        if (key.startsWith('filter[') && key.endsWith(']')) {
          const field = key.slice(7, -1);
          options.filters[field] = value;
        }
      });
      
      // Add organization filter for multi-tenant security
      if (req.user?.organization_id) {
        options.filters.organization_id = req.user.organization_id;
      }
      
      const result = await service.getAll(options);
      res.json(result);
    } catch (error) {
      console.error(`[AutoAPI] Error in GET /${resourceName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /api/auto/{resource}/{id}:
   *   get:
   *     summary: Get a record by ID
   *     description: Auto-generated endpoint to retrieve a specific record
   *     parameters:
   *       - in: path
   *         name: resource
   *         required: true
   *         schema:
   *           type: string
   *         description: Resource name
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     responses:
   *       200:
   *         description: Record details
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Record not found
   *       500:
   *         description: Server error
   */
  resourceRouter.get('/:id', async (req, res) => {
    try {
      const result = await service.getById(req.params.id);
      
      // Security check - verify organization_id matches user's organization
      if (req.user?.organization_id && 
          result.data?.organization_id && 
          result.data.organization_id !== req.user.organization_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(result);
    } catch (error) {
      console.error(`[AutoAPI] Error in GET /${resourceName}/${req.params.id}:`, error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /api/auto/{resource}:
   *   post:
   *     summary: Create a new record
   *     description: Auto-generated endpoint to create a record
   *     parameters:
   *       - in: path
   *         name: resource
   *         required: true
   *         schema:
   *           type: string
   *         description: Resource name
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Record created
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  resourceRouter.post('/', async (req, res) => {
    try {
      console.log(`[AutoAPI] POST request for ${resourceName} with data:`, req.body);
      
      // Build the data object with only applicable fields
      let data = { ...req.body };
      
      // Always add organization_id for multi-tenant security
      if (req.user?.organization_id) {
        data.organization_id = req.user.organization_id;
      }
      
      // Add created_at timestamp (most tables should have this)
      data.created_at = new Date().toISOString();
      
      // Only add created_by if the table is known to have this column
      if (!tablesWithoutCreatedBy.includes(resourceName) && req.user?.id) {
        data.created_by = req.user.id;
      }
      
      console.log(`[AutoAPI] Prepared data for ${resourceName}:`, data);
      
      const result = await service.create(data);
      res.status(201).json(result);
    } catch (error) {
      console.error(`[AutoAPI] Error in POST /${resourceName}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /api/auto/{resource}/{id}:
   *   put:
   *     summary: Update a record
   *     description: Auto-generated endpoint to update a specific record
   *     parameters:
   *       - in: path
   *         name: resource
   *         required: true
   *         schema:
   *           type: string
   *         description: Resource name
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Record updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Record not found
   *       500:
   *         description: Server error
   */
  resourceRouter.put('/:id', async (req, res) => {
    try {
      // First get the existing record to verify ownership
      const { data: existingRecord } = await service.getById(req.params.id);
      
      // Security check - verify organization_id matches user's organization
      if (existingRecord.organization_id !== req.user.organization_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Build the data object with only applicable fields
      let data = { ...req.body };
      
      // Add updated_at timestamp
      data.updated_at = new Date().toISOString();
      
      // Only add updated_by if the table is known to have this column
      if (!tablesWithoutCreatedBy.includes(resourceName) && req.user?.id) {
        data.updated_by = req.user.id;
      }
      
      // Don't allow changing organization
      delete data.organization_id;
      
      console.log(`[AutoAPI] Updating ${resourceName} ${req.params.id} with data:`, data);
      
      const result = await service.update(req.params.id, data);
      res.json(result);
    } catch (error) {
      console.error(`[AutoAPI] Error in PUT /${resourceName}/${req.params.id}:`, error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /api/auto/{resource}/{id}:
   *   delete:
   *     summary: Delete a record
   *     description: Auto-generated endpoint to delete a specific record
   *     parameters:
   *       - in: path
   *         name: resource
   *         required: true
   *         schema:
   *           type: string
   *         description: Resource name
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Record ID
   *     responses:
   *       204:
   *         description: Record deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Record not found
   *       500:
   *         description: Server error
   */
  resourceRouter.delete('/:id', async (req, res) => {
    try {
      // First get the existing record to verify ownership
      const { data: existingRecord } = await service.getById(req.params.id);
      
      // Security check - verify organization_id matches user's organization
      if (existingRecord.organization_id !== req.user.organization_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error(`[AutoAPI] Error in DELETE /${resourceName}/${req.params.id}:`, error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Mount the resource router
  router.use(`/${resourceName}`, authenticateToken, resourceRouter);
});

// Log all available auto-generated API endpoints
console.log('==========================================');
console.log('Available Auto-API endpoints:');
autoApiResources.forEach(resource => {
  console.log(`GET    /api/auto/${resource}           - Get all ${resource}`);
  console.log(`GET    /api/auto/${resource}/:id       - Get ${resource} by ID`);
  console.log(`POST   /api/auto/${resource}           - Create new ${resource}`);
  console.log(`PUT    /api/auto/${resource}/:id       - Update ${resource}`);
  console.log(`DELETE /api/auto/${resource}/:id       - Delete ${resource}`);
});
console.log('==========================================');

module.exports = router; 