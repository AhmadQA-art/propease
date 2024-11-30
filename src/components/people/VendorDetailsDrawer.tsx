import React from 'react';
import { X, Star, Phone, Mail, Building2, Wrench, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Vendor } from '../../types/people';

interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export default function VendorDetailsDrawer({ isOpen, onClose, vendor }: VendorDetailsDrawerProps) {
  if (!isOpen || !vendor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C3539]">
            Vendor Details
          </h2>
          <button
            className="p-1 rounded-md text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Vendor Profile Header */}
          <div className="flex items-center space-x-4">
            {vendor.imageUrl ? (
              <img
                src={vendor.imageUrl}
                alt={vendor.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-[#2C3539]">{vendor.name}</h3>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize mt-1 ${getStatusColor(vendor.status)}`}>
                {vendor.status}
              </span>
            </div>
          </div>

          {/* Company and Service */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280] block">Company</label>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.company}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#6B7280] block">Service Type</label>
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.service}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#2C3539]">Contact Information</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.phone}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">Rating</label>
            <div className="flex items-center space-x-1">
              {getRatingStars(vendor.rating)}
              <span className="ml-2 text-sm text-[#6B7280]">
                {vendor.rating} out of 5
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button className="w-full py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
              Contact Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
