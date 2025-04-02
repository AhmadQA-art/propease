const { supabase } = require('../config/supabase');

class OwnerService {
  async getOwners({ organization_id, page = 1, pageSize = 10, search, sortBy, sortOrder = 'desc' }) {
    try {
      let query = supabase
        .from('owners')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization_id);

      // Apply search if provided
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
      }

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        metadata: {
          total: count,
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize)
        }
      };
    } catch (error) {
      console.error('Error in getOwners:', error);
      throw error;
    }
  }

  async getOwnerById(id, organization_id) {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organization_id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getOwnerById:', error);
      throw error;
    }
  }

  async createOwner(ownerData) {
    try {
      const { data, error } = await supabase
        .from('owners')
        .insert([ownerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in createOwner:', error);
      throw error;
    }
  }

  async updateOwner(id, ownerData) {
    try {
      const { data, error } = await supabase
        .from('owners')
        .update(ownerData)
        .eq('id', id)
        .eq('organization_id', ownerData.organization_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in updateOwner:', error);
      throw error;
    }
  }

  async deleteOwner(id, organization_id) {
    try {
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization_id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error in deleteOwner:', error);
      throw error;
    }
  }
}

module.exports = new OwnerService();
