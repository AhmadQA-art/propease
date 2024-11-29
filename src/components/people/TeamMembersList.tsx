import React from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { TeamMember } from '../../types/people';

interface TeamMembersListProps {
  members: TeamMember[];
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

export default function TeamMembersList({ members }: TeamMembersListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Team Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="relative">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
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
    </div>
  );
}