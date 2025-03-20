import React from 'react';
import { Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function ActivitiesReference() {
  const mockActivities = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      action: 'completed',
      target: 'lease renewal review for Unit 304',
      timestamp: new Date(2024, 2, 15, 14, 30)
    },
    {
      id: '2',
      user: {
        name: 'Michael Chen',
        imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      action: 'assigned',
      target: 'maintenance inspection to David',
      timestamp: new Date(2024, 2, 15, 13, 15)
    }
  ];

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
        <h1 className="text-2xl font-bold text-[#2C3539]">Activities Components</h1>
        <p className="text-[#6B7280] mt-1">Activity feeds and timeline components</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2C3539]">Recent Activities Section</h2>
        <div className="p-6 border border-gray-200 rounded-xl space-y-6">
          {/* Component implementation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <Activity className="w-5 h-5 text-[#2C3539] mr-2" />
              <h2 className="text-lg font-semibold text-[#2C3539]">Recent Activities</h2>
            </div>
            <div className="space-y-6">
              {mockActivities.map((activity) => (
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
                      {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="text-sm text-[#6B7280]">
            <p>Usage:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Simple header with icon and section title</li>
              <li>Activity items include:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>User avatar</li>
                  <li>Activity description with highlighted user name</li>
                  <li>Formatted timestamp</li>
                </ul>
              </li>
              <li>Consistent spacing between items</li>
              <li>Clear visual hierarchy with varying text styles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}