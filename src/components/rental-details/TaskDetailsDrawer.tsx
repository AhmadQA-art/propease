import React, { useState } from 'react';
import { X, Calendar, User, Clock, Send, MessageSquare, Users2, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface TaskComment {
  id: string;
  author: {
    name: string;
    imageUrl?: string;
  };
  content: string;
  timestamp: string;
}

interface TaskActivity {
  id: string;
  type: 'status_change' | 'comment_added' | 'assignee_change' | 'created';
  user: {
    name: string;
    imageUrl?: string;
  };
  description: string;
  timestamp: string;
}

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
  comments: TaskComment[];
  activities: TaskActivity[];
}

interface TaskDetailsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onCommentAdd?: (taskId: string, comment: string) => void;
}

export default function TaskDetailsDrawer({ task, isOpen, onClose, onStatusUpdate, onCommentAdd }: TaskDetailsDrawerProps) {
  const [newComment, setNewComment] = useState('');

  if (!task || !isOpen) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(task.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h3 className="text-xl font-semibold text-[#2C3539]">{task.title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4">
        <div className="p-6 space-y-6">
          {/* Task Type */}
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center">
              {task.type === 'team' ? (
                <Users2 className="w-6 h-6 text-[#2C3539]" />
              ) : (
                <Wrench className="w-6 h-6 text-[#2C3539]" />
              )}
            </div>
            <span className="text-sm font-medium text-[#2C3539]">
              {task.type === 'team' ? 'Team Task' : 'Maintenance Request'}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-sm font-medium 
              ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {task.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
            {task.status !== 'completed' && onStatusUpdate && (
              <button
                onClick={() => onStatusUpdate(task.id, 'completed')}
                className="px-3 py-1.5 text-sm font-medium border border-green-600 text-green-600 rounded-lg 
                hover:bg-green-50 transition-colors"
              >
                Mark as Complete
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Description</label>
            <p className="text-[#2C3539]">{task.description}</p>
          </div>

          {/* Owner and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            {/* Owner */}
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Owner</label>
              <div className="flex items-center space-x-3">
                {task.owner.imageUrl ? (
                  <img
                    src={task.owner.imageUrl}
                    alt={task.owner.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <span className="text-[#2C3539] font-medium">{task.owner.name}</span>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Assignee</label>
              <div className="flex items-center space-x-3">
                {task.assignee.imageUrl ? (
                  <img
                    src={task.assignee.imageUrl}
                    alt={task.assignee.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <span className="text-[#2C3539] font-medium">{task.assignee.name}</span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Due Date</label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#2C3539]" />
              <span className="text-[#2C3539]">
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <label className="text-sm text-[#6B7280]">Comments</label>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 text-[#2C3539] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.author.imageUrl ? (
                    <img
                      src={comment.author.imageUrl}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-[#2C3539]">{comment.author.name}</span>
                      <span className="text-sm text-[#6B7280]">
                        {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-[#2C3539] text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <label className="text-sm text-[#6B7280]">Activity</label>
            <div className="space-y-4">
              {task.activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {activity.user.imageUrl ? (
                    <img
                      src={activity.user.imageUrl}
                      alt={activity.user.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-[#2C3539]">{activity.user.name}</span>
                      <span className="text-sm text-[#6B7280]">{activity.description}</span>
                    </div>
                    <span className="text-xs text-[#6B7280] mt-0.5 block">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
