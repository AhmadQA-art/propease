import React, { useState } from 'react';
import { Vendor } from '../../types/people';
import { Star, Activity, Plus, Search, Filter } from 'lucide-react';
import AddPersonDialog from './AddPersonDialog';
import VendorDetailsDrawer from './VendorDetailsDrawer';

interface VendorViewProps {
  vendors: Vendor[];
}

export default function VendorView({ vendors }: VendorViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isAddVendorDialogOpen, setIsAddVendorDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isVendorDetailsOpen, setIsVendorDetailsOpen] = useState(false);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsFilterDropdownOpen(false);
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsVendorDetailsOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-[#2C3539]" />
            </button>
            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <button
                    onClick={() => handleTypeSelect('all')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => handleTypeSelect('plumbing')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Plumbing
                  </button>
                  <button
                    onClick={() => handleTypeSelect('electrical')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Electrical
                  </button>
                  <button
                    onClick={() => handleTypeSelect('hvac')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    HVAC
                  </button>
                  <button
                    onClick={() => handleTypeSelect('cleaning')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Cleaning
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsAddVendorDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </button>
      </div>

      {vendors.map((vendor) => (
        <div 
          key={vendor.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-gray-200 transition-colors"
          onClick={() => handleVendorClick(vendor)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {vendor.imageUrl ? (
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#2C3539]">{vendor.company}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[#6B7280]">{vendor.service}</p>
                  <p className="text-[#6B7280]">{vendor.name}</p>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1 text-sm">{vendor.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Activity className="w-4 h-4 mr-1" />
              {vendor.totalServices} Services
            </div>
          </div>
        </div>
      ))}
      {/* Add Vendor Dialog */}
      <AddPersonDialog
        isOpen={isAddVendorDialogOpen}
        onClose={() => setIsAddVendorDialogOpen(false)}
        personType="vendor"
      />

      <VendorDetailsDrawer
        isOpen={isVendorDetailsOpen}
        onClose={() => {
          setIsVendorDetailsOpen(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />
    </div>
  );
}