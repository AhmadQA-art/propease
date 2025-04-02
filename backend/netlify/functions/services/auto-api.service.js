const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

/**
 * AutoApiService provides direct access to Supabase tables
 * These are automatically generated endpoints based on your database schema
 */
class AutoApiService {
  /**
   * Create a service for a specific resource
   * @param {string} resourceName - The table name to interact with
   */
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.table = supabase.from(resourceName);
  }

  /**
   * Get all records from the table
   * @param {Object} options - Query options
   * @param {string[]} options.select - Fields to select
   * @param {Object} options.filters - Filter conditions
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @returns {Promise} - The query result
   */
  async getAll(options = {}) {
    console.log(`[AutoAPI] Getting all ${this.resourceName}`, options);
    
    let query = this.table.select(options.select || '*');
    
    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`[AutoAPI] Error getting ${this.resourceName}:`, error);
      throw error;
    }
    
    return { data, count: data?.length || 0 };
  }

  /**
   * Get a record by ID
   * @param {string} id - The record ID
   * @param {string} select - Fields to select
   * @returns {Promise} - The query result
   */
  async getById(id, select = '*') {
    console.log(`[AutoAPI] Getting ${this.resourceName} by ID: ${id}`);
    
    const { data, error } = await this.table
      .select(select)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`[AutoAPI] Error getting ${this.resourceName} by ID:`, error);
      throw error;
    }
    
    return { data };
  }

  /**
   * Create a new record
   * @param {Object} data - The data to insert
   * @returns {Promise} - The newly created record
   */
  async create(data) {
    console.log(`[AutoAPI] Creating ${this.resourceName}:`, data);
    
    const { data: newRecord, error } = await this.table
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`[AutoAPI] Error creating ${this.resourceName}:`, error);
      throw error;
    }
    
    return { data: newRecord };
  }

  /**
   * Update a record
   * @param {string} id - The record ID
   * @param {Object} data - The data to update
   * @returns {Promise} - The updated record
   */
  async update(id, data) {
    console.log(`[AutoAPI] Updating ${this.resourceName} ${id}:`, data);
    
    const { data: updatedRecord, error } = await this.table
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`[AutoAPI] Error updating ${this.resourceName}:`, error);
      throw error;
    }
    
    return { data: updatedRecord };
  }

  /**
   * Delete a record
   * @param {string} id - The record ID
   * @returns {Promise} - The operation result
   */
  async delete(id) {
    console.log(`[AutoAPI] Deleting ${this.resourceName} ${id}`);
    
    const { error } = await this.table
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[AutoAPI] Error deleting ${this.resourceName}:`, error);
      throw error;
    }
    
    return { success: true };
  }

  /**
   * Check if a table has a specific column
   * @param {string} columnName - The name of the column to check
   * @returns {Promise<boolean>} - True if the column exists
   */
  async tableHasColumn(columnName) {
    console.log(`[AutoAPI] Checking if ${this.resourceName} has column: ${columnName}`);
    
    try {
      // Using Postgres information_schema to check if the column exists
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', this.resourceName)
        .eq('column_name', columnName);
      
      if (error) {
        console.error(`[AutoAPI] Error checking column existence:`, error);
        // If there's an error, we'll assume the column doesn't exist
        return false;
      }
      
      const exists = data && data.length > 0;
      console.log(`[AutoAPI] Column ${columnName} ${exists ? 'exists' : 'does not exist'} in ${this.resourceName}`);
      return exists;
    } catch (err) {
      console.error(`[AutoAPI] Exception checking column existence:`, err);
      // If there's an exception, we'll assume the column doesn't exist
      return false;
    }
  }
}

module.exports = AutoApiService; 