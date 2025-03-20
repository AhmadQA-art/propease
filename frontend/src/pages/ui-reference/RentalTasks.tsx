import React from 'react';
import { Search, Plus, Wrench, Clock, User, Users2 } from 'lucide-react';

export default function RentalTasksReference() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Tasks Component</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#2C3539]">Property Tasks</h2>
            <p className="text-sm text-[#6B7280]">Manage property-specific tasks and maintenance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search property tasks..."
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
              />
            </div>
            <button className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Property Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {/* Unit Maintenance Task */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex">
                <div className="mr-4">
                  <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Wrench className="w-7 h-7 text-[#2C3539]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539]">Unit 303 - AC Maintenance</h3>
                  <p className="text-sm text-[#6B7280] mt-1">Scheduled quarterly AC maintenance check and filter replacement.</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Due Apr 5, 2024
                    </div>
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <User className="w-4 h-4 mr-1.5" />
                      Tech: James Wilson
                    </div>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Scheduled
              </span>
            </div>
          </div>

          {/* Property Inspection Task */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex">
                <div className="mr-4">
                  <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Users2 className="w-7 h-7 text-[#2C3539]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539]">Annual Property Inspection</h3>
                  <p className="text-sm text-[#6B7280] mt-1">Complete inspection of all units and common areas for compliance.</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Due May 1, 2024
                    </div>
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <User className="w-4 h-4 mr-1.5" />
                      Lead: Sarah Chen
                    </div>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                In Progress
              </span>
            </div>
          </div>

          {/* Emergency Repair Task */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex">
                <div className="mr-4">
                  <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Wrench className="w-7 h-7 text-[#2C3539]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539]">Unit 101 - Emergency Plumbing</h3>
                  <p className="text-sm text-[#6B7280] mt-1">Water leak reported in bathroom. Immediate attention required.</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Due Today
                    </div>
                    <div className="flex items-center text-sm text-[#6B7280]">
                      <User className="w-4 h-4 mr-1.5" />
                      Tech: Mike Rodriguez
                    </div>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Urgent
              </span>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-[#2C3539] mb-2">Rental Tasks Component Usage Guidelines:</h4>
          <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
            <li>Property-specific task features:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Unit number prominently displayed in task title</li>
                <li>Property-wide vs unit-specific task differentiation</li>
                <li>Maintenance staff assignment tracking</li>
                <li>Priority-based status indicators</li>
              </ul>
            </li>
            <li>Status indicators:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Yellow for scheduled tasks</li>
                <li>Blue for in-progress tasks</li>
                <li>Red for urgent/emergency tasks</li>
                <li>Green for completed tasks</li>
              </ul>
            </li>
            <li>Task organization:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Group by property/unit</li>
                <li>Sort by priority and due date</li>
                <li>Filter by maintenance type</li>
                <li>Search by unit number or description</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}