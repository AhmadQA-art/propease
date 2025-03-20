import React from 'react';
import { RentalDetails } from '../types/rental';

interface RentalCardProps {
  rental: RentalDetails;
  onClick: () => void;
}

export default function RentalCard({ rental, onClick }: RentalCardProps) {
  const location = rental.address ? 
    `${rental.address}, ${rental.city}, ${rental.state}` : 
    `${rental.city || ''} ${rental.state || ''}`;

  // Determine which icon to render based on property type
  const renderPropertyTypeIcon = () => {
    switch (rental.type) {
      case 'residential':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#2C3539]">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'commercial':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#2C3539]">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01"/>
            <path d="M16 6h.01"/>
            <path d="M12 6h.01"/>
            <path d="M8 10h.01"/>
            <path d="M16 10h.01"/>
            <path d="M12 10h.01"/>
            <path d="M8 14h.01"/>
            <path d="M16 14h.01"/>
            <path d="M12 14h.01"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#2C3539]">
            <path d="M6 3v18"/>
            <path d="M18 3v18"/>
            <path d="M3 6h18"/>
            <path d="M3 18h18"/>
          </svg>
        );
    }
  };

  // Smaller icon for property type section
  const renderSmallPropertyTypeIcon = () => {
    switch (rental.type) {
      case 'residential':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#6B7280] mr-2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'commercial':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#6B7280] mr-2">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01"/>
            <path d="M16 6h.01"/>
            <path d="M12 6h.01"/>
            <path d="M8 10h.01"/>
            <path d="M16 10h.01"/>
            <path d="M12 10h.01"/>
            <path d="M8 14h.01"/>
            <path d="M16 14h.01"/>
            <path d="M12 14h.01"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#6B7280] mr-2">
            <path d="M6 3v18"/>
            <path d="M18 3v18"/>
            <path d="M3 6h18"/>
            <path d="M3 18h18"/>
          </svg>
        );
    }
  };

  return (
    <div 
      onClick={onClick}
      className="w-full p-4 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        {/* Property Icon and Info */}
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
            {renderPropertyTypeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-[#2C3539]">
                {rental.propertyName || rental.name}
              </h3>
              {(rental.status as string) === 'maintenance' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Maintenance
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-[#6B7280] mt-1">
              {/* Map Pin Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {location}
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="flex items-center px-4 min-w-[200px]">
          {renderSmallPropertyTypeIcon()}
          <span className="text-sm text-[#2C3539] capitalize">{rental.type}</span>
        </div>

        {/* Active Units */}
        <div className="flex items-center px-4 min-w-[150px] justify-end">
          {/* Door Open Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#6B7280] mr-2">
            <path d="M13 4h3a2 2 0 0 1 2 2v14"/>
            <path d="M2 20h3"/>
            <path d="M13 20h9"/>
            <path d="M10 12v.01"/>
            <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.562Z"/>
          </svg>
          <span className="text-sm text-[#2C3539]">{rental.total_units || rental.unit} unit{(rental.total_units || rental.unit) !== 1 ? 's' : ''}</span>
        </div>

        {/* Placeholder for alignment */}
        <div className="w-10"></div>
      </div>
    </div>
  );
}