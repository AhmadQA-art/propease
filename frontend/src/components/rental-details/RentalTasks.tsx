import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Search, Users2, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import TaskDetailsDrawer from './TaskDetailsDrawer';
import AddTaskDrawer from './AddTaskDrawer';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  type: 'team' | 'maintenance';
  assignee: {
    name: string;
    imageUrl?: string;
  };
  owner: {
    name: string;
    imageUrl?: string;
  };
  comments: {
    id: string;
    author: {
      name: string;
      imageUrl?: string;
    };
    content: string;
    timestamp: string;
  }[];
  activities: {
    id: string;
    type: string;
    user: {
      name: string;
      imageUrl?: string;
    };
    description: string;
    timestamp: string;
  }[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix leaking faucet in Unit 101',
    description: 'The kitchen faucet in Unit 101 has been reported to be leaking. Need immediate attention to prevent water damage.',
    dueDate: '2024-02-15T10:00:00Z',
    status: 'pending',
    type: 'maintenance',
    assignee: {
      name: 'John Smith',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    owner: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    comments: [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        content: 'Tenant reported this issue yesterday. Please prioritize.',
        timestamp: '2024-02-13T15:30:00Z',
      },
      {
        id: '2',
        author: {
          name: 'John Smith',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        content: "I'll check it out first thing tomorrow morning.",
        timestamp: '2024-02-13T16:45:00Z',
      },
    ],
    activities: [
      {
        id: '1',
        type: 'created',
        user: {
          name: 'Sarah Johnson',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        description: 'created this task',
        timestamp: '2024-02-13T15:00:00Z',
      },
      {
        id: '2',
        type: 'assignee_change',
        user: {
          name: 'Sarah Johnson',
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        description: 'assigned this to John Smith',
        timestamp: '2024-02-13T15:05:00Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Update rental policies',
    description: 'Review and update rental policies for all units to comply with new regulations.',
    dueDate: '2024-02-18T14:00:00Z',
    status: 'pending',
    type: 'team',
    assignee: {
      name: 'Mike Wilson',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    owner: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    comments: [],
    activities: [],
  },
  // Add more mock tasks as needed
];

const mockUsers = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'u2',
    name: 'John Smith',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'u3',
    name: 'Mike Wilson',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const currentUser = mockUsers[0]; // Sarah Johnson

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RentalTasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const filteredTasks = mockTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    // TODO: Implement status update logic
    console.log('Update task status:', taskId, newStatus);
  };

  const handleCommentAdd = (taskId: string, comment: string) => {
    // TODO: Implement comment addition logic
    console.log('Add comment:', taskId, comment);
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    dueDate: string;
    assignee: string;
    owner: string;
  }) => {
    // TODO: Implement task creation logic
    console.log('Create new task:', taskData);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3539]">Tasks</h2>
          <p className="text-sm text-[#6B7280]">Manage property tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddDrawerOpen(true)}
            className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              setSelectedTask(task);
              setIsDetailsDrawerOpen(true);
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex">
                {/* Task Type Icon */}
                <div className="mr-4">
                  <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    {task.type === 'team' ? (
                      <Users2 className="w-7 h-7 text-[#2C3539]" />
                    ) : (
                      <Wrench className="w-7 h-7 text-[#2C3539]" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2C3539]">{task.title}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{task.description}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Clock className="w-4 h-4 mr-2" />
                  {task.status === 'completed' ? 'Completed' : 'Due'} {format(new Date(task.dueDate), 'h:mm a')}
                </div>
              </div>
              
              <div className="flex items-center">
                {task.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                )}
                <div className="flex items-center">
                  {task.assignee.imageUrl ? (
                    <img
                      src={task.assignee.imageUrl}
                      alt={task.assignee.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {task.assignee.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-sm text-[#6B7280]">{task.assignee.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedTask(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        onCommentAdd={handleCommentAdd}
      />

      {/* Add Task Drawer */}
      <AddTaskDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSubmit={handleAddTask}
        users={mockUsers}
        currentUser={currentUser}
      />

      {/* Backdrop */}
      {(isDetailsDrawerOpen || isAddDrawerOpen) && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => {
            setIsDetailsDrawerOpen(false);
            setSelectedTask(null);
            setIsAddDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}