import React from 'react';
import { Search, Plus, DoorOpen, DollarSign, User, Wrench } from 'lucide-react';

export default function UnitsReference() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Units Component</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header with Search and Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search units..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </button>
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {/* Occupied Unit Example */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-center">
              <div className="flex-none w-48 flex items-center space-x-2">
                <DoorOpen className="w-4 h-4 text-[#2C3539]" />
                <span className="font-medium text-[#2C3539]">Unit 101</span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Occupied
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">$1,500/month</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">John Smith</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vacant Unit Example */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-center">
              <div className="flex-none w-48 flex items-center space-x-2">
                <DoorOpen className="w-4 h-4 text-[#2C3539]" />
                <span className="font-medium text-[#2C3539]">Unit 102</span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Vacant
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">$1,600/month</span>
                </div>
                <div className="flex items-center">
                  <Wrench className="w-4 h-4 text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">Maintenance Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-[#2C3539] mb-2">Units Section Usage Guidelines:</h4>
          <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
            <li>Header includes search functionality and add unit button</li>
            <li>Each unit card displays:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Unit number with door icon</li>
                <li>Occupancy status with appropriate color badge</li>
                <li>Rental amount with currency icon</li>
                <li>Tenant name or maintenance status</li>
              </ul>
            </li>
            <li>Cards are interactive with hover states</li>
            <li>Consistent spacing and alignment throughout</li>
            <li>Status badges use contextual colors (green for occupied, gray for vacant)</li>
            <li>Icons are consistently sized and colored</li>
          </ul>
        </div>
      </div>
    </section>
  );
}