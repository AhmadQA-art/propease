import React from 'react';
import { Home, Building2, Warehouse, MapPin, DoorOpen } from 'lucide-react';
import { RentalDetails } from '../types/rental';

interface RentalCardProps {
  rental: RentalDetails;
  onClick: () => void;
}

const getPropertyTypeIcon = (type: RentalDetails['type']) => {
  switch (type) {
    case 'residential':
      return Home;
    case 'commercial':
      return Building2;
    default:
      return Warehouse;
  }
};

export const getPropertyLocation = (propertyName: string) => {
  const locations = {
    'Sunset Gardens': '742 Sunset Boulevard, Los Angeles, CA',
    'Downtown Business Center': '100 Financial District, San Francisco, CA',
    'Harbor View Apartments': '456 Ocean Drive, Miami Beach, FL',
    'Innovation Hub': '789 Tech Park Way, Austin, TX',
    'Green Valley Residences': '321 Mountain View Rd, Denver, CO',
    'Retail Plaza': '567 Shopping Avenue, Chicago, IL'
  };
  return locations[propertyName] || '123 Example St, City, State';
};

export default function RentalCard({ rental, onClick }: RentalCardProps) {
  const PropertyTypeIcon = getPropertyTypeIcon(rental.type);
  const hasMaintenanceIssues = Math.random() < 0.3; // Mock data - replace with actual maintenance status
  const location = getPropertyLocation(rental.propertyName);

  return (
    <div 
      onClick={onClick}
      className="p-4 cursor-pointer"
    >
      <div className="flex items-center">
        {/* Property Image and Info */}
        <div className="flex items-center flex-1">
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            alt={rental.propertyName}
            className="w-12 h-12 rounded-lg object-cover mr-4"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#2C3539]">
                {rental.propertyName}
              </h3>
              {hasMaintenanceIssues && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Maintenance
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-[#6B7280] mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="flex items-center px-4 min-w-[200px]">
          <PropertyTypeIcon className="w-5 h-5 text-[#6B7280] mr-2" />
          <span className="text-sm text-[#2C3539] capitalize">{rental.type}</span>
        </div>

        {/* Active Units */}
        <div className="flex items-center px-4 min-w-[150px] justify-end">
          <DoorOpen className="w-5 h-5 text-[#6B7280] mr-2" />
          <span className="text-sm text-[#2C3539]">{rental.unit} unit{rental.unit !== 1 ? 's' : ''}</span>
        </div>

        {/* Placeholder for alignment */}
        <div className="w-10"></div>
      </div>
    </div>
  );
}