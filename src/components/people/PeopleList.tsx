import React, { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Person, PersonType } from '../../types/people';
import PersonCard from './PersonCard';
import AddPersonDialog from './AddPersonDialog';

interface PeopleListProps {
  people: Person[];
}

export default function PeopleList({ people }: PeopleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PersonType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingPersonType, setAddingPersonType] = useState<PersonType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddPerson = (type: PersonType) => {
    setAddingPersonType(type);
    setIsAddDialogOpen(true);
    setIsDropdownOpen(false);
  };

  const filteredPeople = people.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.includes(searchQuery);
    
    const matchesType = selectedType === 'all' || person.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search people..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as PersonType | 'all')}
        >
          <option value="all">All Types</option>
          <option value="team">Team Members</option>
          <option value="tenant">Tenants</option>
          <option value="vendor">Vendors</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                <button
                  onClick={() => handleAddPerson('team')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                >
                  Team Member
                </button>
                <button
                  onClick={() => handleAddPerson('tenant')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                >
                  Tenant
                </button>
                <button
                  onClick={() => handleAddPerson('vendor')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                >
                  Vendor
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* People List */}
      <div className="space-y-4">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {person.imageUrl ? (
                  <img
                    src={person.imageUrl}
                    alt={person.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-medium text-[#2C3539]">{person.name}</h3>
                  <p className="text-sm text-[#6B7280]">
                    {person.type === 'team' 
                      ? person.role
                      : person.type === 'vendor'
                      ? person.company
                      : `${person.property} - Unit ${person.unit}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                {person.type === 'team' && (
                  <div className="text-sm text-[#6B7280]">
                    <span className="font-medium">{person.assignedTasks}</span> Active Tasks
                  </div>
                )}
                {person.type === 'tenant' && (
                  <div className="text-sm text-[#6B7280]">
                    Lease ends {new Date(person.leaseEnd || '').toLocaleDateString()}
                  </div>
                )}
                {person.type === 'vendor' && (
                  <div className="text-sm text-[#6B7280]">
                    <span className="font-medium">{person.totalServices}</span> Services
                  </div>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  person.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {person.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No people found matching your search criteria</p>
          </div>
        )}
      </div>

      {/* Add Person Dialog */}
      <AddPersonDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setAddingPersonType(null);
        }}
        personType={addingPersonType}
      />
    </div>
  );
}