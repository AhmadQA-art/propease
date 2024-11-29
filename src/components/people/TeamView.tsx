import React, { useState } from 'react';
import { Activity, Plus, Search, Filter } from 'lucide-react';
import { TeamMember, Task, Activity as ActivityType } from '../../types/people';
import { format } from 'date-fns';
import TeamMembersList from './TeamMembersList';
import AddTaskDrawer from '../rental-details/AddTaskDrawer';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  activities: ActivityType[];
}

export default function TeamView({ teamMembers, tasks, activities }: TeamViewProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleAddTask = (taskData: any) => {
    // TODO: Implement task creation
    console.log('New task:', taskData);
    setIsAddTaskOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Team Members List */}
      <TeamMembersList members={teamMembers} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 text-[#2C3539]" />
                  </button>
                  {isFilterOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsFilterOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                        {['all', 'high', 'medium', 'low'].map((priority) => (
                          <button
                            key={priority}
                            onClick={() => {
                              setSelectedPriority(priority);
                              setIsFilterOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539] capitalize"
                          >
                            {priority === 'all' ? 'All Priorities' : `${priority} Priority`}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#2C3539]">{task.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.assignee.id === 'currentUser' && task.status !== 'completed' && (
                        <button
                          className="px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => {/* TODO: Implement complete task */}}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[#6B7280] mb-4">{task.description}</p>
                  <div className="flex items-center justify-between text-sm text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignee.imageUrl}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{task.assignee.name}</span>
                    </div>
                    <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#6B7280]">No tasks found</p>
                </div>
              )}
            </div>
          </div>
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
                <img
                  src={activity.user.imageUrl}
                  alt={activity.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2C3539]">
                    <span className="font-medium">{activity.user.name}</span>
                    {' '}{activity.action}{' '}
                    <span className="text-[#6B7280]">{activity.target}</span>
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Drawer */}
      <AddTaskDrawer
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddTask}
        users={teamMembers}
        currentUser={teamMembers[0]} // TODO: Replace with actual current user
      />
    </div>
  );
}