import React from 'react';
import { Mail, Phone, Plus, Activity, User } from 'lucide-react';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  imageUrl: string;
  status: 'active' | 'offline' | 'busy';
}

interface TeamActivity {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  action: string;
  target: string;
  timestamp: Date;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Property Manager',
    email: 'sarah.j@propease.com',
    phone: '+1 (555) 123-4567',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Maintenance Supervisor',
    email: 'michael.c@propease.com',
    phone: '+1 (555) 234-5678',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'busy'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Leasing Agent',
    email: 'emily.r@propease.com',
    phone: '+1 (555) 345-6789',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Financial Analyst',
    email: 'david.k@propease.com',
    phone: '+1 (555) 456-7890',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active'
  }
];

const recentActivities: TeamActivity[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Johnson',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    action: 'approved',
    target: 'maintenance request #TKT-003',
    timestamp: new Date(2024, 2, 15, 14, 30)
  },
  {
    id: '2',
    userId: '2',
    userName: 'Michael Chen',
    userImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    action: 'completed',
    target: 'unit inspection for Apt 204',
    timestamp: new Date(2024, 2, 15, 13, 15)
  },
  {
    id: '3',
    userId: '3',
    userName: 'Emily Rodriguez',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    action: 'scheduled',
    target: 'viewing for Apt 512',
    timestamp: new Date(2024, 2, 15, 11, 45)
  }
];

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-400';
    case 'offline':
      return 'bg-gray-400';
    case 'busy':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
};

export default function Team() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Team</h1>
          <p className="text-[#6B7280] mt-1">Manage your team members and their roles</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(member.status)}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#2C3539]">{member.name}</h3>
                  <p className="text-sm text-[#6B7280]">{member.role}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-[#6B7280]">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-[#6B7280]">
                <Phone className="w-4 h-4 mr-2" />
                {member.phone}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <Activity className="w-5 h-5 text-[#2C3539] mr-2" />
          <h2 className="text-lg font-semibold text-[#2C3539]">Recent Activities</h2>
        </div>
        <div className="space-y-6">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <img
                src={activity.userImage}
                alt={activity.userName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2C3539]">
                  <span className="font-medium">{activity.userName}</span>
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
    </div>
  );
}