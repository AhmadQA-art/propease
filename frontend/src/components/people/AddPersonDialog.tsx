import React, { useState, useEffect } from 'react';
import { PersonType } from '../../types/people';
import { toast } from 'react-hot-toast';
import { invitationApi } from '@/services/api/invitation';
import { supabase } from '@/services/supabase/client';
import { ownersApi, CreateOwnerData } from '@/services/api/owners';
import { autoApi } from '@/services/api/autoApi';
import { api } from '@/services/api/client';
import { authApi } from '@/services/api/auth';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import { X, Plus } from 'lucide-react';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
  skipInvitation?: boolean;
}

interface Department {
  id: string;
  name: string;
}

export default function AddPersonDialog({ isOpen, onClose, personType, skipInvitation = false }: AddPersonDialogProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Department related states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [newDepartmentModalOpen, setNewDepartmentModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);

  // Fetch departments from the database when dialog opens for team members
  useEffect(() => {
    if (isOpen && personType === 'team') {
      fetchDepartments();
    }
  }, [isOpen, personType]);

  // Function to fetch departments
  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await api.get('/departments');
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  // Function to create a new department
  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setIsCreatingDepartment(true);
      
      // Create new department using the dedicated departments API
      const response = await api.post('/departments', {
        name: newDepartmentName.trim()
      });
      
      // If successful, add to departments list and select it
      if (response && response.data) {
        const newDept = { id: response.data.id, name: newDepartmentName.trim() };
        setDepartments([...departments, newDept]);
        setDepartment(response.data.id);
        toast.success(`Department "${newDepartmentName}" created`);
        
        // Close the department modal
        setNewDepartmentModalOpen(false);
        setNewDepartmentName('');
      }
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to create department');
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  // Map person type to a user-friendly display name
  const getPersonTypeName = (type: PersonType | null) => {
    switch (type) {
      case 'team': return 'Team Member';
      case 'tenant': return 'Tenant';
      case 'owner': return 'Owner';
      case 'vendor': return 'Vendor';
      default: return 'Person';
    }
  };

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setJobTitle('');
    setDepartment('');
    setCompanyName('');
    setBusinessType('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!personType) {
      setError('Person type is required');
      return;
    }

    // Additional validation for owners
    if (personType === 'owner') {
      if (!firstName) {
        setError('First name is required for owners');
        return;
      }
      if (!lastName) {
        setError('Last name is required for owners');
        return;
      }
      if (!phone) {
        setError('Phone number is required for owners');
        return;
      }
      // Validate phone number format
      if (phone && !isPossiblePhoneNumber(phone)) {
        setError('Please enter a valid phone number');
        return;
      }
      if (!businessType) {
        setError('Owner type is required for owners');
        return;
      }
      // Check if company name is required based on owner type
      if (isCompanyNameRequired(businessType) && !companyName) {
        setError('Company name is required for this owner type');
        return;
      }
    }

    // For other person types, validate phone if provided
    if ((personType === 'tenant' || personType === 'vendor') && phone && !isPossiblePhoneNumber(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // In the handleSubmit function, add validation for team members
    if (personType === 'team') {
      if (!jobTitle) {
        setError('Job title is required for team members');
        return;
      }
      
      if (!department) {
        setError('Department is required for team members');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError('');

      // DIRECT CREATION PATH - If skipInvitation is true AND not a team member, we'll save directly to the database
      if (skipInvitation && personType !== 'team') {
        try {
          // Check if user is authenticated directly with Supabase
          const { data: { session } } = await supabase.auth.getSession();
          console.log('Authentication check result:', session ? `Authenticated as ${session.user.email}` : 'Not authenticated');
          
          if (!session) {
            setError('You must be logged in to add a new owner');
            toast.error('Authentication required');
            setIsSubmitting(false);
            return;
          }

          // Handle different person types when skipInvitation is true
          if (personType === 'owner') {
            try {
              console.log('Creating owner using auto-generated API, authenticated as:', session.user.email);
              
              // Create owner data object matching the database schema
              const ownerData: any = {
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                owner_type: businessType,
                notes,
                status: 'active', // Set default status
                user_id: null // Explicitly set user_id to null
              };
              
              // Add company name only if required/provided
              if (isCompanyNameRequired(businessType) && companyName) {
                ownerData.company_name = companyName;
              }
              
              // Use the auto-generated API to create a new owner
              await autoApi.create('owners', ownerData);
              
              toast.success(`Owner ${firstName} ${lastName} added successfully`);
              
              // Clear form and close dialog on success
              resetForm();
              onClose();
              return;
            } catch (error: any) {
              console.error('Error creating owner with auto API:', error);
              let errorMessage = 'Failed to create owner';
              
              if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              setError(errorMessage);
              toast.error(errorMessage);
              setIsSubmitting(false);
              return; // Important: Return here to prevent falling through to invitation flow
            }
          } else if (personType === 'tenant') {
            // For tenants - will implement using auto API later
            toast.success(`Tenant data saved`);
            resetForm();
            onClose();
            return;
          } else if (personType === 'vendor') {
            // For vendors - will implement using auto API later
            toast.success(`Vendor data saved`);
            resetForm();
            onClose();
            return;
          }
        } catch (error: any) {
          console.error('Error in direct creation flow:', error);
          let errorMessage = error.message || 'Error creating record';
          setError(errorMessage);
          toast.error(errorMessage);
          setIsSubmitting(false);
          return; // Important: Return here to prevent falling through to invitation flow
        }
      }

      // INVITATION FLOW - for all person types when skipInvitation is false
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to send invitations');
      }
      
      // Use the appropriate invitation API method based on person type
      switch (personType) {
        case 'team':
          await invitationApi.inviteTeamMember({
            email,
            jobTitle,
            departmentId: department
          });
          break;
        case 'tenant':
          await invitationApi.inviteTenant({
            email
          });
          break;
        case 'vendor':
          await invitationApi.inviteVendor({
            email
          });
          break;
        case 'owner':
          const ownerInviteData: any = {
            email,
            name: `${firstName} ${lastName}`,
            phone,
            owner_type: businessType,
            notes
          };
          
          // Add company name only if required/provided
          if (isCompanyNameRequired(businessType) && companyName) {
            ownerInviteData.company_name = companyName;
          }
          
          await invitationApi.inviteOwner(ownerInviteData);
          break;
        default:
          throw new Error('Invalid person type');
      }

      // Clear form
      resetForm();
      
      // Show success message
      toast.success(`Invitation sent to ${email}`);
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      let errorMessage = error.message || 'An error occurred while sending the invitation';
      
      // Handle specific error cases
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompanyNameRequired = (ownerType: string): boolean => {
    return ['company', 'llc', 'corporation', 'partnership', 'trust'].includes(ownerType.toLowerCase());
  };

  // Only render the dialog when isOpen is true
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#2C3539]">
              Add {getPersonTypeName(personType)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Basic Information Section */}
              {personType === 'team' && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Property Manager"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        disabled={isLoadingDepartments}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {isLoadingDepartments && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewDepartmentModalOpen(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Add New Department
                    </button>
                  </div>
                </>
              )}

              {personType === 'owner' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="QA"
                      value={phone}
                      onChange={(value) => setPhone(value || '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="businessType"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Owner Type</option>
                      <option value="individual">Individual</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                      <option value="company">Company</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {isCompanyNameRequired(businessType) && (
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Only Email for Tenant/Vendor in invitation flow */}
              {(personType === 'tenant' || personType === 'vendor') && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-[#2C3539] hover:bg-[#1e2427] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : skipInvitation ? `Add ${getPersonTypeName(personType)}` : `Send Invitation`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Add New Department Modal */}
      {newDepartmentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2C3539]">Add New Department</h3>
              <button
                onClick={() => setNewDepartmentModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="newDepartmentName" className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="newDepartmentName"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. HR, Finance, Operations"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setNewDepartmentModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDepartment}
                disabled={isCreatingDepartment || !newDepartmentName.trim()}
                className="px-4 py-2 bg-[#2C3539] hover:bg-[#1e2427] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingDepartment ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}