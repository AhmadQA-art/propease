import React from 'react';
import SearchableDropdown from './SearchableDropdown';
import type { PersonType } from '../../types/people';

interface FilterPanelProps {
  filters: {
    types: PersonType[];
    status: string[];
  };
  onFiltersChange: (filters: { types: PersonType[]; status: string[] }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const typeOptions = [
    { value: 'tenant', label: 'Tenant' },
    { value: 'owner', label: 'Owner' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'team', label: 'Team Member' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      
      <div className="space-y-4">
        <SearchableDropdown
          label="Type"
          options={typeOptions}
          selectedValues={filters.types}
          onChange={(values) => onFiltersChange({ ...filters, types: values as PersonType[] })}
          multiple
        />

        <SearchableDropdown
          label="Status"
          options={statusOptions}
          selectedValues={filters.status}
          onChange={(values) => onFiltersChange({ ...filters, status: values })}
          multiple
        />
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <button
          onClick={() => onFiltersChange({ types: [], status: [] })}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Clear All
        </button>
        <button
          onClick={() => onFiltersChange(filters)}
          className="px-4 py-2 text-sm font-medium bg-[#2C3539] text-white rounded-md hover:bg-[#3d474c]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel; 