import React from 'react';
import { User } from 'lucide-react';
import { TeamMember } from '../../types/people';

interface TeamMemberCardProps {
  member: TeamMember;
}

const getStatusColor = (status: string) => {
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

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(member.status)}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#2C3539]">{member.name}</h3>
          <p className="text-xs text-[#6B7280]">{member.role}</p>
        </div>
      </div>
    </div>
  );
}