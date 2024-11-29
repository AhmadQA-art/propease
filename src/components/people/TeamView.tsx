import React from 'react';
import { TeamMember, Task, Activity } from '../../types/people';
import { User, Calendar, Clock, CheckCircle } from 'lucide-react';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  activities: Activity[];
}

export default function TeamView({ teamMembers, tasks, activities }: TeamViewProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Team Members */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-lg font-semibold text-[#2C3539]">Active Tasks</h2>
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2C3539]">{task.title}</h3>
                <p className="text-[#6B7280] mt-1">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-[#6B7280]">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {task.assignee.imageUrl ? (
                  <img
                    src={task.assignee.imageUrl}
                    alt={task.assignee.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <span className="text-sm text-[#6B7280]">{task.assignee.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[#2C3539]">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {activity.user.imageUrl ? (
                  <img
                    src={activity.user.imageUrl}
                    alt={activity.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#2C3539]">
                    <span className="font-medium">{activity.user.name}</span>
                    {' '}{activity.action}{' '}
                    <span className="text-[#6B7280]">{activity.target}</span>
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}