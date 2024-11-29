import React from 'react';
import { Vendor } from '../../types/people';
import { Star, Calendar, DollarSign, Activity, MapPin } from 'lucide-react';

interface VendorViewProps {
  vendors: Vendor[];
}

export default function VendorView({ vendors }: VendorViewProps) {
  return (
    <div className="space-y-6">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              {vendor.imageUrl ? (
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-[#2C3539]">{vendor.company}</h3>
                <p className="text-[#6B7280]">{vendor.service}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="ml-1 font-medium">{vendor.rating}/5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-[#6B7280] mb-2">Contact Information</h4>
              <div className="space-y-2">
                <p className="text-sm text-[#2C3539]">
                  <span className="font-medium">Contact Person:</span> {vendor.name}
                </p>
                <p className="text-sm text-[#2C3539]">
                  <span className="font-medium">Email:</span> {vendor.email}
                </p>
                <p className="text-sm text-[#2C3539]">
                  <span className="font-medium">Phone:</span> {vendor.phone}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#6B7280] mb-2">Service History</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-[#2C3539]">
                  <Activity className="w-4 h-4 mr-2 text-[#6B7280]" />
                  {vendor.totalServices} Total Services
                </div>
                <div className="flex items-center text-sm text-[#2C3539]">
                  <Calendar className="w-4 h-4 mr-2 text-[#6B7280]" />
                  Last Service: {new Date(vendor.lastService).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#6B7280] mb-2">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {vendor.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}