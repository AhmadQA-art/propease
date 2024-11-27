import React from 'react';
import { Edit2, Building2, DoorOpen, UserCog, Users2, DollarSign, Home, PercentCircle, Image as ImageIcon } from 'lucide-react';
import { RentalDetails } from '../../types/rental';

interface RentalOverviewProps {
  rental: RentalDetails;
  onEdit: (id: string) => void;
}

export default function RentalOverview({ rental, onEdit }: RentalOverviewProps) {
  // Sample images - replace with actual data
  const propertyImages = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  ];

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-end -mt-1 mb-2">
        <button
          onClick={() => onEdit(rental.id)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stakeholder Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholder Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <Users2 className="w-4 h-4" />
              <p>Owner</p>
            </div>
            <p className="text-[#2C3539] font-medium mt-1">{rental.owner}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <UserCog className="w-4 h-4" />
              <p>Property Manager</p>
            </div>
            <p className="text-[#2C3539] font-medium mt-1">{rental.manager}</p>
          </div>
        </div>
      </div>

      {/* Property Information Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <DoorOpen className="w-4 h-4" />
                <p>Units</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.unit}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <Building2 className="w-4 h-4" />
                <p>Property Type</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1 capitalize">{rental.type}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <DollarSign className="w-4 h-4" />
                <p>Monthly Revenue</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">$24,500</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <Home className="w-4 h-4" />
                <p>Active Leases</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">12</p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <PercentCircle className="w-4 h-4" />
                <p>Occupancy Rate</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      {propertyImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Property Images</h2>
            <button className="text-sm text-[#2C3539] hover:text-[#3d474c] flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>Add Images</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {propertyImages.map((image, index) => (
              <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}