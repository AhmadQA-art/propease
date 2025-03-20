import React from 'react';
import { Search, Filter, Activity, FileText } from 'lucide-react';

export default function RentalActivitiesReference() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Activities Component</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-[#2C3539] mr-2" />
            <h2 className="text-lg font-semibold text-[#2C3539]">Property Activities</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
              />
            </div>
            <button className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-[#2C3539]" />
            </button>
          </div>
        </div>

        {/* Activities Timeline */}
        <div className="flow-root">
          <ul className="-mb-8">
            {/* Rent Payment Activity */}
            <li>
              <div className="relative pb-8">
                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Tenant"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#2C3539]">
                      <span className="font-medium">Unit 304</span>
                      {' '}rent payment received for{' '}
                      <span className="text-[#6B7280]">April 2024</span>
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Mar 15, 2024 2:30 PM</p>
                  </div>
                </div>
              </div>
            </li>

            {/* Maintenance Request */}
            <li>
              <div className="relative pb-8">
                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Maintenance Staff"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#2C3539]">
                      <span className="font-medium">Unit 201</span>
                      {' '}submitted maintenance request for{' '}
                      <span className="text-[#6B7280]">plumbing issue</span>
                    </p>
                    <p className="text-sm text-[#6B7280] mt-2 bg-gray-50 p-3 rounded-lg">
                      "Kitchen sink is clogged and water is draining slowly."
                    </p>
                    <p className="text-xs text-[#6B7280] mt-2">Mar 15, 2024 11:45 AM</p>
                  </div>
                </div>
              </div>
            </li>

            {/* Lease Update */}
            <li>
              <div className="relative pb-8">
                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Property Manager"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#2C3539]">
                      <span className="font-medium">Unit 102</span>
                      {' '}lease renewed for{' '}
                      <span className="text-[#6B7280]">12 months</span>
                    </p>
                    <div className="mt-2 flex items-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-[#2C3539] mr-2" />
                      <span className="text-sm text-[#6B7280]">lease_renewal_unit102.pdf</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">Mar 15, 2024 10:30 AM</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-[#2C3539] mb-2">Rental Activities Usage Guidelines:</h4>
          <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
            <li>Property-specific activities:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Rent payments and financial transactions</li>
                <li>Maintenance requests and updates</li>
                <li>Lease-related activities</li>
                <li>Property inspections and reports</li>
              </ul>
            </li>
            <li>Activity formatting:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Unit numbers in medium weight</li>
                <li>Activity types in regular weight</li>
                <li>Details in secondary color</li>
                <li>Timestamps in smaller, secondary color</li>
              </ul>
            </li>
            <li>Document handling:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Preview for attached documents</li>
                <li>Download functionality</li>
                <li>File type indicators</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}