import React, { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { peopleApi } from '../../services/api/people';
import type { Tenant } from '../../types/people';
import { supabase } from '../../services/supabase/client';

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
  property: string;
  unit: string;
}

// Mock property options for the dropdown selection
const mockProperties = [
  { value: '123e4567-e89b-12d3-a456-426614174000', label: 'Sunset Apartments' },
  { value: '223e4567-e89b-12d3-a456-426614174001', label: 'Ocean View Complex' },
  { value: '323e4567-e89b-12d3-a456-426614174002', label: 'Mountain View Residences' },
  { value: '423e4567-e89b-12d3-a456-426614174003', label: 'Downtown Lofts' },
  { value: '523e4567-e89b-12d3-a456-426614174004', label: 'Riverside Condos' },
];

// Mock unit options based on selected property
const mockUnits = {
  '123e4567-e89b-12d3-a456-426614174000': [
    { value: '623e4567-e89b-12d3-a456-426614174101', label: 'Unit 101' },
    { value: '623e4567-e89b-12d3-a456-426614174102', label: 'Unit 102' },
    { value: '623e4567-e89b-12d3-a456-426614174103', label: 'Unit 103' },
  ],
  '223e4567-e89b-12d3-a456-426614174001': [
    { value: '723e4567-e89b-12d3-a456-426614174201', label: 'Unit 201' },
    { value: '723e4567-e89b-12d3-a456-426614174202', label: 'Unit 202' },
  ],
  '323e4567-e89b-12d3-a456-426614174002': [
    { value: '823e4567-e89b-12d3-a456-426614174301', label: 'Unit 301' },
    { value: '823e4567-e89b-12d3-a456-426614174302', label: 'Unit 302' },
    { value: '823e4567-e89b-12d3-a456-426614174303', label: 'Unit 303' },
    { value: '823e4567-e89b-12d3-a456-426614174304', label: 'Unit 304' },
  ],
  '423e4567-e89b-12d3-a456-426614174003': [
    { value: '923e4567-e89b-12d3-a456-426614174401', label: 'Unit 401' },
    { value: '923e4567-e89b-12d3-a456-426614174402', label: 'Unit 402' },
  ],
  '523e4567-e89b-12d3-a456-426614174004': [
    { value: 'a23e4567-e89b-12d3-a456-426614174501', label: 'Unit 501' },
    { value: 'a23e4567-e89b-12d3-a456-426614174502', label: 'Unit 502' },
    { value: 'a23e4567-e89b-12d3-a456-426614174503', label: 'Unit 503' },
  ],
};

// Fallback organization ID for development/testing
const FALLBACK_ORGANIZATION_ID = '94152e65-aeba-4496-ad7a-e3f539b9d5e7';

export default function AddTenantDialog({ isOpen, onClose, onSuccess }: AddTenantDialogProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    property: '',
    unit: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [orgIdStatus, setOrgIdStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Get available units based on selected property
  const availableUnits = formData.property ? mockUnits[formData.property as keyof typeof mockUnits] || [] : [];

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
      
      // Check if unit is a valid UUID
      const isValidUuid = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      };

      // For demo purposes, we'll set unit_id to null since mock data doesn't use real UUIDs
      const unit_id = formData.unit && isValidUuid(formData.unit) ? formData.unit : null;
      
      // Convert form data to match the Tenant type
      const tenantData: Partial<Tenant> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        property: formData.property ? mockProperties.find(p => p.value === formData.property)?.label || '' : '',
        unit: unit_id, // Only pass if it's a valid UUID, otherwise null
        organization_id: organizationId
      };
      
      console.log('Submitting tenant data with organization ID:', organizationId);
      console.log('Unit ID being sent (null if invalid UUID):', unit_id);
      
      // Call the API to create the tenant
      const newTenant = await peopleApi.createTenant(tenantData);
      
      // Reset form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        property: '',
        unit: '',
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
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Phone number"
                  disabled={submitting || orgIdStatus === 'loading'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Property
                </label>
                <SearchableDropdown
                  options={mockProperties}
                  selectedValues={formData.property ? [formData.property] : []}
                  onChange={(values) => {
                    const property = values[0] || '';
                    setFormData(prev => ({ 
                      ...prev, 
                      property, 
                      // Reset unit if property changes
                      unit: property !== prev.property ? '' : prev.unit 
                    }));
                  }}
                  placeholder="Select property"
                  disabled={submitting || orgIdStatus === 'loading'}
                />
                <div className="mt-1 text-xs text-blue-600">
                  <i>Note: This is a development preview. Property/unit selection will not affect the created tenant.</i>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Unit
                </label>
                <SearchableDropdown
                  options={availableUnits}
                  selectedValues={formData.unit ? [formData.unit] : []}
                  onChange={(values) => setFormData(prev => ({ ...prev, unit: values[0] || '' }))}
                  placeholder={formData.property ? "Select unit" : "Select a property first"}
                  disabled={!formData.property || submitting || orgIdStatus === 'loading'}
                />
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
