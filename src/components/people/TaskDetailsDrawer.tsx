import React from 'react';
import { X, Calendar, User, Clock, Users2, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../types/people';

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskDetailsDrawer({ isOpen, onClose, task }: TaskDetailsDrawerProps) {
  if (!isOpen || !task) return null;

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>

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
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280] block">
                Due Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Assignee */}
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
                  <span className="text-xs text-[#6B7280]">{task.assignee.role}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {task.status !== 'completed' && (
                <button
                  className="w-full py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                >
                  Mark as Complete
                </button>
              )}
              {task.status === 'pending' && (
                <button
                  className="w-full py-2 border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
