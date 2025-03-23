import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Owner } from '../../types/people';
import AddPersonDialog from './AddPersonDialog';

interface OwnersViewProps {
  owners: Owner[];
}

export default function OwnersView({ owners }: OwnersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOwnerDialogOpen, setIsAddOwnerDialogOpen] = useState(false);

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to format owner type for display
  const formatOwnerType = (type?: string) => {
    if (!type) return 'Individual';
    
    // Convert snake_case to Title Case and replace underscores with spaces
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
            />
          </div>
          
          {/* Filter Button */}
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Add Owner Button */}
        <button
          onClick={() => setIsAddOwnerDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3A4449] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Owner
        </button>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Properties
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOwners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {owner.imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={owner.imageUrl}
                          alt={owner.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center">
                          <span className="text-[#2C3539] font-medium text-sm">
                            {owner.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                      <div className="text-sm text-gray-500">{owner.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{owner.company_name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatOwnerType(owner.owner_type)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{owner.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {owner.properties && owner.properties.length > 0 ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {owner.properties.length} {owner.properties.length === 1 ? 'property' : 'properties'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {owner.properties.slice(0, 2).map(prop => prop.name).join(', ')}
                        {owner.properties.length > 2 ? ', ...' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No properties</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Owner Dialog */}
      <AddPersonDialog
        isOpen={isAddOwnerDialogOpen}
        onClose={() => setIsAddOwnerDialogOpen(false)}
        personType="owner"
      />
    </div>
  );
} 