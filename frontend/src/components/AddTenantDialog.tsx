import React, { useState, useEffect } from 'react';
import { X, Search, Plus, User } from 'lucide-react';
import { Tenant } from '../types/tenant';
import { supabase } from '../config/supabase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { peopleApi } from '../services/api/people';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Tenant) => void;
  existingTenants: Tenant[];
  onSelectExisting: (tenant: Tenant) => void;
}

// Contact method options for the multi-select
const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

// Fallback organization ID for development/testing
const FALLBACK_ORGANIZATION_ID = '94152e65-aeba-4496-ad7a-e3f539b9d5e7';

export default function AddTenantDialog({
  isOpen,
  onClose,
  onAddTenant,
  existingTenants,
  onSelectExisting
}: AddTenantDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContactMethods: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [orgIdStatus, setOrgIdStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Fetch organization ID when dialog opens
  useEffect(() => {
    const fetchOrganizationId = async () => {
      try {
        console.log('Fetching organization ID for tenant creation...');
        setOrgIdStatus('loading');
        
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
    };
    
    if (isOpen) {
      fetchOrganizationId();
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  const filteredTenants = existingTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.phone && tenant.phone.includes(searchTerm))
  );

  const handleContactMethodChange = (option: { value: string, label: string }, isSelected: boolean) => {
    setNewTenant(prev => {
      const methods = [...prev.preferredContactMethods];
      if (isSelected) {
        methods.push(option.value);
      } else {
        const index = methods.indexOf(option.value);
        if (index !== -1) {
          methods.splice(index, 1);
        }
      }
      return { ...prev, preferredContactMethods: methods };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate form fields
      if (!newTenant.firstName || !newTenant.lastName || !newTenant.email || !newTenant.phone) {
        throw new Error('Please fill in all required fields');
      }
      
      // Check if we have an organization ID
      if (!organizationId) {
        throw new Error('Cannot create tenant: Organization ID is required. Please refresh or contact support.');
      }
      
      // Create tenant object for database
      const tenantData = {
        firstName: newTenant.firstName,
        lastName: newTenant.lastName,
        email: newTenant.email,
        phone: newTenant.phone,
        preferredContactMethods: newTenant.preferredContactMethods,
        organization_id: organizationId
      };
      
      try {
        // Call API to create tenant in database
        const createdTenant = await peopleApi.createTenant(tenantData);
        
        // Map the returned tenant from peopleApi format to the Lease form Tenant format
        const mappedTenant: Tenant = {
          id: createdTenant.id,
          name: `${newTenant.firstName} ${newTenant.lastName}`,
          email: newTenant.email,
          phone: newTenant.phone
        };
        
        // Call onAddTenant with the mapped tenant that matches the Lease form's expected format
        onAddTenant(mappedTenant);
        
        // Reset form
        setNewTenant({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          preferredContactMethods: []
        });
        
        // Close form
        setShowAddForm(false);
      } catch (apiError: any) {
        console.error('API Error creating tenant:', apiError);
        throw new Error(apiError.message || 'Failed to save tenant to database');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add tenant');
      console.error('Error adding tenant:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30" 
        onClick={onClose}
      ></div>
      
      {/* Modal Dialog */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
            <h3 className="text-lg font-semibold text-[#2C3539]">
              {showAddForm ? 'Add New Tenant' : 'Select Tenant'}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

          {/* Content */}
          {showAddForm ? (
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
                    value={newTenant.firstName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, firstName: e.target.value }))}
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
                    value={newTenant.lastName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, lastName: e.target.value }))}
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
                  value={newTenant.email}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
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
                  value={newTenant.phone}
                  onChange={(value) => setNewTenant(prev => ({ ...prev, phone: value || '' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Phone number"
                  disabled={submitting || orgIdStatus === 'loading'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Preferred Contact Methods
                </label>
                <div className="space-y-2">
                  {contactMethodOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTenant.preferredContactMethods.includes(option.value)}
                        onChange={(e) => handleContactMethodChange(option, e.target.checked)}
                        className="mr-2 h-4 w-4 text-[#2C3539] focus:ring-[#2C3539]"
                        disabled={submitting || orgIdStatus === 'loading'}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Select all contact methods that apply
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-[#2C3539] hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
                  disabled={submitting || orgIdStatus === 'loading' || !organizationId}
                >
                  {submitting ? 'Adding...' : 'Add Tenant'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      onClick={() => onSelectExisting(tenant)}
                      className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#2C3539]">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.email}</p>
                      </div>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="text-center text-gray-500 py-2">
                    No tenants found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No existing tenants available
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center text-sm text-[#2C3539] hover:text-[#3d474c]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add new tenant
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-[#2C3539] hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}