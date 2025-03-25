import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, Clock, Link, ChevronDown, Check, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskWithAssignee } from '../../types/people';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  imageUrl?: string;
  email?: string;
}

interface Property {
  id: string;
  name: string;
}

interface Lease {
  id: string;
  name: string;
}

interface RelatedTask {
  id: string;
  title: string;
}

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => Promise<void>;
  users: User[];
  currentUser: User;
  isEditing?: boolean;
  taskToEdit?: TaskWithAssignee | null;
}

export default function TaskDrawer({ 
  isOpen, 
  onClose, 
  onSubmit, 
  users, 
  currentUser, 
  isEditing = false, 
  taskToEdit = null 
}: TaskDrawerProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    assignedTo: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high',
    type: 'team' as 'team',
    relatedToIds: [] as string[],
    propertyIds: [] as string[],
    leaseIds: [] as string[]
  });
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<RelatedTask[]>([]);
  const [loading, setLoading] = useState({
    properties: false,
    leases: false,
    tasks: false
  });
  
  // Dropdown states
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isLeaseDropdownOpen, setIsLeaseDropdownOpen] = useState(false);
  
  // Search states
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [leaseSearchQuery, setLeaseSearchQuery] = useState('');
  
  // Refs for dropdowns
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const taskDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const leaseDropdownRef = useRef<HTMLDivElement>(null);

  // Store taskToEdit in a ref to track changes
  const prevTaskToEditRef = useRef<TaskWithAssignee | null>(null);
  
  // Handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close assignee dropdown
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
      
      // Close task dropdown
      if (taskDropdownRef.current && !taskDropdownRef.current.contains(event.target as Node)) {
        setIsTaskDropdownOpen(false);
      }
      
      // Close property dropdown
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
        setIsPropertyDropdownOpen(false);
      }
      
      // Close lease dropdown
      if (leaseDropdownRef.current && !leaseDropdownRef.current.contains(event.target as Node)) {
        setIsLeaseDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debug props when component mounts and when they change
  useEffect(() => {
    console.log("TaskDrawer props received:", { 
      isOpen, 
      isEditing, 
      taskToEdit: taskToEdit ? { ...taskToEdit } : null
    });
  }, [isOpen, isEditing, taskToEdit]);

  // Fetch related data on component mount
  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchLeases();
      fetchRelatedTasks();
    }
  }, [isOpen]);

  // Load task data when in edit mode
  useEffect(() => {
    console.log("TaskDrawer edit mode check:", { isEditing, taskToEdit, isOpen });
    
    // Check if taskToEdit changed (not just on mount)
    const taskToEditChanged = taskToEdit !== prevTaskToEditRef.current;
    prevTaskToEditRef.current = taskToEdit;
    
    if (isEditing) {
      if (!taskToEdit) {
        console.error("TaskDrawer: isEditing is true but taskToEdit is null. This indicates a prop passing issue in the parent component.");
        toast.error("Error loading task data. Please close and try again.");
        return;
      }
      
      console.log("TaskDrawer editing task:", taskToEdit, "changed:", taskToEditChanged);
      if (!taskToEditChanged && formData.id === taskToEdit.id) {
        console.log("Task already loaded in form, skipping");
        return;
      }
      
      try {
        // Format the due date properly
        let formattedDueDate = format(new Date(), "yyyy-MM-dd'T'HH:mm");
        if (taskToEdit.dueDate) {
          // Handle different date formats
          const dueDate = new Date(taskToEdit.dueDate);
          if (!isNaN(dueDate.getTime())) {
            formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm");
          }
        }
        
        // Get assigned users
        let assignedUsers: string[] = [];
        if (taskToEdit.assignees && taskToEdit.assignees.length > 0) {
          assignedUsers = taskToEdit.assignees.map(assignee => assignee.id);
        } else if (taskToEdit.assignee && taskToEdit.assignee.id) {
          assignedUsers = [taskToEdit.assignee.id];
        } else if (Array.isArray(taskToEdit.assignedTo)) {
          assignedUsers = taskToEdit.assignedTo;
        }
        
        // Convert single values to arrays for multi-select fields
        const relatedToIds = taskToEdit.relatedToIds && taskToEdit.relatedToIds.length > 0 
          ? [...taskToEdit.relatedToIds] 
          : taskToEdit.relatedToId ? [taskToEdit.relatedToId] : [];
          
        const propertyIds = taskToEdit.propertyIds && taskToEdit.propertyIds.length > 0
          ? [...taskToEdit.propertyIds]
          : taskToEdit.propertyId ? [taskToEdit.propertyId] : [];
          
        const leaseIds = taskToEdit.leaseIds && taskToEdit.leaseIds.length > 0
          ? [...taskToEdit.leaseIds]
          : taskToEdit.leaseId ? [taskToEdit.leaseId] : [];
        
        const newFormData = {
          id: taskToEdit.id || '',
          title: taskToEdit.title || '',
          description: taskToEdit.description || '',
          dueDate: formattedDueDate,
          assignedTo: assignedUsers,
          priority: (taskToEdit.priority as 'low' | 'medium' | 'high') || 'medium',
          type: 'team' as 'team', // Explicitly type as 'team'
          relatedToIds: relatedToIds,
          propertyIds: propertyIds,
          leaseIds: leaseIds
        };
        
        console.log("Setting form data with:", newFormData);
        setFormData(newFormData);
        
      } catch (error) {
        console.error("Error setting form data for editing:", error);
        toast.error("An error occurred while loading task data");
        // Still keep edit mode but with reset form
        resetForm();
      }
    } else {
      // Reset form when not editing
      resetForm();
    }
  }, [isEditing, taskToEdit, isOpen]);

  const fetchProperties = async () => {
    try {
      setLoading(prev => ({ ...prev, properties: true }));
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      toast.error('Failed to load properties');
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  };

  const fetchLeases = async () => {
    try {
      setLoading(prev => ({ ...prev, leases: true }));
      // Try using the tenant_id foreign key directly
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
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      // Format leases to have a readable name
      const formattedLeases = data?.map(lease => {
        // Create full tenant name by combining first and last name
        // Access tenants properly based on the foreign key relationship
        let tenantName = 'Unknown Tenant';
        
        // Use type assertion to help TypeScript understand the structure
        const tenantData = lease.tenants as any;
        
        if (tenantData) {
          if (Array.isArray(tenantData)) {
            // Handle array case if the relation returns an array
            const tenant = tenantData[0];
            if (tenant && tenant.first_name && tenant.last_name) {
              tenantName = `${tenant.first_name} ${tenant.last_name}`;
            }
          } else if (tenantData.first_name && tenantData.last_name) {
            // Handle object case if the relation returns a single object
            tenantName = `${tenantData.first_name} ${tenantData.last_name}`;
          }
        }

        return {
          id: lease.id,
          name: `${tenantName}\nfrom ${format(new Date(lease.start_date), 'MMM d, yyyy')} ${lease.end_date ? `to ${format(new Date(lease.end_date), 'MMM d, yyyy')}` : ''}`
        };
      }) || [];
      
      setLeases(formattedLeases);
    } catch (err) {
      console.error('Error fetching leases:', err);
      toast.error('Failed to load lease information');
    } finally {
      setLoading(prev => ({ ...prev, leases: false }));
    }
  };

  const fetchRelatedTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent tasks
      
      if (error) throw error;
      setRelatedTasks(data || []);
    } catch (err) {
      console.error('Error fetching related tasks:', err);
      toast.error('Failed to load related tasks');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error("Please provide a task title");
        setIsSubmitting(false);
        return;
      }
      
      // Check if assignees are selected
      if (!formData.assignedTo || formData.assignedTo.length === 0) {
        toast('No assignees selected for this task', {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E'
          }
        });
        
        // Prompt user if they want to continue without assignees
        if (!window.confirm("Are you sure you want to " + (isEditing ? "update" : "create") + " this task without assignees?")) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Show loading toast
      const loadingToast = toast.loading(isEditing ? 'Updating task...' : 'Creating task...');
      
      // Add both single values for backward compatibility and keep the array fields for multi-select
      const taskData = {
        ...formData,
        relatedToId: formData.relatedToIds.length > 0 ? formData.relatedToIds[0] : null,
        propertyId: formData.propertyIds.length > 0 ? formData.propertyIds[0] : null,
        leaseId: formData.leaseIds.length > 0 ? formData.leaseIds[0] : null,
        id: isEditing ? formData.id : undefined // Include ID only when editing
      };
      
      // Log the task data being sent
      console.log('Submitting task with data:', taskData);
      console.log('Related task IDs:', taskData.relatedToIds);
      console.log('Property IDs:', taskData.propertyIds);
      console.log('Lease IDs:', taskData.leaseIds);
      
      await onSubmit(taskData);
      
      // Only reset the form and close the drawer if submission was successful
      resetForm();
      onClose();
      toast.success(isEditing ? 'Task updated successfully!' : 'Task created successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error(isEditing ? "Failed to update task:" : "Failed to create task:", error);
      let errorMessage = error.message || "An unknown error occurred";
      
      // Check for specific error messages
      if (errorMessage.includes("No valid user IDs")) {
        errorMessage = "The selected assignees don't exist in the database. Please select different users.";
      } else if (errorMessage.includes("Failed to assign users")) {
        errorMessage = "Task was " + (isEditing ? "updated" : "created") + " but could not assign the selected users. Please try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      assignedTo: [],
      priority: 'medium',
      type: 'team',
      relatedToIds: [],
      propertyIds: [],
      leaseIds: []
    });
  };

  // Generic toggle function for multi-select fields
  const toggleSelection = (id: string, fieldName: 'assignedTo' | 'relatedToIds' | 'propertyIds' | 'leaseIds') => {
    try {
      setFormData(prev => {
        const currentValues = prev[fieldName];
        const updatedValues = currentValues.includes(id)
          ? currentValues.filter(item => item !== id)
          : [...currentValues, id];
        return { ...prev, [fieldName]: updatedValues };
      });
    } catch (err) {
      console.error(`Error toggling ${fieldName} selection:`, err);
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
  );

  const filteredTasks = relatedTasks.filter(task =>
    task.title.toLowerCase().includes(taskSearchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );

  const filteredLeases = leases.filter(lease =>
    lease.name.toLowerCase().includes(leaseSearchQuery.toLowerCase())
  );

  // Get selected item names for display
  const selectedUserNames = formData.assignedTo
    .map(id => users.find(user => user.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const selectedTaskNames = formData.relatedToIds
    .map(id => relatedTasks.find(task => task.id === id)?.title)
    .filter(Boolean)
    .join(', ');

  const selectedPropertyNames = formData.propertyIds
    .map(id => properties.find(property => property.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const selectedLeaseNames = formData.leaseIds
    .map(id => leases.find(lease => lease.id === id)?.name?.split('\n')[0])
    .filter(Boolean)
    .join(', ');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-[#2C3539]">{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Owner */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">
              Owner
            </label>
            <div className="flex items-center space-x-3">
              {isEditing && taskToEdit && taskToEdit.owner ? (
                // Show the task's actual owner when editing
                <>
                  {taskToEdit.owner.imageUrl ? (
                    <img
                      src={taskToEdit.owner.imageUrl}
                      alt={taskToEdit.owner.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{taskToEdit.owner.name}</span>
                    {taskToEdit.owner.email && <span className="text-xs text-gray-500">{taskToEdit.owner.email}</span>}
                  </div>
                </>
              ) : (
                // Show the current user when adding
                <>
                  {currentUser.imageUrl ? (
                    <img
                      src={currentUser.imageUrl}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{currentUser.name}</span>
                    {currentUser.email && <span className="text-xs text-gray-500">{currentUser.email}</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm text-[#6B7280] block">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm text-[#6B7280] block">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent appearance-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm text-[#6B7280] block">
              Due Date
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
            />
          </div>

          {/* Multiple Assignees Dropdown */}
          <div className="space-y-2" ref={assigneeDropdownRef}>
            <label className="text-sm text-[#6B7280] block">
              Assignees
            </label>
            <div className="relative">
              {/* Dropdown Trigger */}
              <div 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-300"
                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
              >
                <div className="truncate">
                  {formData.assignedTo.length > 0 
                    ? selectedUserNames
                    : <span className="text-gray-400">Select assignees</span>
                  }
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>

              {/* Dropdown Menu */}
              {isAssigneeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search people..."
                        className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C3539]"
                        value={assigneeSearchQuery}
                        onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* User List */}
                  <div>
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(user.id, 'assignedTo');
                        }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <span className="text-sm">{user.name}</span>
                        </div>
                        {formData.assignedTo.includes(user.id) && (
                          <Check className="h-5 w-5 text-[#2C3539]" />
                        )}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Task Dropdown - Multi-select version */}
          <div className="space-y-2" ref={taskDropdownRef}>
            <label className="text-sm text-[#6B7280] block">
              Related Tasks
            </label>
            <div className="relative">
              {/* Dropdown Trigger */}
              <div 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-300"
                onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
              >
                <div className="truncate">
                  {formData.relatedToIds.length > 0 
                    ? selectedTaskNames
                    : <span className="text-gray-400">None</span>
                  }
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>

              {/* Dropdown Menu */}
              {isTaskDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C3539]"
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Clear option */}
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, relatedToIds: [] }));
                    }}
                  >
                    <span className="text-sm font-medium">Clear all</span>
                  </div>
                  
                  {/* Task List */}
                  <div>
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                      <div 
                        key={task.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(task.id, 'relatedToIds');
                        }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm">{task.title}</span>
                        </div>
                        {formData.relatedToIds.includes(task.id) && (
                          <Check className="h-5 w-5 text-[#2C3539]" />
                        )}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No tasks found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Dropdown - Multi-select version */}
          <div className="space-y-2" ref={propertyDropdownRef}>
            <label className="text-sm text-[#6B7280] block">
              Related Properties
            </label>
            <div className="relative">
              {/* Dropdown Trigger */}
              <div 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-300"
                onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
              >
                <div className="truncate">
                  {formData.propertyIds.length > 0 
                    ? selectedPropertyNames
                    : <span className="text-gray-400">None</span>
                  }
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>

              {/* Dropdown Menu */}
              {isPropertyDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search properties..."
                        className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C3539]"
                        value={propertySearchQuery}
                        onChange={(e) => setPropertySearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Clear option */}
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, propertyIds: [] }));
                    }}
                  >
                    <span className="text-sm font-medium">Clear all</span>
                  </div>
                  
                  {/* Property List */}
                  <div>
                    {filteredProperties.length > 0 ? filteredProperties.map(property => (
                      <div 
                        key={property.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(property.id, 'propertyIds');
                        }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm">{property.name}</span>
                        </div>
                        {formData.propertyIds.includes(property.id) && (
                          <Check className="h-5 w-5 text-[#2C3539]" />
                        )}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No properties found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lease Dropdown - Multi-select version */}
          <div className="space-y-2" ref={leaseDropdownRef}>
            <label className="text-sm text-[#6B7280] block">
              Related Leases
            </label>
            <div className="relative">
              {/* Dropdown Trigger */}
              <div 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-300"
                onClick={() => setIsLeaseDropdownOpen(!isLeaseDropdownOpen)}
              >
                <div className="truncate">
                  {formData.leaseIds.length > 0 
                    ? selectedLeaseNames
                    : <span className="text-gray-400">None</span>
                  }
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>

              {/* Dropdown Menu */}
              {isLeaseDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search leases..."
                        className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C3539]"
                        value={leaseSearchQuery}
                        onChange={(e) => setLeaseSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Clear option */}
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, leaseIds: [] }));
                    }}
                  >
                    <span className="text-sm font-medium">Clear all</span>
                  </div>
                  
                  {/* Lease List */}
                  <div>
                    {filteredLeases.length > 0 ? filteredLeases.map(lease => (
                      <div 
                        key={lease.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(lease.id, 'leaseIds');
                        }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm">{lease.name}</span>
                        </div>
                        {formData.leaseIds.includes(lease.id) && (
                          <Check className="h-5 w-5 text-[#2C3539]" />
                        )}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No leases found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm text-[#6B7280] block">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent min-h-[100px]"
              placeholder="Enter task description"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
