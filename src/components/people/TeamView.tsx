import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, Users2, Wrench, User } from 'lucide-react';
import { TeamMember, Task, Activity as ActivityType } from '../../types/people';
import { format } from 'date-fns';
import TeamMemberCard from './TeamMemberCard';
import InviteMemberDialog from './InviteMemberDialog';
import TaskDrawer from './TaskDrawer';
import TaskDetailsDrawer from './TaskDetailsDrawer';
import { mockTeamMembers } from '../../data/mockTeamData';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  activities: ActivityType[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TeamView({ teamMembers, tasks, activities }: TeamViewProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  const handleInviteMember = (data: {
    name: string;
    email: string;
    role: string;
    jobTitle: string;
  }) => {
    // TODO: Implement member invitation logic
    console.log('Invite member:', data);
  };

  const handleAddTask = (taskData: any) => {
    // TODO: Implement task creation logic
    console.log('Create task:', taskData);
    setIsAddTaskDrawerOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-8">
        {/* Team Members Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#2C3539]">Team Members</h2>
            <button
              onClick={() => setIsInviteDialogOpen(true)}
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
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
                <button className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-[#2C3539]" />
                </button>
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
              {filteredTasks.map((task) => (
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
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {task.assignee.imageUrl ? (
                        <img
                          src={task.assignee.imageUrl}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-[#6B7280]">{task.assignee.name}</span>
                    </div>
                    <span className="text-sm text-[#6B7280]">
                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
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
      </div>

      {/* Drawers and Dialogs */}
      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onSubmit={handleInviteMember}
      />

      <TaskDrawer
        isOpen={isAddTaskDrawerOpen}
        onClose={() => setIsAddTaskDrawerOpen(false)}
        onSubmit={handleAddTask}
        users={teamMembers}
        currentUser={teamMembers[0]}
      />

      <TaskDetailsDrawer
        isOpen={isTaskDetailsOpen}
        onClose={() => {
          setIsTaskDetailsOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}