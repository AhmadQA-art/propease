import React, { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { peopleApi } from '../../services/api/people';
import { authApi } from '../../services/api/auth';
import type { Vendor } from '../../types/people';
import { supabase } from '../../services/supabase/client';
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface AddVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (vendor: Vendor) => void;
}

interface VendorFormData {
  // Vendor Details
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  serviceType: string;
  
  // Contact Person Details
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
}

// Service types for the dropdown
const serviceTypes = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'security', label: 'Security' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'other', label: 'Other' },
];

// Fallback organization ID for development/testing
const FALLBACK_ORGANIZATION_ID = '94152e65-aeba-4496-ad7a-e3f539b9d5e7';

export default function AddVendorDialog({ isOpen, onClose, onSuccess }: AddVendorDialogProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    // Vendor Details
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    serviceType: '',
    
    // Contact Person Details
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [orgIdStatus, setOrgIdStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Fetch the current user's organization ID on component mount
  useEffect(() => {
    async function fetchOrganizationId() {
      try {
        console.log('Fetching organization ID...');
        setOrgIdStatus('loading');
        
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Session status:', session ? 'Active' : 'No active session');
        
        if (session && session.user) {
          console.log('User ID:', session.user.id);
          
          // Get the user profile to find the organization ID
          const { data, error } = await supabase
            .from('user_profiles')
            .select('default_organization_id, organization_id')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            setOrgIdStatus('error');
            
            // Use fallback
            console.warn('Using fallback organization ID due to error');
            setOrganizationId(FALLBACK_ORGANIZATION_ID);
            return;
          }
          
          console.log('User profile data:', data);
          
          // Try default_organization_id first, then fallback to organization_id
          const orgId = data?.default_organization_id || data?.organization_id;
          
          if (orgId) {
            console.log('Using organization ID from profile:', orgId);
            setOrganizationId(orgId);
            setOrgIdStatus('success');
          } else {
            console.warn('No organization ID found in profile, using fallback');
            setOrganizationId(FALLBACK_ORGANIZATION_ID);
            setOrgIdStatus('success');
          }
        } else {
          console.warn('No active session, using fallback organization ID');
          setOrganizationId(FALLBACK_ORGANIZATION_ID);
          setOrgIdStatus('error');
        }
      } catch (err) {
        console.error('Error fetching organization ID:', err);
        setOrgIdStatus('error');
        
        // Use fallback as last resort
        console.warn('Using fallback organization ID due to exception');
        setOrganizationId(FALLBACK_ORGANIZATION_ID);
      }
    }
    
    if (isOpen) {
      fetchOrganizationId();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.vendorName || !formData.serviceType) {
        throw new Error('Vendor name and service type are required');
      }
      
      // Validate phone number if provided
      if (formData.vendorPhone && !isPossiblePhoneNumber(formData.vendorPhone)) {
        throw new Error('Please enter a valid phone number');
      }
      
      // Validate contact person phone if provided
      if (formData.contactPersonPhone && !isPossiblePhoneNumber(formData.contactPersonPhone)) {
        throw new Error('Please enter a valid contact person phone number');
      }
      
      // Check if we have an organization ID
      if (!organizationId) {
        throw new Error('Cannot create vendor: Organization ID is required. Please refresh or contact support.');
      }
      
      // Convert form data to match the vendors table schema
      const vendorData = {
        vendor_name: formData.vendorName,
        email: formData.vendorEmail,
        phone: formData.vendorPhone,
        service_type: formData.serviceType,
        contact_person_name: formData.contactPersonName,
        contact_person_email: formData.contactPersonEmail,
        contact_person_phone: formData.contactPersonPhone,
        organization_id: organizationId
      };
      
      console.log('Submitting vendor data with organization ID:', organizationId);
      
      // Call the API to create the vendor
      const newVendor = await peopleApi.createVendor(vendorData);
      
      // Reset form data
      setFormData({
        vendorName: '',
        vendorEmail: '',
        vendorPhone: '',
        serviceType: '',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: ''
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(newVendor);
      }
      
      // Close dialog
      onClose();
    } catch (err: any) {
      console.error('Error creating vendor:', err);
      setError(err.message || 'Failed to create vendor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#2C3539]">
              Add New Vendor
            </h2>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#2C3539]"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            {/* Organization ID Status Indicator */}
            {orgIdStatus === 'loading' && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm mb-4">
                Preparing form... Please wait.
              </div>
            )}
            
            {orgIdStatus === 'error' && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm mb-4">
                Warning: Using fallback organization ID. Contact administrator if you encounter issues.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Vendor Details Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[#2C3539] border-b pb-2">Vendor Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vendorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter company or business name"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Email address (optional)"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Phone
                  </label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="QA"
                    value={formData.vendorPhone}
                    onChange={(value) => setFormData(prev => ({ ...prev, vendorPhone: value || '' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Phone number (optional)"
                    disabled={submitting}
                  />
                  {formData.vendorPhone && !isPossiblePhoneNumber(formData.vendorPhone) && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid phone number</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={serviceTypes}
                    selectedValues={formData.serviceType ? [formData.serviceType] : []}
                    onChange={(values) => setFormData(prev => ({ ...prev, serviceType: values[0] || '' }))}
                    placeholder="Select service type"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              {/* Contact Person Details Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-[#2C3539] border-b pb-2">Contact Person Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Name of primary contact"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Contact Person Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPersonEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Contact person email"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Contact Person Phone
                  </label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="QA"
                    value={formData.contactPersonPhone}
                    onChange={(value) => setFormData(prev => ({ ...prev, contactPersonPhone: value || '' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Contact person phone number"
                    disabled={submitting}
                  />
                  {formData.contactPersonPhone && !isPossiblePhoneNumber(formData.contactPersonPhone) && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid phone number</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2C3539] rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  disabled={submitting || orgIdStatus === 'loading' || !organizationId}
                >
                  {submitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
