import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, Users2, Wrench, Link, MapPin, Home, Edit, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskWithAssignee } from '../../types/people';
import { taskService } from '../../services/taskService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithAssignee | null;
  onTaskUpdate: () => void;
  onEditTask?: (task: TaskWithAssignee) => void;
}

interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
}

interface Lease {
  id: string;
  name: string;
}

interface RelatedTask {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  due_date?: string;
  description?: string;
}

export default function TaskDetailsDrawer({ isOpen, onClose, task, onTaskUpdate, onEditTask }: TaskDetailsDrawerProps) {
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState({
    relatedTasks: false,
    properties: false,
    leases: false
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Fetch related data when task changes
  useEffect(() => {
    if (task) {
      // Handle related tasks
      const relatedTaskIds: string[] = [];
      
      // Check for single ID
      if (task.relatedToId) {
        relatedTaskIds.push(task.relatedToId);
      }
      
      // Check for array of IDs
      if (task.relatedToIds && Array.isArray(task.relatedToIds) && task.relatedToIds.length > 0) {
        task.relatedToIds.forEach(id => {
          if (!relatedTaskIds.includes(id)) {
            relatedTaskIds.push(id);
          }
        });
      }
      
      console.log('Related task IDs:', relatedTaskIds);
      if (relatedTaskIds.length > 0) {
        fetchRelatedTasks(relatedTaskIds);
      } else {
        setRelatedTasks([]);
      }
      
      // Handle properties
      const propertyIds: string[] = [];
      
      // Check for single ID
      if (task.propertyId) {
        propertyIds.push(task.propertyId);
      }
      
      // Check for array of IDs
      if (task.propertyIds && Array.isArray(task.propertyIds) && task.propertyIds.length > 0) {
        task.propertyIds.forEach(id => {
          if (!propertyIds.includes(id)) {
            propertyIds.push(id);
          }
        });
      }
      
      console.log('Property IDs:', propertyIds);
      if (propertyIds.length > 0) {
        fetchProperties(propertyIds);
      } else {
        setProperties([]);
      }
      
      // Handle leases
      const leaseIds: string[] = [];
      
      // Check for single ID
      if (task.leaseId) {
        leaseIds.push(task.leaseId);
      }
      
      // Check for array of IDs
      if (task.leaseIds && Array.isArray(task.leaseIds) && task.leaseIds.length > 0) {
        task.leaseIds.forEach(id => {
          if (!leaseIds.includes(id)) {
            leaseIds.push(id);
          }
        });
      }
      
      console.log('Lease IDs:', leaseIds);
      if (leaseIds.length > 0) {
        fetchLeases(leaseIds);
      } else {
        setLeases([]);
      }
    }
  }, [task]);

  const fetchRelatedTasks = async (taskIds: string[]) => {
    if (!taskIds.length) return;
    
    try {
      setLoading(prev => ({ ...prev, relatedTasks: true }));
      console.log('Fetching related tasks with IDs:', taskIds);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          status, 
          priority, 
          due_date,
          description
        `)
        .in('id', taskIds);
      
      if (error) throw error;
      console.log('Related tasks data:', data);
      setRelatedTasks(data || []);
    } catch (err) {
      console.error('Error fetching related tasks:', err);
      toast.error('Failed to load related tasks');
    } finally {
      setLoading(prev => ({ ...prev, relatedTasks: false }));
    }
  };

  const fetchProperties = async (propertyIds: string[]) => {
    if (!propertyIds.length) return;
    
    try {
      setLoading(prev => ({ ...prev, properties: true }));
      console.log('Fetching properties with IDs:', propertyIds);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, 
          name, 
          address, 
          city, 
          state, 
          zip_code, 
          property_type
        `)
        .in('id', propertyIds);
      
      if (error) throw error;
      console.log('Properties data:', data);
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      toast.error('Failed to load property details');
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  };

  const fetchLeases = async (leaseIds: string[]) => {
    if (!leaseIds.length) return;
    
    try {
      setLoading(prev => ({ ...prev, leases: true }));
      console.log('Fetching leases with IDs:', leaseIds);
      
      // Get leases with tenant info
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id, 
          unit_id, 
          start_date, 
          end_date,
          tenant_id,
          tenants:tenant_id(first_name, last_name)
        `)
        .in('id', leaseIds);
      
      if (error) throw error;
      console.log('Leases data:', data);
      
      // Format lease data if found
      if (data && data.length > 0) {
        const formattedLeases = data.map(lease => {
          const tenantData = lease.tenants as any;
          let tenantName = 'Unknown Tenant';
          
          if (tenantData) {
            if (Array.isArray(tenantData)) {
              const tenant = tenantData[0];
              if (tenant && tenant.first_name && tenant.last_name) {
                tenantName = `${tenant.first_name} ${tenant.last_name}`;
              }
            } else if (tenantData.first_name && tenantData.last_name) {
              tenantName = `${tenantData.first_name} ${tenantData.last_name}`;
            }
          }

          return {
            id: lease.id,
            name: `${tenantName}\nfrom ${format(new Date(lease.start_date), 'MMM d, yyyy')} ${lease.end_date ? `to ${format(new Date(lease.end_date), 'MMM d, yyyy')}` : ''}`
          };
        });
        
        setLeases(formattedLeases);
      } else {
        setLeases([]);
      }
    } catch (err) {
      console.error('Error fetching leases:', err);
      toast.error('Failed to load lease information');
    } finally {
      setLoading(prev => ({ ...prev, leases: false }));
    }
  };

  if (!isOpen || !task) return null;

  // Function to check if we have related tasks
  const hasRelatedTasks = () => {
    return Boolean(
      task?.relatedToId || 
      (task?.relatedToIds && Array.isArray(task.relatedToIds) && task.relatedToIds.length > 0)
    );
  };

  // Function to check if we have related properties
  const hasRelatedProperties = () => {
    return Boolean(
      task?.propertyId || 
      (task?.propertyIds && Array.isArray(task.propertyIds) && task.propertyIds.length > 0)
    );
  };

  // Function to check if we have related leases
  const hasRelatedLeases = () => {
    return Boolean(
      task?.leaseId || 
      (task?.leaseIds && Array.isArray(task.leaseIds) && task.leaseIds.length > 0)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-purple-100 text-purple-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await taskService.updateTaskStatus(task.id, status);
      onTaskUpdate();
      toast.success(`Task marked as ${status === 'completed' ? 'complete' : 'reopened'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  const handleEditTask = () => {
    if (onEditTask && task) {
      console.log("TaskDetailsDrawer - Passing task for editing:", task);
      onEditTask(task);
      onClose();
    } else {
      console.error("TaskDetailsDrawer - Cannot edit task:", { onEditTask: !!onEditTask, task });
      toast.error('Edit functionality is not available');
    }
  };
  
  const handleDeleteTask = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    
    try {
      await taskService.deleteTask(task.id);
      onClose();
      onTaskUpdate();
      toast.success('Task deleted successfully');
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      setIsConfirmingDelete(false);
    }
  };

  return (
    <>
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl font-semibold text-[#2C3539]">Task Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEditTask}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDeleteTask}
                className={`p-2 ${isConfirmingDelete ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}
                title={isConfirmingDelete ? "Confirm Delete" : "Delete Task"}
              >
                {isConfirmingDelete ? <AlertCircle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => {
                  if (isConfirmingDelete) {
                    setIsConfirmingDelete(false);
                  } else {
                    onClose();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isConfirmingDelete ? "Cancel" : "Close"}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>

            {/* Owner Info */}
            {task.owner && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Owner
                </label>
                <div className="flex items-center space-x-3">
                  {task.owner.imageUrl ? (
                    <img
                      src={task.owner.imageUrl}
                      alt={task.owner.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#2C3539]">{task.owner.name}</span>
                    {task.owner.email && <span className="text-xs text-[#6B7280]">{task.owner.email}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Title and Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Title
                </label>
                <div className="text-[#2C3539] font-medium">
                  {task.title}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Description
                </label>
                <div className="text-[#2C3539] whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Due Date
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[#2C3539]">
                    {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            )}

            {/* Multiple Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Assigned To
                </label>
                <div className="space-y-2">
                  {task.assignees.map(assignee => (
                    <div key={assignee.id} className="flex items-center space-x-3">
                      {assignee.imageUrl ? (
                        <img
                          src={assignee.imageUrl}
                          alt={assignee.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#2C3539]">{assignee.name}</span>
                        {assignee.email && <span className="text-xs text-[#6B7280]">{assignee.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display a single assignee if no multiple assignees are available */}
            {(!task.assignees || task.assignees.length === 0) && task.assignee && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Assigned To
                </label>
                <div className="flex items-center space-x-3">
                  {task.assignee.imageUrl ? (
                    <img
                      src={task.assignee.imageUrl}
                      alt={task.assignee.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#2C3539]">{task.assignee.name}</span>
                    {task.assignee.email && <span className="text-xs text-[#6B7280]">{task.assignee.email}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Related Tasks */}
            {hasRelatedTasks() && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Related Tasks
                </label>
                {loading.relatedTasks ? (
                  <div className="text-center text-sm text-gray-500">Loading related tasks...</div>
                ) : relatedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {relatedTasks.map(relatedTask => (
                      <div key={relatedTask.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center mr-3">
                            <Link size={16} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-[#2C3539]">{relatedTask.title}</h4>
                              {relatedTask.status && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(relatedTask.status)}`}>
                                  {relatedTask.status}
                                </span>
                              )}
                            </div>
                            {relatedTask.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{relatedTask.description}</p>
                            )}
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              {relatedTask.priority && (
                                <span className={`mr-3 px-1.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(relatedTask.priority)}`}>
                                  {relatedTask.priority}
                                </span>
                              )}
                              {relatedTask.due_date && (
                                <span className="flex items-center">
                                  <Calendar size={10} className="mr-1" />
                                  {format(new Date(relatedTask.due_date), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No related tasks found</div>
                )}
              </div>
            )}

            {/* Properties */}
            {hasRelatedProperties() && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Related Properties
                </label>
                {loading.properties ? (
                  <div className="text-center text-sm text-gray-500">Loading property details...</div>
                ) : properties.length > 0 ? (
                  <div className="space-y-2">
                    {properties.map(property => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex-shrink-0 flex items-center justify-center mr-3">
                            <Home size={16} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-[#2C3539]">{property.name}</h4>
                              {property.property_type && (
                                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                                  {property.property_type}
                                </span>
                              )}
                            </div>
                            {property.address && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin size={12} className="mr-1 flex-shrink-0" />
                                <span className="line-clamp-2">
                                  {property.address}
                                  {(property.city || property.state || property.zip_code) && (
                                    <>, {[property.city, property.state, property.zip_code].filter(Boolean).join(', ')}</>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Property information not available</div>
                )}
              </div>
            )}

            {/* Leases */}
            {hasRelatedLeases() && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">
                  Related Leases
                </label>
                {loading.leases ? (
                  <div className="text-center text-sm text-gray-500">Loading lease details...</div>
                ) : leases.length > 0 ? (
                  <div className="space-y-2">
                    {leases.map(lease => (
                      <div key={lease.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex-shrink-0 flex items-center justify-center mr-3">
                            <Users2 size={16} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-[#2C3539]">{lease.name.split('\n')[0]}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {lease.name.split('\n')[1]}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Lease information not available</div>
                )}
              </div>
            )}

            {/* Created/Updated Info */}
            {(task.createdAt || task.updatedAt) && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {task.createdAt && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created</span>
                    <span>{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
                {task.updatedAt && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last Updated</span>
                    <span>{format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Deletion confirmation message */}
            {isConfirmingDelete && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                <p className="font-medium">Are you sure you want to delete this task?</p>
                <p className="text-sm mt-1">This action cannot be undone.</p>
                <div className="flex mt-3 space-x-2">
                  <button 
                    onClick={handleDeleteTask} 
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Yes, Delete
                  </button>
                  <button 
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                >
                  Mark as Complete
                </button>
              )}
              {task.status === 'completed' && (
                <button
                  onClick={() => handleStatusChange('in progress')}
                  className="w-full py-2 border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reopen Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
