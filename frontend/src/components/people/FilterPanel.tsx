import React from 'react';
import SearchableDropdown from './SearchableDropdown';
import type { PersonType } from '../../types/people';

interface FilterPanelProps {
  filters: {
    types: PersonType[];
    status: string[];
    hasLease: string[];
  };
  onFiltersChange: (filters: { types: PersonType[]; status: string[]; hasLease: string[] }) => void;
  tabType?: 'Tenants' | 'Owners' | 'Vendors' | string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, tabType = 'Tenants' }) => {
  const leaseOptions = [
    { value: 'has_lease', label: 'Active' },
    { value: 'no_lease', label: 'Not Active' },
  ];

  // Owner-specific filter options could be added here
  const ownerOptions = [
    { value: 'has_properties', label: 'Has Properties' },
    { value: 'no_properties', label: 'No Properties' },
  ];

  // Vendor-specific filter options could be added here
  const vendorOptions = [
    { value: 'active_service', label: 'Active Services' },
    { value: 'no_service', label: 'No Active Services' },
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
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Property Status</p>
            <SearchableDropdown
              options={ownerOptions}
              selectedValues={[]} // Currently not tracking owner filters
              onChange={() => {}} // Placeholder - would need to implement owner filtering
              multiple
              disabled={true}
            />
            <p className="text-xs text-gray-500 mt-1">Owner filters coming soon</p>
          </div>
        );
      case 'Vendors':
        return (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Service Status</p>
            <SearchableDropdown
              options={vendorOptions}
              selectedValues={[]} // Currently not tracking vendor filters
              onChange={() => {}} // Placeholder - would need to implement vendor filtering
              multiple
              disabled={true}
            />
            <p className="text-xs text-gray-500 mt-1">Vendor filters coming soon</p>
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
          onClick={() => onFiltersChange({ ...filters, hasLease: [] })}
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