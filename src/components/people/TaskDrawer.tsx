import React, { useState } from 'react';
import { X, Calendar, User, Clock, Users2, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import UserSelect from '../rental-details/UserSelect';

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    dueDate: string;
    assignee: string;
    owner: string;
    type: 'team' | 'maintenance';
  }) => void;
  users: User[];
  currentUser: User;
}

export default function TaskDrawer({ isOpen, onClose, onSubmit, users, currentUser }: TaskDrawerProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    assignee: '',
    owner: currentUser.id,
    type: 'team' as 'team' | 'maintenance'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      title: '',
      description: '',
      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      assignee: '',
      owner: currentUser.id,
      type: 'team' as 'team' | 'maintenance'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-[#2C3539]">New Task</h2>
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
              <span className="text-sm text-gray-900">{currentUser.name}</span>
            </div>
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">
              Task Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'team' }))}
                className={`flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-lg border ${
                  formData.type === 'team'
                    ? 'border-[#2C3539] bg-[#2C3539] text-white'
                    : 'border-gray-200 text-[#2C3539] hover:border-[#2C3539]'
                } transition-colors`}
              >
                <Users2 className="w-5 h-5" />
                <span className="font-medium">Team Task</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'maintenance' }))}
                className={`flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-lg border ${
                  formData.type === 'maintenance'
                    ? 'border-[#2C3539] bg-[#2C3539] text-white'
                    : 'border-gray-200 text-[#2C3539] hover:border-[#2C3539]'
                } transition-colors`}
              >
                <Wrench className="w-5 h-5" />
                <span className="font-medium">Maintenance</span>
              </button>
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

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm text-[#6B7280] block">
              Description
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent min-h-[100px]"
              placeholder="Enter task description"
            />
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

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">
              Assignee
            </label>
            <UserSelect
              users={users}
              selectedUserId={formData.assignee}
              onSelect={(userId) => setFormData(prev => ({ ...prev, assignee: userId }))}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
