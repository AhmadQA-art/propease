import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ClipboardList, Plus, Search, Users2, Wrench } from 'lucide-react';
import { format } from 'date-fns';

export default function TasksReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      }
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
      }
    }
  ];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link 
          to="/ui-reference" 
          className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to UI Reference
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Task Components</h1>
        <p className="text-[#6B7280] mt-1">Task cards and management components</p>
      </div>

      {/* Tasks Section Component */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2C3539]">Tasks Section</h2>
        <div className="p-6 border border-gray-200 rounded-xl space-y-6">
          {/* The actual component */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ClipboardList className="w-5 h-5 text-[#2C3539] mr-2" />
                <h2 className="text-lg font-semibold text-[#2C3539]">All Tasks</h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setIsAddTaskDrawerOpen(true)}
                  className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {mockTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex">
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
                        <h3 className="text-sm font-medium text-[#2C3539]">{task.title}</h3>
                        <p className="text-sm text-[#6B7280] mt-1">{task.description}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <img
                        src={task.assignee.imageUrl}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="ml-2 text-[#6B7280]">{task.assignee.name}</span>
                    </div>
                    <div className="flex items-center text-[#6B7280]">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="text-sm text-[#6B7280]">
            <p>Usage:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Header includes section title with icon, search bar, and primary action button</li>
              <li>Task cards feature:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Type icon (team/maintenance)</li>
                  <li>Title and description</li>
                  <li>Status badge with appropriate colors</li>
                  <li>Assignee information with avatar</li>
                  <li>Due date with calendar icon</li>
                </ul>
              </li>
              <li>Interactive elements:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Clickable cards open task details</li>
                  <li>Search functionality</li>
                  <li>Add task button opens creation drawer</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}