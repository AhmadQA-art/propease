import React from 'react';
import { Building2, Plus, Users, Home, DollarSign, Wrench } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  type: 'apartment' | 'house' | 'commercial';
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  maintenanceRequests: number;
  status: 'operational' | 'maintenance' | 'renovation';
}

const properties: Property[] = [
  {
    id: 'P001',
    name: 'Sunset Apartments',
    address: '123 Sunset Boulevard, Los Angeles, CA 90028',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 22,
    monthlyRevenue: 52000,
    maintenanceRequests: 3,
    status: 'operational'
  },
  {
    id: 'P002',
    name: 'Harbor View Complex',
    address: '456 Ocean Drive, San Francisco, CA 94111',
    imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    type: 'apartment',
    totalUnits: 36,
    occupiedUnits: 30,
    monthlyRevenue: 78000,
    maintenanceRequests: 5,
    status: 'maintenance'
  },
  {
    id: 'P003',
    name: 'Downtown Business Center',
    address: '789 Market Street, Seattle, WA 98101',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    type: 'commercial',
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyRevenue: 45000,
    maintenanceRequests: 2,
    status: 'operational'
  },
  {
    id: 'P004',
    name: 'Green Valley Homes',
    address: '321 Park Road, Austin, TX 78701',
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    type: 'house',
    totalUnits: 8,
    occupiedUnits: 7,
    monthlyRevenue: 28000,
    maintenanceRequests: 1,
    status: 'renovation'
  }
];

const getStatusColor = (status: Property['status']) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'renovation':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPropertyTypeIcon = (type: Property['type']) => {
  switch (type) {
    case 'apartment':
      return Building2;
    case 'house':
      return Home;
    case 'commercial':
      return Building2;
    default:
      return Building2;
  }
};

export default function Properties() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Properties</h1>
          <p className="text-[#6B7280] mt-1">Manage and monitor your properties</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </button>
      </div>

      {/* Properties Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => {
          const PropertyTypeIcon = getPropertyTypeIcon(property.type);
          const occupancyRate = Math.round((property.occupiedUnits / property.totalUnits) * 100);

          return (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Property Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PropertyTypeIcon className="w-5 h-5 text-[#2C3539]" />
                      <h3 className="text-lg font-semibold text-[#2C3539]">{property.name}</h3>
                    </div>
                    <p className="text-sm text-[#6B7280]">{property.address}</p>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      <span className="text-sm text-[#6B7280]">Occupancy</span>
                    </div>
                    <p className="text-lg font-semibold text-[#2C3539]">{occupancyRate}%</p>
                    <p className="text-xs text-[#6B7280]">
                      {property.occupiedUnits} of {property.totalUnits} units
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#6B7280]" />
                      <span className="text-sm text-[#6B7280]">Revenue</span>
                    </div>
                    <p className="text-lg font-semibold text-[#2C3539]">
                      ${property.monthlyRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6B7280]">per month</p>
                  </div>
                </div>

                {/* Maintenance Status */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">
                      {property.maintenanceRequests} active requests
                    </span>
                  </div>
                  <button className="text-sm font-medium text-[#2C3539] hover:text-[#3d474c]">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}