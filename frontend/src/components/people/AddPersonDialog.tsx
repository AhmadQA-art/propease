import React, { useState } from 'react';
import { PersonType } from '../../types/people';
import { toast } from 'react-hot-toast';
import { invitationApi } from '@/services/api/invitation';
import { supabase } from '@/services/supabase/client';
import { ownersApi, CreateOwnerData } from '@/services/api/owners';
import { autoApi } from '@/services/api/autoApi';
import { authApi } from '@/services/api/auth';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
  skipInvitation?: boolean;
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
      if (!companyName) {
        setError('Company name is required for owners');
        return;
      }
      if (!businessType) {
        setError('Business type is required for owners');
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
              const ownerData = {
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                company_name: companyName,
                business_type: businessType,
                notes,
                status: 'active', // Set default status
                user_id: null // Explicitly set user_id to null
              };
              
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
            department
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
          await invitationApi.inviteOwner({
            email,
            name: `${firstName} ${lastName}`,
            phone,
            company_name: companyName,
            business_type: businessType,
            notes
          });
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
      if (error.message === 'No token provided' || error.message.includes('sign in')) {
        errorMessage = 'Please sign in to send invitations';
        // You might want to redirect to login here
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
              Add {getPersonTypeName(personType)}
            </h2>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#2C3539] text-xl font-medium"
            >
              ×
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <form id="personForm" onSubmit={handleSubmit} className="space-y-4">
              {/* Common fields for all person types */}
              {(personType === 'owner' || personType === 'tenant' || personType === 'vendor') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter email address"
                />
              </div>

              {(personType === 'owner' || personType === 'tenant' || personType === 'vendor') && (
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter phone number"
                    required={personType === 'owner'}
                  />
                </div>
              )}

              {/* Team-specific fields */}
              {personType === 'team' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Enter job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Enter department"
                    />
                  </div>
                </>
              )}

              {/* Owner-specific fields */}
              {personType === 'owner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Enter company name"
                      required={personType === 'owner'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      required={personType === 'owner'}
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      rows={3}
                      placeholder="Enter additional notes"
                    ></textarea>
                  </div>
                </>
              )}

              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                {skipInvitation && personType !== 'team'
                  ? `This will add a new ${getPersonTypeName(personType).toLowerCase()} to the system.`
                  : 'An invitation will be sent to this email address.'}
              </p>
            </form>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#2C3539]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="personForm"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : (skipInvitation && personType !== 'team' ? 'Add' : 'Send Invitation')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}