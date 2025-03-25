import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { TeamMember } from '../../types/people';
import Icon from '../common/Icon';

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="relative">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Icon icon={User} className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2C3539] truncate">
            {member.name}
          </p>
          <p className="text-sm text-[#6B7280] truncate">
            {member.jobTitle || member.role}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {member.email && (
          <div className="flex items-center text-sm text-[#6B7280]">
            <Icon icon={Mail} className="w-4 h-4 mr-2" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center text-sm text-[#6B7280]">
            <Icon icon={Phone} className="w-4 h-4 mr-2" />
            <span>{member.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}