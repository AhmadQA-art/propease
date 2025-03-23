import React, { useEffect } from 'react';
import { X, Star, Phone, Mail, Building2, Wrench, User } from 'lucide-react';
import { Vendor } from '../../types/people';

interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export default function VendorDetailsDrawer({ isOpen, onClose, vendor }: VendorDetailsDrawerProps) {
  if (!isOpen || !vendor) return null;

  // Log vendor data to debug contact person email issue
  useEffect(() => {
    console.log('Vendor details:', vendor);
    console.log('Contact person email:', vendor.contact_person_email);
  }, [vendor]);

  const getRatingStars = (rating: number | undefined) => {
    const ratingValue = rating || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < ratingValue
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Determine the contact email to display (use vendor email if contact_person_email is missing)
  const contactEmail = vendor.contact_person_email || (vendor.contact_person_name ? vendor.email : '');

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
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#2C3539]">
                {vendor.vendor_name || vendor.company_name || vendor.company || 'Unknown Vendor'}
              </h3>
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">Service Type</label>
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#6B7280]" />
              <span className="text-[#2C3539]">{vendor.service_type || vendor.service || 'Not specified'}</span>
            </div>
          </div>

          {/* Vendor Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-[#2C3539]">Company Information</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.email || 'No email provided'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#6B7280]" />
                <span className="text-[#2C3539]">{vendor.phone || 'No phone provided'}</span>
              </div>
            </div>
          </div>

          {/* Contact Person Information - Always show this section if there's a contact person */}
          {vendor.contact_person_name && (
            <div className="space-y-4">
              <h4 className="font-medium text-[#2C3539]">Contact Person</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[#2C3539]">{vendor.contact_person_name}</span>
                </div>
                
                {contactEmail ? (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#2C3539]">{contactEmail}</span>
                    {!vendor.contact_person_email && vendor.email && (
                      <span className="text-xs text-gray-500 ml-1">(Company email)</span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No contact email provided</div>
                )}
              </div>
            </div>
          )}

          {/* Performance Rating */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280] block">Performance Rating</label>
            <div className="flex items-center space-x-1">
              {getRatingStars(vendor.performance_rating || vendor.rating)}
              <span className="ml-2 text-sm text-[#6B7280]">
                {vendor.performance_rating || vendor.rating || 0} out of 5
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          {vendor.notes && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280] block">Notes</label>
              <div className="p-3 bg-gray-50 rounded-md text-sm text-[#2C3539]">
                {vendor.notes}
              </div>
            </div>
          )}

          {/* Payment Terms */}
          {vendor.payment_terms && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280] block">Payment Terms</label>
              <div className="text-[#2C3539]">{vendor.payment_terms}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
