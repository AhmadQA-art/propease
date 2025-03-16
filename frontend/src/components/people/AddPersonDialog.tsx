import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PersonType } from '../../types/people';
import { toast } from 'react-hot-toast';
import { invitationApi } from '@/services/api/invitation';
import { supabase } from '@/services/supabase/client';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
}

export default function AddPersonDialog({ isOpen, onClose, personType }: AddPersonDialogProps) {
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
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

    try {
      setIsSubmitting(true);
      setError('');

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
            email
          });
          break;
        default:
          throw new Error('Invalid person type');
      }

      // Clear form
      setEmail('');
      setJobTitle('');
      setDepartment('');
      
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
              className="text-[#6B7280] hover:text-[#2C3539]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <form id="personForm" onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                An invitation will be sent to this email address.
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
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}