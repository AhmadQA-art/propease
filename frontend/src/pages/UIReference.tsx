import React, { useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { 
  Edit2, Building2, DoorOpen, UserCog, Users2, DollarSign, 
  Home, PercentCircle, Image as ImageIcon, MapPin, 
  ClipboardList, FileText, Plus, Warehouse, Search,
  X, Filter, User, Mail, Phone, Briefcase,
  Activity, Star, Calendar, Wrench, MoreVertical, Clock,
  Eye
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import AddPersonDialog from '../components/people/AddPersonDialog';
import { format } from 'date-fns';
import AddTaskDrawer from '../components/rental-details/AddTaskDrawer';
import TaskDetailsDrawer from '../components/rental-details/TaskDetailsDrawer';

// Add this helper function from your existing code
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Type for the Link component
const StyledLink = Link as React.ComponentType<LinkProps>;

// Type for Lucide icons
const StyledIcon = ({ icon: Icon, ...props }: { icon: React.ComponentType<LucideProps> } & LucideProps) => (
  <Icon {...props} />
);

export default function UIReference(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Add mock data
  const mockTeamMembers = [
    {
      id: '1',
      name: 'John Doe',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Property Manager'
    },
    {
      id: '2',
      name: 'Jane Smith',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Maintenance Manager'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      imageUrl: null,
      role: 'Leasing Agent'
    }
  ];

  // Mock tasks data
  const mockTasks = [
    {
      id: '1',
      title: 'Review lease renewal for Unit 304',
      description: 'Review and approve lease renewal documentation for tenant in Unit 304',
      dueDate: '2024-03-20',
      status: 'pending',
      type: 'team',
      assignee: {
        name: 'Sarah Johnson',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      owner: {
        name: 'Michael Chen',
        imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      comments: []
    },
    {
      id: '2',
      title: 'Schedule maintenance inspection',
      description: 'Coordinate with maintenance team for quarterly inspection of Building A',
      dueDate: '2024-03-25',
      status: 'completed',
      type: 'maintenance',
      assignee: {
        name: 'David Kim',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      owner: {
        name: 'Emily Rodriguez',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      comments: []
    }
  ];

  // Mock activities data
  const mockActivities = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      action: 'completed',
      target: 'lease renewal review for Unit 304',
      timestamp: new Date(2024, 2, 15, 14, 30)
    },
    {
      id: '2',
      user: {
        name: 'Michael Chen',
        imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      action: 'assigned',
      target: 'maintenance inspection to David',
      timestamp: new Date(2024, 2, 15, 13, 15)
    }
  ];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">UI Reference</h1>
        <p className="text-[#6B7280] mt-1">Component library and style guide</p>
      </div>

      {/* Component Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Common Components Card */}
        <StyledLink 
          to="/ui-reference/common" 
          className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
        >
          <h2 className="text-lg font-semibold text-[#2C3539]">Common Components</h2>
          <p className="text-[#6B7280] mt-1">Buttons, forms, cards, and basic UI elements</p>
        </StyledLink>
        
        {/* Add more component category cards here */}
      </div>
        {/* People Components Card */}
        <StyledLink 
          to="/ui-reference/people" 
          className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
        >
          <h2 className="text-lg font-semibold text-[#2C3539]">People Components</h2>
          <p className="text-[#6B7280] mt-1">Person cards and profile components</p>
        </StyledLink>

        {/* Team Components Card */}
        <StyledLink 
          to="/ui-reference/team" 
          className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
        >
          <h2 className="text-lg font-semibold text-[#2C3539]">Team Components</h2>
          <p className="text-[#6B7280] mt-1">Team member cards and management components</p>
        </StyledLink>

      {/* Tasks Components Card */}
      <StyledLink 
        to="/ui-reference/tasks" 
        className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
      >
        <h2 className="text-lg font-semibold text-[#2C3539]">Task Components</h2>
        <p className="text-[#6B7280] mt-1">Task cards and management components</p>
      </StyledLink>
      {/* Activities Components Card */}
      <StyledLink 
        to="/ui-reference/activities" 
        className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
      >
        <h2 className="text-lg font-semibold text-[#2C3539]">Activities Components</h2>
        <p className="text-[#6B7280] mt-1">Activity feeds and timeline components</p>
      </StyledLink>
{/* Rental Components Card */}
<StyledLink 
  to="/ui-reference/rentals" 
  className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
>
  <h2 className="text-lg font-semibold text-[#2C3539]">Rental Components</h2>
  <p className="text-[#6B7280] mt-1">Rental cards and property management components</p>
</StyledLink>

{/* Rental Overview Card */}
<StyledLink 
  to="/ui-reference/rental-overview" 
  className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
>
  <h2 className="text-lg font-semibold text-[#2C3539]">Rental Overview</h2>
  <p className="text-[#6B7280] mt-1">Detailed rental property overview components</p>
</StyledLink>
      {/* Tables Components Card */}
      <StyledLink 
        to="/ui-reference/tables" 
        className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
      >
        <h2 className="text-lg font-semibold text-[#2C3539]">Table Components</h2>
        <p className="text-[#6B7280] mt-1">Data tables and list views</p>
      </StyledLink>

{/* Units Components Card */}
<StyledLink 
  to="/ui-reference/units" 
  className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
>
  <h2 className="text-lg font-semibold text-[#2C3539]">Units Components</h2>
  <p className="text-[#6B7280] mt-1">Unit cards and management components</p>
</StyledLink>

{/* Rental Applications Card */}
<StyledLink 
  to="/ui-reference/rental-applications" 
  className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
>
  <h2 className="text-lg font-semibold text-[#2C3539]">Rental Applications</h2>
  <p className="text-[#6B7280] mt-1">Application management and review components</p>
</StyledLink>

      {/* Rental Activities Card */}
      <StyledLink 
        to="/ui-reference/rental-activities" 
        className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
      >
        <h2 className="text-lg font-semibold text-[#2C3539]">Rental Activities</h2>
        <p className="text-[#6B7280] mt-1">Property-specific activity tracking and history</p>
      </StyledLink>

      {/* Rental Tasks Card */}
      <StyledLink 
        to="/ui-reference/rental-tasks" 
        className="block p-6 border border-gray-200 rounded-xl hover:border-[#2C3539] transition-colors"
      >
        <h2 className="text-lg font-semibold text-[#2C3539]">Rental Tasks</h2>
        <p className="text-[#6B7280] mt-1">Property-specific task management and tracking</p>
      </StyledLink>

      {/* Dialogs & Drawers Preview Section */}
      <div className="mt-12 space-y-8">
        <h2 className="text-xl font-semibold text-[#2C3539]">Interactive Previews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Person Dialog Preview */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-[#2C3539] mb-2">Add Person Dialog</h3>
            <p className="text-sm text-[#6B7280] mb-4">Modal dialog for adding team members</p>
            <button
              onClick={() => setIsAddMemberDialogOpen(true)}
              className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Open Dialog
            </button>
          </div>

          {/* Add Task Drawer Preview */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-[#2C3539] mb-2">Add Task Drawer</h3>
            <p className="text-sm text-[#6B7280] mb-4">Slide-in drawer for creating new tasks</p>
            <button
              onClick={() => setIsAddTaskDrawerOpen(true)}
              className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Open Drawer
            </button>
          </div>

          {/* Task Details Drawer Preview */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-[#2C3539] mb-2">Task Details Drawer</h3>
            <p className="text-sm text-[#6B7280] mb-4">Slide-in drawer for viewing task details</p>
            <button
              onClick={() => setIsTaskDetailsOpen(true)}
              className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              {React.createElement(Eye, { className: "w-4 h-4 mr-2", 'aria-hidden': true })}
              Preview Drawer
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs & Drawers */}
      <AddPersonDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        personType="team"
      />

      <AddTaskDrawer
        isOpen={isAddTaskDrawerOpen}
        onClose={() => setIsAddTaskDrawerOpen(false)}
        onSubmit={(taskData) => {
          console.log('Create new task:', taskData);
          setIsAddTaskDrawerOpen(false);
        }}
        users={mockTeamMembers}
        currentUser={mockTeamMembers[0]} // Use the first mock user as current user
      />

      <TaskDetailsDrawer
        isOpen={isTaskDetailsOpen}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onStatusUpdate={(taskId, newStatus) => {
          console.log('Update task status:', taskId, newStatus);
        }}
        onCommentAdd={(taskId, comment) => {
          console.log('Add comment:', taskId, comment);
        }}
      />
  </div>
  )
}
