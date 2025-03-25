import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Search, Filter, Plus } from 'lucide-react';
import { TeamMember } from '../../types/people';
import { peopleApi } from '../../services/api/people';

interface TeamMembersListProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  onAddMember?: () => void;
}

export default function TeamMembersList({ members, onMemberClick, onAddMember }: TeamMembersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch departments for filtering
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deptData = await peopleApi.getDepartments();
        setDepartments(deptData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  // Filter members based on search query and selected department
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || member.departmentId === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#2C3539]">Team Members</h2>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filter toggle */}
          <div className="relative">
            <button 
              className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 text-[#2C3539]" />
            </button>
            
            {/* Filter dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-[#2C3539]">Filter by Department</h3>
                </div>
                
                <div className="p-4">
                  <div className="relative">
                    <select
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Add Member button */}
          {onAddMember && (
            <button
              onClick={onAddMember}
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          )}
        </div>
      </div>
      
      {/* Two-row grid with scrolling */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto max-h-[440px] pb-4 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onMemberClick && onMemberClick(member)}
              >
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
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-[#2C3539] truncate max-w-[140px]">{member.name}</h3>
                      <p className="text-[11px] text-[#6B7280] truncate max-w-[140px]">{member.jobTitle || member.role}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-xs text-[#6B7280]">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-[170px] block">
                      {member.email || 'No email provided'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-[#6B7280]">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-[170px] block">
                      {member.phone || 'No phone provided'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-[#6B7280]">
              No team members match your search criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}