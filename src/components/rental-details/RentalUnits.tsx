import React, { useState } from 'react';
import { DoorOpen, Calendar, Wrench, User, Search } from 'lucide-react';
import UnitDetailsDrawer from './UnitDetailsDrawer';
import AddUnitForm from './AddUnitForm';

// Sample data - replace with actual data
const units = [
  {
    id: '1',
    number: '101',
    type: 'residential',
    rentAmount: 1500,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'occupied',
    maintenance: false,
    resident: {
      name: 'John Smith'
    }
  },
  {
    id: '2',
    number: '102',
    type: 'residential',
    rentAmount: 1600,
    status: 'vacant',
    maintenance: true,
    resident: null
  },
  {
    id: '3',
    number: '201',
    type: 'commercial',
    rentAmount: 2500,
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    status: 'occupied',
    maintenance: false,
    resident: {
      name: 'Tech Solutions Inc.'
    }
  }
];

export default function RentalUnits() {
  const [selectedUnit, setSelectedUnit] = useState<typeof units[0] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddUnit = (unitData: any) => {
    // TODO: Implement unit addition logic
    console.log('Adding new unit:', unitData);
  };

  const filteredUnits = units.filter(unit => 
    unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unit.resident?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3539]">Units</h2>
          <p className="text-sm text-[#6B7280]">Manage your property units</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
            />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm"
          >
            Add Unit
          </button>
        </div>
      </div>

      {/* Units List */}
      <div className="p-4 space-y-4">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => {
              setSelectedUnit(unit);
              setIsDrawerOpen(true);
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              {/* Left Section - Unit Number and Maintenance */}
              <div className="flex-none w-48 flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <DoorOpen className="w-4 h-4 text-[#2C3539]" />
                  <span className="font-medium text-[#2C3539]">Unit {unit.number}</span>
                </div>
                {unit.maintenance && (
                  <div className="flex items-center space-x-1 text-amber-600">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs">Maintenance</span>
                  </div>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-grow" />

              {/* Right Section */}
              <div className="flex items-center space-x-8">
                {/* Rent Amount - Only show for occupied units */}
                {unit.status === 'occupied' && (
                  <span className="text-sm text-[#6B7280]">${unit.rentAmount.toLocaleString()}/month</span>
                )}

                {/* Resident Info */}
                <div className="w-64 flex flex-col items-center">
                  {unit.resident && (
                    <>
                      <div className="flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-sm text-[#2C3539]">{unit.resident.name}</span>
                      </div>
                      {unit.endDate && (
                        <div className="flex items-center space-x-1 text-xs text-[#6B7280]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Lease ends {new Date(unit.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Status */}
                <span className={`px-2 py-0.5 text-xs rounded-full capitalize
                  ${unit.status === 'occupied' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {unit.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Backdrop */}
      {(isDrawerOpen || isFormOpen) && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => {
            setIsDrawerOpen(false);
            setIsFormOpen(false);
            setSelectedUnit(null);
          }}
        />
      )}

      {/* Unit Details Drawer */}
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUnit(null);
        }}
      />

      {/* Add Unit Form */}
      <AddUnitForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddUnit}
      />
    </div>
  );
}