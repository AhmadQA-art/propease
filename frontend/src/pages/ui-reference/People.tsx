import React from 'react';
import { User, Mail, Phone, Briefcase, Activity, Building2, Calendar, DollarSign, Star } from 'lucide-react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';


const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paid':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function People() {
  return (
    <div className="space-y-8">

      <div className="flex items-center space-x-4">
        <Link 
          to="/ui-reference" 
          className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to UI Reference
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">People Components</h1>
        <p className="text-[#6B7280] mt-1">Person cards and related components</p>
      </div>

        {/* People Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">People Cards</h2>
          <div className="p-6 border border-gray-200 rounded-xl space-y-6">
            {/* Team Member Card Example */}
            <div>
              <h3 className="text-sm font-medium text-[#2C3539] mb-3">Team Member Card</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-[#2C3539]">John Smith</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                        active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4 mr-2" />
                    john.smith@example.com
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4 mr-2" />
                    (555) 123-4567
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Senior Manager - Engineering
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Activity className="w-4 h-4 mr-2" />
                    5 Active Tasks
                  </div>
                </div>
              </div>
            </div>

            {/* Tenant Card Example */}
            <div>
              <h3 className="text-sm font-medium text-[#2C3539] mb-3">Tenant Card</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-[#2C3539]">Sarah Johnson</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('paid')}`}>
                        paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4 mr-2" />
                    sarah.j@example.com
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4 mr-2" />
                    (555) 987-6543
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Building2 className="w-4 h-4 mr-2" />
                    Sunset Apartments - Unit 204
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Lease: Jan 1, 2024 - Dec 31, 2024
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Rent Status: <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor('paid')}`}>
                      paid
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Card Example */}
            <div>
              <h3 className="text-sm font-medium text-[#2C3539] mb-3">Vendor Card</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-[#2C3539]">Mike Wilson</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                        active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4 mr-2" />
                    mike@acmeservices.com
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4 mr-2" />
                    (555) 345-6789
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Building2 className="w-4 h-4 mr-2" />
                    Acme Maintenance Services - General Maintenance
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Star className="w-4 h-4 mr-2" />
                    Rating: 4.8/5
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Activity className="w-4 h-4 mr-2" />
                    45 Total Services
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-[#6B7280] mt-4">
              <p>Usage:</p>
              <ul className="list-disc list-inside">
                <li>Cards maintain consistent padding (p-6) and border radius (rounded-xl)</li>
                <li>Each card type has specific icons and information relevant to its category</li>
                <li>Status badges use consistent color coding across all card types</li>
                <li>Information is organized with consistent spacing (space-y-3)</li>
                <li>Icons are consistently sized (w-4 h-4) with right margin (mr-2)</li>
              </ul>
            </div>
          </div>
        </div>

        
    </div>
  );
}