import React from 'react';
import { Activity, User, MessageSquare, FileText, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'update' | 'message' | 'document' | 'edit';
  user: {
    name: string;
    imageUrl?: string;
  };
  description: string;
  timestamp: string;
  details?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: 'A1',
    type: 'update',
    user: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
    },
    description: 'updated rental status',
    details: 'Changed status from pending to active',
    timestamp: '2024-03-15T14:30:00'
  },
  {
    id: 'A2',
    type: 'message',
    user: {
      name: 'Michael Chen'
    },
    description: 'sent a message to tenant',
    details: 'Regarding upcoming maintenance schedule',
    timestamp: '2024-03-15T11:20:00'
  },
  {
    id: 'A3',
    type: 'document',
    user: {
      name: 'Emily Rodriguez',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
    },
    description: 'uploaded a new document',
    details: 'Added updated lease agreement',
    timestamp: '2024-03-14T16:45:00'
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'update':
      return Activity;
    case 'message':
      return MessageSquare;
    case 'document':
      return FileText;
    case 'edit':
      return Edit2;
    default:
      return Activity;
  }
};

interface RentalActivitiesProps {
  rentalId: string;
}

export default function RentalActivities({ rentalId }: RentalActivitiesProps) {
  return (
    <div className="space-y-6">
      <div className="flow-root">
        <ul className="-mb-8">
          {mockActivities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            return (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < mockActivities.length - 1 && (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      {activity.user.imageUrl ? (
                        <img
                          src={activity.user.imageUrl}
                          alt={activity.user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <span className="absolute -right-1 -top-1 rounded-full bg-white p-0.5">
                        <ActivityIcon className="h-4 w-4 text-[#2C3539]" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-[#2C3539]">
                            {activity.user.name}
                          </span>{' '}
                          <span className="text-[#6B7280]">{activity.description}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-[#6B7280]">
                          {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      {activity.details && (
                        <div className="mt-2 text-sm text-[#6B7280]">
                          {activity.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}