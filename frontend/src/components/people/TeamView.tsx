import React, { useState, useEffect, useRef } from 'react';
import { Activity, Plus, Search, Filter, Users2, Wrench, User, X, Check } from 'lucide-react';
import { TeamMember, Task, Activity as ActivityType, TaskWithAssignee } from '../../types/people';
import { format } from 'date-fns';
import TeamMemberCard from './TeamMemberCard';
import AddPersonDialog from './AddPersonDialog';
import TaskDrawer from './TaskDrawer';
import TaskDetailsDrawer from './TaskDetailsDrawer';
import TeamDetailsDrawer from './TeamDetailsDrawer';
import { mockTeamMembers } from '../../data/mockTeamData';
import TeamMembersList from './TeamMembersList';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: TaskWithAssignee[];
  activities: ActivityType[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TeamView({ teamMembers = [], tasks: initialTasks = [], activities = [] }: TeamViewProps) {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Keep separate state variables for better control
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  
  // Use ref to store current editing task to avoid batching issues
  const editingTaskRef = useRef<TaskWithAssignee | null>(null);
  
  const { user, userProfile } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const organizationId = userProfile?.organization_id;
      
      // Log the organization ID for debugging
      console.log('Fetching tasks with organization ID:', organizationId);
      
      if (!organizationId) {
        console.warn('Organization ID is undefined or null. Will fetch tasks without organization filter.');
      }
      
      const fetchedTasks = await taskService.getTasks(organizationId);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Add organization ID from user profile
      const taskWithOrg = {
        ...taskData,
        organizationId: userProfile?.organization_id
      };
      
      await taskService.createTask(taskWithOrg, user);
      
      // Refresh tasks list
      fetchTasks();
      toast.success('Task created successfully!');
    } catch (err: any) {
      console.error('Error creating task:', err);
      
      // Create a more user-friendly error message
      let errorMessage = 'Failed to create task';
      
      if (err.message) {
        if (err.message.includes('No valid user IDs')) {
          errorMessage = 'The selected team members could not be found in the database. Please select different users.';
        } else if (err.message.includes('Failed to assign users')) {
          errorMessage = 'Task was created but assignees could not be added. Please check user IDs.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      toast.error(errorMessage);
      
      // Re-throw the error to be caught by the TaskDrawer
      throw err;
    }
  };

  const handleTaskClick = (task: TaskWithAssignee) => {
    // For viewing details, use both ref and state
    editingTaskRef.current = null; // Clear editing ref
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleTeamMemberClick = (member: TeamMember) => {
    setSelectedTeamMember(member);
    setIsTeamDetailsOpen(true);
  };

  const handleEditTask = (task: TaskWithAssignee) => {
    console.log("TeamView.handleEditTask - Setting task for editing:", task);
    
    // Verify task is not null and has required properties
    if (!task || !task.id) {
      console.error("TeamView.handleEditTask - Received invalid task:", task);
      toast.error("Cannot edit task: Invalid task data");
      return;
    }
    
    // Create a deep copy of the task to avoid reference issues
    const taskCopy = JSON.parse(JSON.stringify(task)) as TaskWithAssignee;
    console.log("TeamView.handleEditTask - Creating task copy:", taskCopy);
    
    // Store task in ref for immediate access
    editingTaskRef.current = taskCopy;
    
    // Close the details drawer first
    setIsTaskDetailsOpen(false);
    
    // Update state (which will trigger re-renders)
    setSelectedTask(taskCopy);
    setIsEditingTask(true);
    setIsAddTaskDrawerOpen(true);
    
    // Verify the props are correct
    console.log("TaskDrawer should receive: isEditing=true, taskToEdit=", taskCopy);
  };

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Add organization ID from user profile
      const organizationId = userProfile?.organization_id;
      
      // Log the organization ID and task data for debugging
      console.log('Submitting task with organization ID:', organizationId);
      console.log('Task data received from form:', taskData);
      console.log('Multi-select fields:');
      console.log('- Related task IDs:', taskData.relatedToIds);
      console.log('- Property IDs:', taskData.propertyIds);
      console.log('- Lease IDs:', taskData.leaseIds);
      
      const taskWithOrg = {
        ...taskData,
        organizationId: organizationId
      };
      
      if (isEditingTask && editingTaskRef.current) {
        // Update existing task
        console.log('Updating existing task with ID:', editingTaskRef.current.id);
        await taskService.updateTask({
          ...taskWithOrg,
          id: editingTaskRef.current.id
        }, user);
        toast.success('Task updated successfully!');
      } else {
        // Create new task
        console.log('Creating new task');
        await taskService.createTask(taskWithOrg, user);
        toast.success('Task created successfully!');
      }
      
      // Refresh tasks list
      fetchTasks();
      
      // Reset drawer state
      handleTaskDrawerClose();
    } catch (err: any) {
      console.error(isEditingTask ? 'Error updating task:' : 'Error creating task:', err);
      
      // Create a more user-friendly error message
      let errorMessage = isEditingTask ? 'Failed to update task' : 'Failed to create task';
      
      if (err.message) {
        if (err.message.includes('No valid user IDs')) {
          errorMessage = 'The selected team members could not be found in the database. Please select different users.';
        } else if (err.message.includes('Failed to assign users')) {
          errorMessage = `Task was ${isEditingTask ? 'updated' : 'created'} but assignees could not be added. Please check user IDs.`;
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      toast.error(errorMessage);
      
      // Re-throw the error to be caught by the TaskDrawer
      throw err;
    }
  };

  const handleTaskDrawerClose = () => {
    // Clear both state and ref
    editingTaskRef.current = null;
    setIsTaskDetailsOpen(false);
    setIsAddTaskDrawerOpen(false);
    setIsEditingTask(false);
    setSelectedTask(null);
  };

  // Handle clicking outside the filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Toggle priority filter
  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority) 
        : [...prev, priority]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
  };

  const filteredTasks = tasks?.filter(task => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignee?.name && task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(task.status);
    
    // Priority filter
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(task.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-8">
        {/* Team Members Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TeamMembersList 
            members={teamMembers} 
            onMemberClick={handleTeamMemberClick}
            onAddMember={() => setIsAddMemberDialogOpen(true)}
          />
        </div>

        {/* Tasks and Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#2C3539]">All Tasks</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative" ref={filterRef}>
                  <button 
                    className={`h-9 w-9 flex items-center justify-center border ${isFilterOpen || statusFilters.length > 0 || priorityFilters.length > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg hover:bg-gray-50 transition-colors`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className={`w-4 h-4 ${isFilterOpen || statusFilters.length > 0 || priorityFilters.length > 0 ? 'text-blue-500' : 'text-[#2C3539]'}`} />
                  </button>
                  
                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-sm text-[#2C3539]">Filter Tasks</h3>
                        <button 
                          onClick={clearFilters}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      {/* Status Filters */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 mb-2">Status</h4>
                        <div className="space-y-2">
                          {['new', 'in progress', 'pending', 'completed'].map(status => (
                            <div key={status} className="flex items-center">
                              <button
                                onClick={() => toggleStatusFilter(status)}
                                className={`w-4 h-4 rounded flex items-center justify-center ${statusFilters.includes(status) ? 'bg-blue-500' : 'border border-gray-300'}`}
                              >
                                {statusFilters.includes(status) && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <span className="ml-2 text-sm text-[#2C3539] capitalize">{status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Priority Filters */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2">Priority</h4>
                        <div className="space-y-2">
                          {['low', 'medium', 'high'].map(priority => (
                            <div key={priority} className="flex items-center">
                              <button
                                onClick={() => togglePriorityFilter(priority)}
                                className={`w-4 h-4 rounded flex items-center justify-center ${priorityFilters.includes(priority) ? 'bg-blue-500' : 'border border-gray-300'}`}
                              >
                                {priorityFilters.includes(priority) && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <span className="ml-2 text-sm text-[#2C3539] capitalize">{priority}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    editingTaskRef.current = null;
                    setIsAddTaskDrawerOpen(true);
                    setIsEditingTask(false);
                    setSelectedTask(null);
                  }}
                  className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Display active filters if any */}
            {(statusFilters.length > 0 || priorityFilters.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {statusFilters.map(status => (
                  <div key={status} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <span className="capitalize">{status}</span>
                    <button 
                      onClick={() => toggleStatusFilter(status)}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {priorityFilters.map(priority => (
                  <div key={priority} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <span className="capitalize">{priority} priority</span>
                    <button 
                      onClick={() => togglePriorityFilter(priority)}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C3539]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg text-red-600">
                {error}
                <button 
                  onClick={fetchTasks}
                  className="ml-4 px-3 py-1 bg-red-100 rounded-md hover:bg-red-200 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks found. Create a task to get started.
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-[#2C3539]">{task.title}</h3>
                          <p className="text-sm text-[#6B7280] mt-1">{task.description}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          {task.assignees && task.assignees.length > 0 ? (
                            <div className="flex -space-x-2 overflow-hidden">
                              {task.assignees.slice(0, 3).map((assignee, index) => (
                                <div key={assignee.id} className="relative group">
                                  {assignee.imageUrl ? (
                                    <img
                                      src={assignee.imageUrl}
                                      alt={assignee.name}
                                      className="w-6 h-6 rounded-full object-cover border border-white"
                                      title={assignee.name}
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border border-white">
                                      <User className="w-3 h-3 text-gray-500" />
                                    </div>
                                  )}
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                    {assignee.name}
                                  </span>
                                </div>
                              ))}
                              {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-white relative group">
                                  +{task.assignees.length - 3}
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                    {task.assignees.slice(3).map(a => a.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-500" />
                              </div>
                              <span className="text-sm text-[#6B7280]">Unassigned</span>
                            </div>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className="text-sm text-[#6B7280]">
                            Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Activity className="w-5 h-5 text-[#2C3539] mr-2" />
              <h2 className="text-lg font-semibold text-[#2C3539]">Recent Activities</h2>
            </div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {activity.user?.imageUrl ? (
                    <img
                      src={activity.user.imageUrl}
                      alt={activity.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2C3539]">
                      <span className="font-medium">{activity.user?.name}</span>
                      {' '}{activity.action}{' '}
                      <span className="text-[#6B7280]">{activity.target}</span>
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Drawers */}
      <AddPersonDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        personType="team"
      />

      <TaskDrawer
        isOpen={isAddTaskDrawerOpen}
        onClose={handleTaskDrawerClose}
        onSubmit={handleTaskSubmit}
        users={teamMembers.map(member => {
          const userId = member.user_id;
          return {
            id: userId || member.id,
            name: member.name,
            imageUrl: member.imageUrl,
            email: member.email
          };
        })}
        currentUser={{
          id: userProfile?.id || user?.id || '',
          name: userProfile?.full_name || user?.user_metadata?.name || user?.email || 'Current User',
          email: user?.email || '',
          imageUrl: userProfile?.avatar_url || user?.user_metadata?.avatar_url || ''
        }}
        isEditing={isEditingTask}
        taskToEdit={isEditingTask ? editingTaskRef.current : null}
      />

      <TaskDetailsDrawer
        isOpen={isTaskDetailsOpen}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onTaskUpdate={fetchTasks}
        onEditTask={handleEditTask}
      />

      <TeamDetailsDrawer
        isOpen={isTeamDetailsOpen}
        onClose={() => {
          setIsTeamDetailsOpen(false);
          setSelectedTeamMember(null);
        }}
        teamMember={selectedTeamMember}
        onUpdate={() => {
          console.log('Team member updated, refreshing list...');
        }}
      />
    </div>
  );
}