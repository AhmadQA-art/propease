import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { applicationService } from '../../services/application.service';
import { rentalService } from '../../services/rental.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import PhoneInput from 'react-phone-number-input';
import type { Props as PhoneInputProps } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Helper function to cast Lucide icon components to React elements
const IconWrapper = ({ icon: Icon, size = 20, className = "" }) => {
  return <Icon size={size} className={className} />;
};

// Custom PhoneInput wrapper to handle TypeScript issues
// @ts-ignore
const CustomPhoneInput = (props) => <PhoneInput {...props} />;

// Define the form schema
const applicationSchema = z.object({
  id_type: z.enum(['passport', 'qid', 'driving_license']),
  applicant_id: z.string().min(1, 'Applicant ID is required'),
  applicant_name: z.string().min(1, 'Applicant name is required'),
  applicant_email: z.string().email('Invalid email address').optional(),
  applicant_phone_number: z.string().min(1, 'Phone number is required'),
  preferred_contact_method: z.array(z.enum(['email', 'phone', 'sms', 'whatsapp'])).optional(),
  unit_id: z.string().min(1, 'Unit is required'),
  desired_move_in_date: z.string().min(1, 'Move-in date is required'),
  lease_term: z.number().min(1, 'Lease term is required'),
  monthly_income: z.number().optional(),
  has_pets: z.boolean(),
  has_vehicles: z.boolean(),
  is_employed: z.boolean(),
  emergency_contact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  notes: z.string().optional(),
  documents: z.array(z.instanceof(File)).optional()
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AddApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  organizationId: string;
  onSuccess: () => void;
  availableUnits?: Array<{ id: string; unit_number: string }>;
}

// Add validation function
const validateApplicantId = (id: string, idType: string): string | null => {
  if (idType === 'qid') {
    // QID: exactly 11 digits
    if (!/^\d{11}$/.test(id)) {
      return 'QID must be exactly 11 digits';
    }
  } else if (idType === 'driving_license') {
    // Driver's License: alphanumeric, 6-15 characters
    if (!/^[A-Za-z0-9]{6,15}$/.test(id)) {
      return 'Driver\'s License must be alphanumeric and 6-15 characters';
    }
  } else if (idType === 'passport') {
    // Passport Number: alphanumeric, 6-10 characters
    if (!/^[A-Za-z0-9]{6,10}$/.test(id)) {
      return 'Passport Number must be alphanumeric and 6-10 characters';
    }
  }
  return null;
};

export default function AddApplicationDrawer({ 
  isOpen, 
  onClose, 
  propertyId,
  organizationId,
  onSuccess,
  availableUnits = [] // Default to empty array to avoid undefined errors
}: AddApplicationDrawerProps) {
  const [propertyName, setPropertyName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    uploaded: number;
    status: 'idle' | 'uploading' | 'complete' | 'error';
    message?: string;
  }>({ total: 0, uploaded: 0, status: 'idle' });
  const { userProfile } = useAuth();
  
  // Log the current user ID for debugging - only in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && userProfile) {
      console.log('Current user ID:', userProfile.id);
      console.log('Developer button visible:', userProfile.id === '331721e9-e742-4e26-ac0b-0b7d323702e7');
    }
  }, [userProfile]);

  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId || !organizationId) return;
      
      try {
        const propertyData = await rentalService.getRentalById(propertyId, organizationId);
        if (propertyData) {
          setPropertyName(propertyData.name);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      }
    };

    if (isOpen) {
      fetchPropertyDetails();
    }
  }, [propertyId, organizationId, isOpen]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      id_type: 'qid',
      applicant_id: '',
      applicant_name: '',
      applicant_email: '',
      applicant_phone_number: '',
      preferred_contact_method: [],
      has_pets: false,
      has_vehicles: false,
      is_employed: true,
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
    }
  });

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setSelectedDocuments([]);
      setUploadProgress({ total: 0, uploaded: 0, status: 'idle' });
    }
  }, [isOpen, form.reset]);

  const onSubmit = async (data: ApplicationFormData) => {
    const idValidationError = validateApplicantId(data.applicant_id, data.id_type);
    if (idValidationError) {
      form.setError('applicant_id', {
        type: 'manual',
        message: idValidationError
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Document uploads are optional now
      
      // Create the application
      const applicationData = {
        property_id: propertyId,
        unit_id: data.unit_id,
        desired_move_in_date: data.desired_move_in_date,
        lease_term: data.lease_term,
        monthly_income: data.monthly_income ?? null,
        has_pets: data.has_pets,
        has_vehicles: data.has_vehicles,
        is_employed: data.is_employed,
        emergency_contact: data.emergency_contact ? {
          name: data.emergency_contact.name,
          phone: data.emergency_contact.phone,
          relationship: data.emergency_contact.relationship
        } : null,
        notes: data.notes || '',
        id_type: data.id_type,
        applicant_id: parseInt(data.applicant_id, 10) || 0, // Convert string to number
        applicant_name: data.applicant_name,
        applicant_email: data.applicant_email || null,
        applicant_phone_number: data.applicant_phone_number || null,
        preferred_contact_method: data.preferred_contact_method || null,
        organization_id: organizationId
      };
      
      console.log('Submitting application:', applicationData);
      
      const application = await applicationService.createApplication(applicationData);
      
      console.log('Application created:', application);
      
      // Upload documents if any are selected
      if (selectedDocuments.length > 0) {
        setUploadProgress({
          total: selectedDocuments.length,
          uploaded: 0,
          status: 'uploading',
          message: `Uploading documents (0/${selectedDocuments.length})...`
        });
        
        // Upload all selected documents
        const uploadResult = await applicationService.uploadMultipleDocuments(
          application.id,
          selectedDocuments,
          'Supporting Document',
          organizationId
        );
        
        console.log('Upload result:', uploadResult);
        
        if (uploadResult.errors.length > 0) {
          // If all uploads failed, show error but still allow submission
          if (uploadResult.totalUploaded === 0) {
            setUploadProgress({
              total: selectedDocuments.length,
              uploaded: 0,
              status: 'error',
              message: `Document uploads failed. The application was still submitted.`
            });
            
            // Find a more specific error message if possible
            const errorDetails = uploadResult.errors.map(err => err.error).join('; ');
            toast.error(`Failed to upload documents: ${errorDetails}`);
            
            // Still continue with submission, but show warning
            toast.success('Application submitted without documents');
          } else {
            // If some uploads succeeded but others failed, show partial success
            setUploadProgress({
              total: selectedDocuments.length,
              uploaded: uploadResult.totalUploaded,
              status: 'error',
              message: `${uploadResult.totalUploaded} of ${selectedDocuments.length} documents uploaded. Some uploads failed.`
            });
            
            toast.success(`Application submitted with ${uploadResult.totalUploaded} documents`);
          }
        } else {
          // All uploads succeeded
          setUploadProgress({
            total: selectedDocuments.length,
            uploaded: selectedDocuments.length,
            status: 'complete',
            message: `All ${selectedDocuments.length} documents uploaded successfully!`
          });
          toast.success('Application and documents submitted successfully!');
        }
      } else {
        // No documents to upload
        toast.success('Application submitted successfully without documents');
      }
      
      // Reset isSubmitting state
      setIsSubmitting(false);
      
      // Reset form and close drawer
      form.reset();
      setSelectedDocuments([]);
      setUploadProgress({ total: 0, uploaded: 0, status: 'idle' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Provide a more specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('foreign key') || error.message.includes('Foreign key')) {
          toast.error('Upload failed: Document reference error. Please try again later.');
        } else if (error.message.includes('Permission denied')) {
          toast.error('Upload failed: Permission denied. Please check your access rights.');
        } else if (error.message.includes('Authentication')) {
          toast.error('Authentication error. Please log in again.');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error(`An unexpected error occurred: ${String(error)}`);
      }
      
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to selectedDocuments
      const newFiles = Array.from(e.target.files);
      setSelectedDocuments(prev => [...prev, ...newFiles]);
      
      // Reset the input value so the same file can be selected again if needed
      e.target.value = '';
      
      toast.success(`${newFiles.length} document${newFiles.length > 1 ? 's' : ''} selected`);
    }
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">New Application</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IconWrapper icon={X} size={20} className="text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Applicant Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Applicant Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">ID Type</label>
                <select
                  {...form.register('id_type')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                >
                  <option value="">Select ID type</option>
                  <option value="passport">Passport</option>
                  <option value="qid">QID</option>
                  <option value="driving_license">Driving License</option>
                </select>
                {form.formState.errors.id_type && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.id_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Applicant Name</label>
                <input
                  type="text"
                  {...form.register('applicant_name')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                />
                {form.formState.errors.applicant_name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.applicant_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Applicant ID</label>
                <input
                  type="text"
                  {...form.register('applicant_id')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                />
                {form.formState.errors.applicant_id && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.applicant_id.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {form.watch('id_type') === 'qid' && 'QID must be exactly 11 digits.'}
                  {form.watch('id_type') === 'driving_license' && 'Driver\'s License must be alphanumeric and 6-15 characters.'}
                  {form.watch('id_type') === 'passport' && 'Passport Number must be alphanumeric and 6-10 characters.'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Email Address</label>
                <input
                  type="email"
                  {...form.register('applicant_email')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                />
                {form.formState.errors.applicant_email && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.applicant_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Phone Number</label>
                <div className="relative">
                  <CustomPhoneInput
                    international
                    defaultCountry="QA"
                    value={form.watch('applicant_phone_number')}
                    onChange={(value) => form.setValue('applicant_phone_number', value || '')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    error={!!form.formState.errors.applicant_phone_number}
                  />
                </div>
                {form.formState.errors.applicant_phone_number && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.applicant_phone_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Preferred Contact Method</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('preferred_contact_method')}
                      value="email"
                      onChange={(e) => {
                        const currentValue = form.watch('preferred_contact_method') || [];
                        if (e.target.checked) {
                          form.setValue('preferred_contact_method', [...currentValue, 'email']);
                        } else {
                          form.setValue('preferred_contact_method', currentValue.filter(v => v !== 'email'));
                        }
                      }}
                      className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                    />
                    <label className="text-sm text-[#6B7280]">Email</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('preferred_contact_method')}
                      value="phone"
                      onChange={(e) => {
                        const currentValue = form.watch('preferred_contact_method') || [];
                        if (e.target.checked) {
                          form.setValue('preferred_contact_method', [...currentValue, 'phone']);
                        } else {
                          form.setValue('preferred_contact_method', currentValue.filter(v => v !== 'phone'));
                        }
                      }}
                      className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                    />
                    <label className="text-sm text-[#6B7280]">Phone</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('preferred_contact_method')}
                      value="sms"
                      onChange={(e) => {
                        const currentValue = form.watch('preferred_contact_method') || [];
                        if (e.target.checked) {
                          form.setValue('preferred_contact_method', [...currentValue, 'sms']);
                        } else {
                          form.setValue('preferred_contact_method', currentValue.filter(v => v !== 'sms'));
                        }
                      }}
                      className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                    />
                    <label className="text-sm text-[#6B7280]">SMS</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...form.register('preferred_contact_method')}
                      value="whatsapp"
                      onChange={(e) => {
                        const currentValue = form.watch('preferred_contact_method') || [];
                        if (e.target.checked) {
                          form.setValue('preferred_contact_method', [...currentValue, 'whatsapp']);
                        } else {
                          form.setValue('preferred_contact_method', currentValue.filter(v => v !== 'whatsapp'));
                        }
                      }}
                      className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                    />
                    <label className="text-sm text-[#6B7280]">WhatsApp</label>
                  </div>
                </div>
                {form.formState.errors.preferred_contact_method && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.preferred_contact_method.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property & Unit Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Property & Unit Details</h3>
            <div className="space-y-4">
              {/* Property field (disabled, showing current property) */}
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Property</label>
                <input
                  type="text"
                  value={propertyName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">This application is for the current property</p>
              </div>
              
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Unit</label>
                <select
                  {...form.register('unit_id')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                >
                  <option value="">Select a unit</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_number}
                    </option>
                  ))}
                </select>
                {form.formState.errors.unit_id && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.unit_id.message}</p>
                )}
              </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Desired Move-in Date</label>
              <input
                type="date"
                  {...form.register('desired_move_in_date')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                />
                {form.formState.errors.desired_move_in_date && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.desired_move_in_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Lease Term (months)</label>
                <input
                  type="number"
                  {...form.register('lease_term', { valueAsNumber: true })}
                  min="1"
                  max="24"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
              />
                {form.formState.errors.lease_term && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.lease_term.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lease & Financial Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Financial Details</h3>
            <div className="space-y-4">
            <div>
                <label className="block text-sm text-[#6B7280] mb-1">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
                <input
                  type="number"
                    {...form.register('monthly_income', { valueAsNumber: true })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  />
                </div>
                {form.formState.errors.monthly_income && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.monthly_income.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('has_pets')}
                    className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                  />
                  <label className="text-sm text-[#6B7280]">Has Pets</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('has_vehicles')}
                    className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                  />
                  <label className="text-sm text-[#6B7280]">Has Vehicles</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...form.register('is_employed')}
                    className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                  />
                  <label className="text-sm text-[#6B7280]">Is Employed</label>
                </div>
              </div>
            </div>
          </div>

          {/* Background Checks & Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                {/* <label className="block text-sm text-[#6B7280] mb-1">Emergency Contact</label> */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-1">Name</label>
                    <input
                      type="text"
                      {...form.register('emergency_contact.name')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    />
                    {form.formState.errors.emergency_contact?.name && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.emergency_contact.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B7280] mb-1">Phone</label>
                    <div className="relative">
                      <CustomPhoneInput
                        international
                        defaultCountry="QA"
                        value={form.watch('emergency_contact.phone')}
                        onChange={(value) => form.setValue('emergency_contact.phone', value || '')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                      />
                    </div>
                    {form.formState.errors.emergency_contact?.phone && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.emergency_contact.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B7280] mb-1">Relationship</label>
                    <input
                      type="text"
                      {...form.register('emergency_contact.relationship')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    />
                    {form.formState.errors.emergency_contact?.relationship && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.emergency_contact.relationship.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Additional Details</h3>
            <div className="space-y-4">
              <div>
                {/* <label className="block text-sm text-[#6B7280] mb-1">Notes</label> */}
                <textarea
                  {...form.register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                />
                {form.formState.errors.notes && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.notes.message}</p>
                )}
              </div>

              {/* Upload documents */}
            <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Upload Supporting Documents (Optional)
                </label>
              <input
                type="file"
                  onChange={handleFileChange}
                multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can select multiple documents at once. Recommended documents: ID proof, income verification, references, etc.
                </p>
              </div>
            </div>
          </div>

          {/* Display selected documents */}
          {selectedDocuments.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Selected Documents ({selectedDocuments.length})
                </p>
                {uploadProgress.status === 'uploading' && (
                  <p className="text-xs text-blue-600">
                    Uploading: {uploadProgress.uploaded}/{uploadProgress.total}
                  </p>
                )}
                {uploadProgress.status === 'complete' && (
                  <p className="text-xs text-green-600">
                    Upload complete
                  </p>
                )}
                {uploadProgress.status === 'error' && (
                  <p className="text-xs text-red-600">
                    Upload failed: {uploadProgress.message}
                  </p>
                )}
              </div>
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                {selectedDocuments.map((file, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center truncate">
                      <span className="truncate max-w-[240px] font-medium">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs flex items-center"
                      disabled={isSubmitting}
                    >
                      <IconWrapper icon={X} size={16} />
                      <span className="ml-1">Remove</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error display */}
          {form.formState.errors.documents && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.documents.message}
            </p>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            >
              Cancel
            </button>
            
            {/* Debug Button - Only show for developer account */}
            {process.env.NODE_ENV === 'development' && 
             userProfile?.id === '331721e9-e742-4e26-ac0b-0b7d323702e7' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await applicationService.checkAuth();
                    console.log('Auth check result:', result);
                    
                    // Create a more detailed message
                    const authMessage = `
Auth Status:
- User: ${result.session?.user || 'Not authenticated'}
- Service role: ${result.hasServiceRole ? 'Available ✓' : 'Not available ✗'}
- Database access: ${result.testQuery.success ? 'Working ✓' : 'Failed ✗'}
- Storage access: ${result.storageCheck.success ? 'Working ✓' : 'Failed ✗'}
                    `;
                    
                    // Calculate overall status
                    const isFullyFunctional = result.hasServiceRole && 
                      result.session && 
                      result.testQuery.success;
                    
                    if (isFullyFunctional) {
                      toast.success('Authentication is working correctly');
                    } else {
                      toast.error('Authentication issues detected - see console');
                    }
                    
                    console.log(authMessage);
                    alert(authMessage);
                  } catch (error) {
                    console.error('Error checking auth:', error);
                    toast.error('Failed to check auth configuration');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Dev: Debug Auth
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-[#2C3539] text-white rounded-md text-sm font-medium hover:bg-[#3A464D] focus:outline-none focus:ring-2 focus:ring-[#2C3539] ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
