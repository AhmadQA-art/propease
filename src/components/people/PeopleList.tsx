import React, { useState } from 'react';
import { Search, Filter, Plus, User, Building2, Briefcase } from 'lucide-react';
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

  const filteredPeople = people.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.includes(searchQuery);
    
    const matchesType = selectedType === 'all' || person.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleAddPerson = (type: PersonType) => {
    setAddingPersonType(type);
    setIsAddDialogOpen(true);
  };

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

        <div className="flex gap-2">
          <button
            onClick={() => handleAddPerson('team')}
            className="flex items-center px-3 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
            Add Team Member
          </button>
          <button
            onClick={() => handleAddPerson('tenant')}
            className="flex items-center px-3 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
          <button
            onClick={() => handleAddPerson('vendor')}
            className="flex items-center px-3 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {/* Empty State */}
      {filteredPeople.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No people found matching your search criteria</p>
        </div>
      )}

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