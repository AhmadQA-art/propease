import React from 'react';
import SearchableDropdown from './SearchableDropdown';
import type { PersonType } from '../../types/people';

interface FilterPanelProps {
  filters: {
    types: PersonType[];
    status: string[];
    hasLease: string[];
    ownerTypes?: string[];
    serviceTypes?: string[];
  };
  onFiltersChange: (filters: { 
    types: PersonType[]; 
    status: string[]; 
    hasLease: string[];
    ownerTypes?: string[];
    serviceTypes?: string[];
  }) => void;
  tabType?: 'Tenants' | 'Owners' | 'Vendors' | string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, tabType = 'Tenants' }) => {
  const leaseOptions = [
    { value: 'has_lease', label: 'Active' },
    { value: 'no_lease', label: 'Not Active' },
  ];

  // Owner type filter options
  const ownerTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'partnership', label: 'Partnership' },
  ];

  // Property status filter options
  const ownerPropertyOptions = [
    { value: 'has_properties', label: 'Has Properties' },
    { value: 'no_properties', label: 'No Properties' },
  ];

  // Service type filter options for vendors - matching the AddVendorDialog and VendorDetailsDrawer
  const serviceTypeOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'security', label: 'Security' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'other', label: 'Other' },
  ];

  const renderFilterContent = () => {
    switch (tabType) {
      case 'Tenants':
        return (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Lease Status</p>
            <SearchableDropdown
              options={leaseOptions}
              selectedValues={filters.hasLease}
              onChange={(values) => onFiltersChange({ ...filters, hasLease: values })}
              multiple
            />
          </div>
        );
      case 'Owners':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Owner Type</p>
              <SearchableDropdown
                options={ownerTypeOptions}
                selectedValues={filters.ownerTypes || []}
                onChange={(values) => onFiltersChange({ ...filters, ownerTypes: values })}
                multiple
              />
            </div>
          </div>
        );
      case 'Vendors':
        return (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Service Type</p>
            <SearchableDropdown
              options={serviceTypeOptions}
              selectedValues={filters.serviceTypes || []}
              onChange={(values) => onFiltersChange({ ...filters, serviceTypes: values })}
              multiple
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      
      <div className="space-y-4">
        {renderFilterContent()}
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            const resetFilters = {
              ...filters, 
              hasLease: [],
              ownerTypes: [],
              serviceTypes: []
            };
            onFiltersChange(resetFilters);
          }}
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