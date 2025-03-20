import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Plus } from 'lucide-react';
import AddPersonDialog from '../../components/people/AddPersonDialog';
import { mockTeamMembers } from '../../data/mockTeamData';

export default function TeamReference() {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

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
        <h1 className="text-2xl font-bold text-[#2C3539]">Team Components</h1>
        <p className="text-[#6B7280] mt-1">Team member cards and related components</p>
      </div>

      {/* Team Members Section Component */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2C3539]">Team Members Section</h2>
        <div className="p-6 border border-gray-200 rounded-xl space-y-6">
          {/* The actual component */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#2C3539]">Team Members</h2>
              <button
                onClick={() => setIsAddMemberDialogOpen(true)}
                className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                          member.status === 'active' ? 'bg-green-400' :
                          member.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2C3539] truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-[#6B7280] truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="text-sm text-[#6B7280]">
            <p>Usage:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Section container uses consistent padding (p-6) and border radius (rounded-xl)</li>
              <li>Header includes section title and primary action button</li>
              <li>Grid layout adapts to screen size:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Mobile: 1 column</li>
                  <li>Tablet: 2 columns</li>
                  <li>Desktop: 4 columns</li>
                </ul>
              </li>
              <li>Member cards include:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Profile image with status indicator</li>
                  <li>Name and role with truncation</li>
                  <li>Contact information with icons</li>
                </ul>
              </li>
              <li>Status indicators use consistent colors:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Active: Green</li>
                  <li>Busy: Red</li>
                  <li>Offline: Gray</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddPersonDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        personType="team"
      />
    </div>
  );
}