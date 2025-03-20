import React from 'react';
import { Search, Mail, Calendar, User, DollarSign, FileText } from 'lucide-react';

export default function RentalApplicationsReference() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Applications Component</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#2C3539]">Applications</h2>
            <p className="text-sm text-[#6B7280]">Manage rental applications</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent text-sm"
              />
            </div>
            <button className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm">
              Add Application
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {/* Pending Application Example */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"
                  alt="Applicant"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-[#2C3539] font-medium">Sarah Johnson</h3>
                  <div className="flex items-center text-sm text-[#6B7280] mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    sarah.j@example.com
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Desired Move-in
                </div>
                <p className="text-[#2C3539] font-medium">
                  Apr 1, 2024
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <User className="w-4 h-4 mr-2" />
                  Credit Score
                </div>
                <p className="text-[#2C3539] font-medium">
                  720
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Annual Income
                </div>
                <p className="text-[#2C3539] font-medium">
                  $75,000
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </div>
                <p className="text-[#2C3539] font-medium">
                  2 files
                </p>
              </div>
            </div>
          </div>

          {/* Approved Application Example */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[#2C3539] font-medium">Michael Chen</h3>
                  <div className="flex items-center text-sm text-[#6B7280] mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    michael.c@example.com
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approved
              </span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Desired Move-in
                </div>
                <p className="text-[#2C3539] font-medium">
                  Apr 15, 2024
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <User className="w-4 h-4 mr-2" />
                  Credit Score
                </div>
                <p className="text-[#2C3539] font-medium">
                  750
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Annual Income
                </div>
                <p className="text-[#2C3539] font-medium">
                  $85,000
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </div>
                <p className="text-[#2C3539] font-medium">
                  3 files
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-[#2C3539] mb-2">Rental Applications Usage Guidelines:</h4>
          <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
            <li>Header includes search functionality and add application button</li>
            <li>Each application card displays:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Applicant photo (or placeholder) and contact information</li>
                <li>Application status with color-coded badge</li>
                <li>Key details in a 4-column grid layout</li>
                <li>Consistent icon usage for each information type</li>
              </ul>
            </li>
            <li>Status badges use contextual colors:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Yellow for pending</li>
                <li>Green for approved</li>
                <li>Red for rejected</li>
              </ul>
            </li>
            <li>Cards are interactive with hover states</li>
            <li>Maintain consistent spacing and alignment</li>
            <li>Use proper date formatting for move-in dates</li>
            <li>Format currency and large numbers appropriately</li>
          </ul>
        </div>
      </div>
    </section>
  );
}