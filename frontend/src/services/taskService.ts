import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Task, TaskWithAssignee, TaskAssignee } from '../types/people';

export const taskService = {
  async getTasks(
    currentUserOrganizationId: string | undefined = undefined,
    statusQuery: string = '',
    priorityQuery: string = '',
    team: any[] = [],
    searchQuery: string = '',
  ): Promise<TaskWithAssignee[]> {
    try {
      // 1. First fetch the tasks
      let query = supabase
        .from('tasks')
        .select(`
          *,
          owner:user_profiles!tasks_owner_id_fkey(
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `);
      
      // Only filter by organization_id if it's provided and valid
      if (currentUserOrganizationId && currentUserOrganizationId !== 'undefined') {
        query = query.eq('organization_id', currentUserOrganizationId);
      }

      if (statusQuery) {
        query = query.eq('status', statusQuery);
      }

      if (priorityQuery) {
        query = query.eq('priority', priorityQuery);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data: tasks, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      // 2. Get all task IDs
      const taskIds = tasks.map(task => task.id);
      
      // 3. Fetch task assignees from task_assignees join table
      const { data: assigneeData, error: assigneeError } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          user_profiles(
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `)
        .in('task_id', taskIds);

      if (assigneeError) {
        console.error('Error fetching task assignees:', assigneeError);
      }

      // 4. Get related properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('tasks_properties')
        .select('task_id, property_id')
        .in('task_id', taskIds);
        
      if (propertiesError) {
        console.error('Error fetching task properties:', propertiesError);
      }
      
      // 5. Get related leases
      const { data: leasesData, error: leasesError } = await supabase
        .from('tasks_leases')
        .select('task_id, lease_id')
        .in('task_id', taskIds);
        
      if (leasesError) {
        console.error('Error fetching task leases:', leasesError);
      }
      
      // 6. Get related tasks
      const { data: relatedTasksData, error: relatedTasksError } = await supabase
        .from('tasks_related_tasks')
        .select('task_id, related_task_id')
        .in('task_id', taskIds);
        
      if (relatedTasksError) {
        console.error('Error fetching related tasks:', relatedTasksError);
      }

      // 7. Transform the data to match the expected format
      return tasks.map(task => {
        // Find assignees for this task
        const taskAssignees = assigneeData
          ? assigneeData
              .filter(a => a.task_id === task.id)
              .map(a => {
                // Use any type to avoid TypeScript errors
                const user = (a.user_profiles as any);
                return {
                  id: user.id,
                  name: `${user.first_name} ${user.last_name}`.trim(),
                  imageUrl: user.profile_image_url,
                  email: user.email
                };
              })
          : [];

        // Get property IDs for this task
        const propertyIds = propertiesData 
          ? propertiesData.filter(p => p.task_id === task.id).map(p => p.property_id) 
          : [];
          
        // Get lease IDs for this task
        const leaseIds = leasesData 
          ? leasesData.filter(l => l.task_id === task.id).map(l => l.lease_id) 
          : [];
          
        // Get related task IDs for this task
        const relatedToIds = relatedTasksData 
          ? relatedTasksData.filter(rt => rt.task_id === task.id).map(rt => rt.related_task_id) 
          : [];

        // Extract assignee IDs for the assignedTo field
        const assignedTo = taskAssignees.map(assignee => assignee.id);

        // Transform the owner data if present
        let owner = null;
        if (task.owner) {
          owner = {
            id: task.owner.id,
            name: `${task.owner.first_name} ${task.owner.last_name}`.trim(),
            imageUrl: task.owner.profile_image_url,
            email: task.owner.email
          };
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status as any,
          dueDate: task.due_date,
          assignedTo: assignedTo,
          priority: task.priority,
          type: task.type || 'team',
          relatedToId: relatedToIds.length > 0 ? relatedToIds[0] : null,
          propertyId: propertyIds.length > 0 ? propertyIds[0] : null,
          leaseId: leaseIds.length > 0 ? leaseIds[0] : null,
          organizationId: task.organization_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          relatedToIds: relatedToIds,
          propertyIds: propertyIds,
          leaseIds: leaseIds,
          assignees: taskAssignees,
          assignee: taskAssignees.length > 0 ? taskAssignees[0] : undefined,
          owner: owner
        };
      });
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  async getTaskById(
    taskId: string,
  ): Promise<TaskWithAssignee | null> {
    try {
      // 1. First fetch the task
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          owner:user_profiles!tasks_owner_id_fkey(
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        return null;
      }
      
      // 2. Fetch task assignees from task_assignees join table
      const { data: assigneeData, error: assigneeError } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          user_profiles(
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `)
        .eq('task_id', taskId);

      if (assigneeError) {
        console.error('Error fetching task assignees:', assigneeError);
      }
      
      // 3. Get related properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('tasks_properties')
        .select('property_id')
        .eq('task_id', taskId);
        
      if (propertiesError) {
        console.error('Error fetching task properties:', propertiesError);
      }
      
      // 4. Get related leases
      const { data: leasesData, error: leasesError } = await supabase
        .from('tasks_leases')
        .select('lease_id')
        .eq('task_id', taskId);
        
      if (leasesError) {
        console.error('Error fetching task leases:', leasesError);
      }
      
      // 5. Get related tasks
      const { data: relatedTasksData, error: relatedTasksError } = await supabase
        .from('tasks_related_tasks')
        .select('related_task_id')
        .eq('task_id', taskId);
        
      if (relatedTasksError) {
        console.error('Error fetching related tasks:', relatedTasksError);
      }
      
      // 6. Process assignees
      const taskAssignees = assigneeData
        ? assigneeData.map(a => {
            // Use any type to avoid TypeScript errors
            const user = (a.user_profiles as any);
            return {
              id: user.id,
              name: `${user.first_name} ${user.last_name}`.trim(),
              imageUrl: user.profile_image_url,
              email: user.email
            };
          })
        : [];

      // 7. Process the related data
      const propertyIds = propertiesData 
        ? propertiesData.map(p => p.property_id) 
        : [];
        
      const leaseIds = leasesData 
        ? leasesData.map(l => l.lease_id) 
        : [];
        
      const relatedToIds = relatedTasksData 
        ? relatedTasksData.map(rt => rt.related_task_id) 
        : [];

      // 8. Extract assignee IDs for the assignedTo field
      const assignedTo = taskAssignees.map(assignee => assignee.id);

      // 9. Transform the owner data if present
      let owner = null;
      if (task.owner) {
        owner = {
          id: task.owner.id,
          name: `${task.owner.first_name} ${task.owner.last_name}`.trim(),
          imageUrl: task.owner.profile_image_url,
          email: task.owner.email
        };
      }
      
      // 10. Construct and return the task object
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status as any,
        dueDate: task.due_date,
        assignedTo: assignedTo,
        priority: task.priority,
        type: task.type || 'team',
        relatedToId: relatedToIds.length > 0 ? relatedToIds[0] : null,
        propertyId: propertyIds.length > 0 ? propertyIds[0] : null,
        leaseId: leaseIds.length > 0 ? leaseIds[0] : null,
        organizationId: task.organization_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        relatedToIds: relatedToIds,
        propertyIds: propertyIds,
        leaseIds: leaseIds,
        assignees: taskAssignees,
        assignee: taskAssignees.length > 0 ? taskAssignees[0] : undefined,
        owner: owner
      };
    } catch (error) {
      console.error('Error in getTaskById:', error);
      return null;
    }
  },

  async createTask(
    task: Partial<Task>,
    currentUser: User | null,
  ): Promise<TaskWithAssignee | null> {
    try {
      if (!currentUser) {
        console.error('No current user provided');
        return null;
      }

      if (!task.title) {
        console.error('Task title is required');
        return null;
      }

      // Log received task data
      console.log('Creating task with data:', JSON.stringify(task, null, 2));
      console.log('Multi-select fields:');
      console.log('- Related task IDs:', task.relatedToIds);
      console.log('- Property IDs:', task.propertyIds);
      console.log('- Lease IDs:', task.leaseIds);

      const assignees = task.assignedTo || [];

      // Get the organization ID securely, ensure it's not undefined
      let organizationId = task.organizationId;
      if (!organizationId || organizationId === 'undefined') {
        console.warn('Organization ID not provided in task data');
        // Try to get from currentUser if available
        organizationId = (currentUser as any).organizationId;
      }

      // Prepare task data, excluding organization_id if it's not valid
      const taskData: any = {
        title: task.title,
        description: task.description || '',
        status: task.status || 'new',
        due_date: task.dueDate || null,
        priority: task.priority || 'medium',
        type: task.type || 'team',
        owner_id: currentUser.id,
      };

      // Only add organization_id if it's valid
      if (organizationId && organizationId !== 'undefined') {
        taskData.organization_id = organizationId;
      }

      const { data, error } = await supabase.from('tasks').insert([taskData]).select().single();

      if (error) {
        console.error('Error creating task:', error);
        return null;
      }

      console.log('Task created successfully with ID:', data.id);

      // Insert assignees
      if (assignees.length > 0) {
        const assigneeInserts = assignees.map(userId => ({
          task_id: data.id,
          user_id: userId
        }));

        console.log('Adding assignees:', assigneeInserts);
        const { error: assigneeError } = await supabase
          .from('task_assignees')
          .insert(assigneeInserts);
        
        if (assigneeError) {
          console.error('Error assigning users to task:', assigneeError);
        } else {
          console.log('Assignees added successfully');
        }
      }

      // Insert property relationships
      if (task.propertyIds && task.propertyIds.length > 0) {
        const propertyRelations = task.propertyIds.map(propertyId => ({
          task_id: data.id,
          property_id: propertyId
        }));
        
        console.log('Adding property relationships:', propertyRelations);
        const { error: propertyError } = await supabase
          .from('tasks_properties')
          .insert(propertyRelations);
          
        if (propertyError) {
          console.error('Error adding property relationships:', propertyError);
        } else {
          console.log('Property relationships added successfully');
        }
      }
      
      // Insert lease relationships
      if (task.leaseIds && task.leaseIds.length > 0) {
        const leaseRelations = task.leaseIds.map(leaseId => ({
          task_id: data.id,
          lease_id: leaseId
        }));
        
        console.log('Adding lease relationships:', leaseRelations);
        const { error: leaseError } = await supabase
          .from('tasks_leases')
          .insert(leaseRelations);
          
        if (leaseError) {
          console.error('Error adding lease relationships:', leaseError);
        } else {
          console.log('Lease relationships added successfully');
        }
      }
      
      // Insert related task relationships
      if (task.relatedToIds && task.relatedToIds.length > 0) {
        const taskRelations = task.relatedToIds.map(relatedTaskId => ({
          task_id: data.id,
          related_task_id: relatedTaskId
        }));
        
        console.log('Adding related task relationships:', taskRelations);
        const { error: relatedTaskError } = await supabase
          .from('tasks_related_tasks')
          .insert(taskRelations);
          
        if (relatedTaskError) {
          console.error('Error adding related task relationships:', relatedTaskError);
        } else {
          console.log('Related task relationships added successfully');
        }
      }

      // Get the owner info from the user profiles table
      const { data: ownerData, error: ownerError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, profile_image_url')
        .eq('id', currentUser.id)
        .single();

      if (ownerError) {
        console.error('Error fetching owner data:', ownerError);
      }

      // Create the owner object for the response
      const owner = ownerData ? {
        id: ownerData.id,
        name: `${ownerData.first_name} ${ownerData.last_name}`.trim(),
        imageUrl: ownerData.profile_image_url,
        email: ownerData.email
      } : null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.due_date,
        assignedTo: assignees,
        priority: data.priority,
        type: data.type,
        organizationId: data.organization_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        propertyIds: task.propertyIds || [],
        leaseIds: task.leaseIds || [],
        relatedToIds: task.relatedToIds || [],
        assignees: [],  // Will be populated when task is fetched
        assignee: undefined,  // Will be populated when task is fetched
        owner
      };
    } catch (error) {
      console.error('Error in createTask:', error);
      return null;
    }
  },

  async updateTask(
    task: Partial<Task>,
    currentUser: User | null = null,
  ): Promise<TaskWithAssignee | null> {
    try {
      if (!task.id) {
        console.error('Task ID is required for update');
        return null;
      }

      if (!task.title) {
        console.error('Task title is required');
        return null;
      }

      // Log received task data
      console.log('Updating task with data:', JSON.stringify(task, null, 2));
      console.log('Multi-select fields:');
      console.log('- Related task IDs:', task.relatedToIds);
      console.log('- Property IDs:', task.propertyIds);
      console.log('- Lease IDs:', task.leaseIds);

      const assignees = task.assignedTo || [];

      // Create the task object for update, removing sensitive fields
      const { assignedTo, relatedToId, propertyId, leaseId, relatedToIds, propertyIds, leaseIds, organizationId, dueDate, ...taskDataWithoutRelations } = task;
      const taskForUpdate = {
        ...taskDataWithoutRelations,
        due_date: task.dueDate,
        updated_at: new Date().toISOString()
      };

      // Ensure we don't try to update with an invalid organization_id
      if ((taskForUpdate as any).organization_id === 'undefined' || (taskForUpdate as any).organization_id === undefined) {
        delete (taskForUpdate as any).organization_id;
      }

      // Update the task
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(taskForUpdate)
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        return null;
      }

      console.log('Task base data updated successfully');

      // Handle assignees if provided - remove existing and add new
      if (assignees.length > 0 || task.assignedTo !== undefined) {
        // First, remove existing assignee relationships
        console.log('Removing existing assignees for task:', task.id);
        const { error: deleteError } = await supabase
          .from('task_assignees')
          .delete()
          .eq('task_id', task.id);

        if (deleteError) {
          console.error('Error removing existing assignees:', deleteError);
        } else {
          console.log('Existing assignees removed successfully');
        }

        // Then add the new assignees
        if (assignees.length > 0) {
          const assigneeInserts = assignees.map(userId => ({
            task_id: task.id!,
            user_id: userId
          }));

          console.log('Adding new assignees:', assigneeInserts);
          const { error: assignError } = await supabase
            .from('task_assignees')
            .insert(assigneeInserts);

          if (assignError) {
            console.error('Error assigning users to task:', assignError);
          } else {
            console.log('New assignees added successfully');
          }
        }
      }

      // Update related properties
      console.log('Updating property relationships');
      await this.updateTaskRelations(
        task.id, 
        'tasks_properties', 
        'property_id', 
        task.propertyIds || (task.propertyId ? [task.propertyId] : [])
      );

      // Update related leases
      console.log('Updating lease relationships');
      await this.updateTaskRelations(
        task.id, 
        'tasks_leases', 
        'lease_id', 
        task.leaseIds || (task.leaseId ? [task.leaseId] : [])
      );

      // Update related tasks
      console.log('Updating related task relationships');
      await this.updateTaskRelations(
        task.id, 
        'tasks_related_tasks', 
        'related_task_id', 
        task.relatedToIds || (task.relatedToId ? [task.relatedToId] : [])
      );

      console.log('Getting updated task with all relationships');
      // Now fetch the task with all its new relationships
      return this.getTaskById(task.id);
    } catch (error) {
      console.error('Error in updateTask:', error);
      return null;
    }
  },

  async updateTaskStatus(
    taskId: string,
    status: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
      }
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
    }
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      // Delete related entries in join tables first
      await supabase.from('tasks_properties').delete().eq('task_id', taskId);
      await supabase.from('tasks_leases').delete().eq('task_id', taskId);
      await supabase.from('tasks_related_tasks').delete().eq('task_id', taskId);
      
      // Then delete the task
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return false;
    }
  },

  async getTaskAssignees(taskId: string): Promise<TaskAssignee[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignees')
        .select(`
          user_id,
          user_profiles(
            id,
            first_name,
            last_name,
            profile_image_url,
            email
          )
        `)
        .eq('task_id', taskId);

      if (error) {
        throw error;
      }

      return data.map((assignee: any) => ({
        id: assignee.user_profiles.id,
        name: `${assignee.user_profiles.first_name} ${assignee.user_profiles.last_name}`.trim(),
        imageUrl: assignee.user_profiles.profile_image_url,
        email: assignee.user_profiles.email
      }));
    } catch (error) {
      console.error('Error fetching task assignees:', error);
      throw error;
    }
  },

  // Helper method to update task relations
  async updateTaskRelations(
    taskId: string, 
    tableName: string, 
    foreignKeyName: string, 
    relatedIds: string[]
  ): Promise<void> {
    try {
      console.log(`Updating ${tableName} for task ${taskId} with values:`, relatedIds);
      
      // 1. Delete existing relations
      console.log(`Removing existing ${tableName} for task:`, taskId);
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('task_id', taskId);

      if (deleteError) {
        console.error(`Error removing existing ${tableName}:`, deleteError);
        // Continue despite errors
      } else {
        console.log(`Existing ${tableName} removed successfully`);
      }

      // 2. If there are new relations to add, insert them
      if (relatedIds.length > 0) {
        const relations = relatedIds.map(id => ({
          task_id: taskId,
          [foreignKeyName]: id
        }));

        console.log(`Adding new ${tableName}:`, relations);
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(relations);

        if (insertError) {
          console.error(`Error adding new ${tableName}:`, insertError);
        } else {
          console.log(`New ${tableName} added successfully`);
        }
      } else {
        console.log(`No new ${tableName} to add`);
      }
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
    }
  },
}; 