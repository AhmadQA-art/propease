import React, { useState, useRef } from 'react';
import { X, User, Building2, Briefcase, Home, Upload } from 'lucide-react';
import { PersonType } from '../../types/people';
import { toast } from 'react-hot-toast';
import { peopleService } from '../../services/peopleService';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
}

interface BaseFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  invitation_methods: {
    email: boolean;
    sms: boolean;
  };
}

interface TeamMemberFormData extends BaseFormData {
  department: string;
  role: string;
  job_title: string;
}

interface TenantFormData extends BaseFormData {
  contact_preferences: string;
  documents: File[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

interface VendorFormData extends BaseFormData {
  service_type: string;
  business_type: string;
  notes: string;
  hourly_rate: string;
}

interface OwnerFormData extends BaseFormData {
  company_name: string;
  notes: string;
}

type FormData = TeamMemberFormData | TenantFormData | VendorFormData | OwnerFormData;

export default function AddPersonDialog({ isOpen, onClose, personType }: AddPersonDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>(() => {
    // Create base data with required type assertion
    const baseData: TeamMemberFormData = {
      first_name: '',
      last_name: '',
    email: '',
      phone: '',
      department: '',
    role: '',
      job_title: '',
      invitation_methods: {
        email: true,
        sms: false
      }
    };

    switch (personType) {
      case 'team':
        return baseData;
      case 'tenant':
        return {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          contact_preferences: '',
          documents: [],
          emergency_contact_name: '',
          emergency_contact_phone: '',
          emergency_contact_relationship: '',
          invitation_methods: {
            email: true,
            sms: false
          }
        } as TenantFormData;
      case 'vendor':
        return {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          service_type: '',
          business_type: '',
          notes: '',
          hourly_rate: '',
          invitation_methods: {
            email: true,
            sms: false
          }
        } as VendorFormData;
      case 'owner':
        return {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          company_name: '',
          notes: '',
          invitation_methods: {
            email: true,
            sms: false
          }
        } as OwnerFormData;
      default:
        return baseData;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loadingToastId = toast.loading(
      personType === 'team' 
        ? 'Sending invitation...' 
        : `Adding new ${personType}...`
    );

    try {
      // Create the person
      const personData = {
        ...formData,
        type: personType!,
      };

      const createdPerson = await peopleService.createPerson(personData);
      console.log('Person created:', createdPerson);

      // Show success message
      toast.success(
        personType === 'team'
          ? `Team member added successfully`
          : `${personType?.charAt(0).toUpperCase()}${personType?.slice(1)} added successfully`
      , {
        id: loadingToastId,
        duration: 3000,
      });

      // Handle document upload for tenants
      if (personType === 'tenant' && (formData as TenantFormData).documents.length > 0) {
        const documentsToast = toast.loading('Uploading documents...');
        try {
          const uploadResult = await peopleService.uploadDocuments(
            createdPerson.person.id,
            (formData as TenantFormData).documents
          );
          console.log('Documents uploaded:', uploadResult);
          
          toast.success('Documents uploaded successfully', {
            id: documentsToast,
          });
        } catch (error) {
          console.error('Error uploading documents:', error);
          toast.error('Failed to upload documents', {
            id: documentsToast,
          });
        }
      }

      // Handle invitations if methods were selected
      if (formData.invitation_methods.email || formData.invitation_methods.sms) {
        const inviteToast = toast.loading('Sending invitations...');
        try {
          const inviteResult = await peopleService.sendInvitations(
            createdPerson.profile.id,
            formData.invitation_methods
          );
          console.log('Invitations sent:', inviteResult);
          
          const methods = [];
          if (formData.invitation_methods.email) methods.push('email');
          if (formData.invitation_methods.sms) methods.push('SMS');
          
          toast.success(`Invitations sent via ${methods.join(' and ')}`, {
            id: inviteToast,
          });
        } catch (error) {
          console.error('Error sending invitations:', error);
          toast.error('Failed to send invitations', {
            id: inviteToast,
          });
        }
      }

    onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        personType === 'team'
          ? 'Failed to add team member'
          : `Failed to add ${personType}`,
        {
          id: loadingToastId,
        }
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && personType === 'tenant') {
      setFormData(prev => ({
        ...(prev as TenantFormData),
        documents: Array.from(e.target.files || []),
      }) as TenantFormData);
    }
  };

  const getDialogTitle = () => {
    switch (personType) {
      case 'team':
        return 'Add Team Member';
      case 'tenant':
        return 'Add Tenant';
      case 'vendor':
        return 'Add Vendor';
      case 'owner':
        return 'Add Owner';
      default:
        return 'Add Person';
    }
  };

  const getDialogIcon = () => {
    switch (personType) {
      case 'team':
        return User;
      case 'tenant':
        return Building2;
      case 'vendor':
        return Briefcase;
      case 'owner':
        return Home;
      default:
        return User;
    }
  };

  const DialogIcon = getDialogIcon();

  const renderInvitationSection = () => (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      <label className="block text-sm font-medium text-[#6B7280]">
        Send Invitation Via
      </label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="email-invite" className="flex flex-col">
            <span className="text-sm text-gray-700">Email Invitation</span>
            <span className="text-xs text-gray-500">Send invitation link to their email address</span>
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={formData.invitation_methods.email}
            onClick={() => setFormData(prev => ({
              ...prev,
              invitation_methods: {
                ...prev.invitation_methods,
                email: !prev.invitation_methods.email
              }
            }))}
            className={`${
              formData.invitation_methods.email ? 'bg-[#2C3539]' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:ring-offset-2`}
          >
            <span
              aria-hidden="true"
              className={`${
                formData.invitation_methods.email ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="sms-invite" className="flex flex-col">
            <span className="text-sm text-gray-700">SMS Invitation</span>
            <span className="text-xs text-gray-500">Send invitation link to their phone number</span>
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={formData.invitation_methods.sms}
            onClick={() => setFormData(prev => ({
              ...prev,
              invitation_methods: {
                ...prev.invitation_methods,
                sms: !prev.invitation_methods.sms
              }
            }))}
            className={`${
              formData.invitation_methods.sms ? 'bg-[#2C3539]' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:ring-offset-2`}
          >
            <span
              aria-hidden="true"
              className={`${
                formData.invitation_methods.sms ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  if (!personType || !isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[9999]" 
        onClick={onClose}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-white rounded-xl shadow-lg max-h-[90vh] flex flex-col z-[10000]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center mr-3">
                <DialogIcon className="w-5 h-5 text-[#2C3539]" />
              </div>
            <h2 className="text-xl font-semibold text-[#2C3539]">
                {getDialogTitle()}
            </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="personForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
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
                required
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter last name"
              />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter phone number"
              />
            </div>

            {personType === 'team' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={(formData as TeamMemberFormData).department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Role
                  </label>
                  <select
                    required
                    value={(formData as TeamMemberFormData).role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="">Select role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Property Manager</option>
                <option value="maintenance">Maintenance Staff</option>
                <option value="leasing">Leasing Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Job Title
              </label>
              <input
                type="text"
                required
                    value={(formData as TeamMemberFormData).job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter job title"
                  />
                </div>
              </>
            )}

            {personType === 'tenant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Contact Preferences
                  </label>
                  <select
                    required
                    value={(formData as TenantFormData).contact_preferences}
                    onChange={(e) => setFormData(prev => ({
                      ...(prev as TenantFormData),
                      contact_preferences: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  >
                    <option value="">Select contact preference</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-[#6B7280]">Emergency Contact</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={(formData as TenantFormData).emergency_contact_name}
                      onChange={(e) => setFormData(prev => ({
                        ...(prev as TenantFormData),
                        emergency_contact_name: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={(formData as TenantFormData).emergency_contact_phone}
                      onChange={(e) => setFormData(prev => ({
                        ...(prev as TenantFormData),
                        emergency_contact_phone: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Emergency contact phone"
              />
            </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={(formData as TenantFormData).emergency_contact_relationship}
                      onChange={(e) => setFormData(prev => ({
                        ...(prev as TenantFormData),
                        emergency_contact_relationship: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Relationship to tenant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Upload Documents
                  </label>
                  <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#2C3539] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-[#2C3539] hover:text-[#3d474c] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2C3539]">
                          <span>Upload files</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, or images up to 10MB
                      </p>
                    </div>
                  </div>
                  {personType === 'tenant' && (formData as TenantFormData).documents && (formData as TenantFormData).documents.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-[#6B7280]">
                        {(formData as TenantFormData).documents.length} file(s) selected
                      </p>
                    </div>
                  )}
                </div>
                {renderInvitationSection()}
              </>
            )}

            {personType === 'vendor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Service Type
                  </label>
                  <input
                    type="text"
                    required
                    value={(formData as VendorFormData).service_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter service type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    required
                    value={(formData as VendorFormData).business_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter business type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    value={(formData as VendorFormData).hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter hourly rate (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Notes
                  </label>
                  <textarea
                    value={(formData as VendorFormData).notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter additional notes"
                    rows={4}
                  />
                </div>
              </>
            )}

            {personType === 'owner' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={(formData as OwnerFormData).company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter company name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">
                    Notes
                  </label>
                  <textarea
                    value={(formData as OwnerFormData).notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Enter additional notes"
                    rows={4}
                  />
                </div>
                {renderInvitationSection()}
              </>
            )}
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
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm font-medium"
              >
                {personType === 'team' ? 'Send Invitation' : 'Add Person'}
              </button>
            </div>
        </div>
      </div>
    </>
  );
}