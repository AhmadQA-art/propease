import React, { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { peopleApi } from '../../services/api/people';
import type { Tenant } from '../../types/people';
import { supabase } from '../../services/supabase/client';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tenant: Tenant) => void;
}

interface TenantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethods: string[];
}

// Contact method options for the multi-select
const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

// Mock property options for the dropdown selection
const mockProperties = [
  { value: '123e4567-e89b-12d3-a456-426614174000', label: 'Sunset Apartments' },
  { value: '223e4567-e89b-12d3-a456-426614174001', label: 'Ocean View Complex' },
  { value: '323e4567-e89b-12d3-a456-426614174002', label: 'Mountain View Residences' },
  { value: '423e4567-e89b-12d3-a456-426614174003', label: 'Downtown Lofts' },
  { value: '523e4567-e89b-12d3-a456-426614174004', label: 'Riverside Condos' },
];

// Fallback organization ID for development/testing
const FALLBACK_ORGANIZATION_ID = '94152e65-aeba-4496-ad7a-e3f539b9d5e7';

export default function AddTenantDialog({ isOpen, onClose, onSuccess }: AddTenantDialogProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContactMethods: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [orgIdStatus, setOrgIdStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Fetch the current user's organization ID on component mount
  useEffect(() => {
    async function fetchOrganizationId() {
      try {
        console.log('Fetching organization ID for tenant creation...');
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
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }
      
      // Check if we have an organization ID
      if (!organizationId) {
        throw new Error('Cannot create tenant: Organization ID is required. Please refresh or contact support.');
      }
      
      // Convert form data to match the Tenant type
      const tenantData: Partial<Tenant> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferredContactMethods: formData.preferredContactMethods,
        organization_id: organizationId
      };
      
      console.log('Submitting tenant data with organization ID:', organizationId);
      
      // Call the API to create the tenant
      const newTenant = await peopleApi.createTenant(tenantData);
      
      // Reset form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        preferredContactMethods: [],
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(newTenant);
      }
      
      // Close dialog
      onClose();
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      setError(err.message || 'Failed to create tenant. Please try again.');
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
              Add New Tenant
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="First name"
                    disabled={submitting || orgIdStatus === 'loading'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Last name"
                    disabled={submitting || orgIdStatus === 'loading'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Email address"
                  disabled={submitting || orgIdStatus === 'loading'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="QA"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Phone number"
                  disabled={submitting || orgIdStatus === 'loading'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Preferred Contact Methods
                </label>
                <SearchableDropdown
                  options={contactMethodOptions}
                  selectedValues={formData.preferredContactMethods}
                  onChange={(values) => setFormData(prev => ({ ...prev, preferredContactMethods: values }))}
                  placeholder="Select contact methods"
                  disabled={submitting || orgIdStatus === 'loading'}
                  isMulti={true}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Select all contact methods that apply
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#2C3539]"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm font-medium disabled:opacity-50"
                disabled={submitting || orgIdStatus === 'loading' || !organizationId}
              >
                {submitting ? 'Adding...' : 'Add Tenant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
