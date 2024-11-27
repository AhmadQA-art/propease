import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  assignee: {
    name: string;
    imageUrl?: string;
  };
}

const mockTasks: Task[] = [
  {
    id: 'T1',
    title: 'Schedule Property Inspection',
    description: 'Conduct quarterly inspection of unit 101',
    dueDate: '2024-03-20',
    status: 'pending',
    assignee: {
      name: 'John Smith',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
    }
  },
  {
    id: 'T2',
    title: 'Lease Renewal Follow-up',
    description: 'Contact tenant regarding lease renewal decision',
    dueDate: '2024-03-18',
    status: 'overdue',
    assignee: {
      name: 'Sarah Johnson'
    }
  },
  {
    id: 'T3',
    title: 'Update Rental Agreement',
    description: 'Incorporate new terms into standard rental agreement',
    dueDate: '2024-03-25',
    status: 'completed',
    assignee: {
      name: 'Mike Wilson',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
    }
  }
];

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
  return (
    <div className="space-y-6">
      {mockTasks.map((task) => (
        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#2C3539]">{task.title}</h3>
              <p className="text-sm text-[#6B7280] mt-1">{task.description}</p>
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
  );
}