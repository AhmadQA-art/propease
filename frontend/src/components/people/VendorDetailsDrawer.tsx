import React, { useEffect, useState } from 'react';
import { X, Star, Phone, Mail, Building2, Wrench, User, Edit2, Save, Trash } from 'lucide-react';
import { Vendor } from '../../types/people';
import { peopleApi } from '../../services/api/people';
import { toast } from 'react-hot-toast';
import SearchableDropdown from './SearchableDropdown';
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onUpdate?: () => void;
}

// Service types for the dropdown - matching AddVendorDialog
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

export default function VendorDetailsDrawer({ isOpen, onClose, vendor, onUpdate }: VendorDetailsDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [vendorName, setVendorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Log vendor data
  useEffect(() => {
    if (vendor) {
      console.log('Vendor details:', vendor);
      console.log('Contact person email:', vendor.contact_person_email);
    }
  }, [vendor]);

  // Initialize form data when vendor changes or edit mode is toggled
  useEffect(() => {
    if (vendor) {
      setVendorName(vendor.vendor_name || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setServiceType(vendor.service_type || '');
      setContactPersonName(vendor.contact_person_name || '');
      setContactPersonEmail(vendor.contact_person_email || '');
      setNotes(vendor.notes || '');
    }
  }, [vendor, isEditing]);

  // Reset edit state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);
  
  // Function to get rating stars - moved before the return statement
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form values to current vendor values
    if (vendor) {
      setVendorName(vendor.vendor_name || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setServiceType(vendor.service_type || '');
      setContactPersonName(vendor.contact_person_name || '');
      setContactPersonEmail(vendor.contact_person_email || '');
      setNotes(vendor.notes || '');
    }
  };

  // Validate email function
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Empty is valid (not required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation on form change
  useEffect(() => {
    if (isEditing) {
      // Validate email
      if (email && !validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }

      // Validate contact person email
      if (contactPersonEmail && !validateEmail(contactPersonEmail)) {
        setContactEmailError('Please enter a valid email address');
      } else {
        setContactEmailError('');
      }

      // Validate phone
      if (phone && !isPossiblePhoneNumber(phone)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
    }
  }, [email, contactPersonEmail, phone, isEditing]);

  const handleSave = async () => {
    if (!vendor) return;
    
    // Validate form before saving
    if (emailError || contactEmailError || phoneError) {
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare update data
      const updateData = {
        vendor_name: vendorName,
        email: email,
        phone: phone,
        service_type: serviceType,
        contact_person_name: contactPersonName,
        contact_person_email: contactPersonEmail,
        notes: notes
      };
      
      // Update vendor through the people API
      await peopleApi.updatePerson(vendor.id, 'vendor', updateData);
      
      // Update the vendor object in-place with the new values
      // This ensures the UI updates immediately without needing to close and reopen
      if (vendor) {
        vendor.vendor_name = vendorName;
        vendor.email = email;
        vendor.phone = phone;
        vendor.service_type = serviceType;
        vendor.contact_person_name = contactPersonName;
        vendor.contact_person_email = contactPersonEmail;
        vendor.notes = notes;
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message
      toast.success('Vendor updated successfully');
      
      // Call onUpdate if provided to refresh the parent list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vendor) return;
    
    if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
      setIsDeleting(true);
      
      try {
        await peopleApi.deletePerson(vendor.id, 'vendor');
        toast.success('Vendor deleted successfully');
        onClose(); // Close the drawer
        if (onUpdate) onUpdate(); // Refresh the vendors list
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Instead of early return, use conditional rendering in the return statement
  return (
    <>
      {isOpen && vendor ? (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
          {/* Header - Fixed */}
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2C3539]">
                Vendor Details
              </h2>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-3 py-1.5 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm disabled:opacity-50"
                    >
                      <Save size={16} className="mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-[#6B7280] hover:text-[#2C3539]"
                >
                  <X size={20} />
                </button>
              </div>
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                      placeholder="Vendor Name"
                    />
                  ) : (
                    <h3 className="text-lg font-medium text-[#2C3539]">
                      {vendor.vendor_name || vendor.company_name || vendor.company || 'Unknown Vendor'}
                    </h3>
                  )}
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">Service Type</label>
                {isEditing ? (
                  <SearchableDropdown
                    options={serviceTypes}
                    selectedValues={serviceType ? [serviceType] : []}
                    onChange={(values) => setServiceType(values[0] || '')}
                    placeholder="Select service type"
                    disabled={isSaving}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#2C3539]">{vendor.service_type || vendor.service || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-[#2C3539]">Company Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#6B7280]" />
                    {isEditing ? (
                      <div className="w-full">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full`}
                          placeholder="Email Address"
                        />
                        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                      </div>
                    ) : (
                      <span className="text-[#2C3539]">{vendor.email || 'No email provided'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#6B7280]" />
                    {isEditing ? (
                      <div className="w-full">
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="QA"
                          value={phone}
                          onChange={(value) => setPhone(value || '')}
                          className={`w-full px-3 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                          placeholder="Phone Number"
                        />
                        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                      </div>
                    ) : (
                      <span className="text-[#2C3539]">{vendor.phone || 'No phone provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Person Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-[#2C3539]">Contact Person</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#6B7280]" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={contactPersonName}
                        onChange={(e) => setContactPersonName(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                        placeholder="Contact Person Name"
                      />
                    ) : (
                      <span className="text-[#2C3539]">{vendor.contact_person_name || 'No contact person specified'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#6B7280]" />
                    {isEditing ? (
                      <div className="w-full">
                        <input
                          type="email"
                          value={contactPersonEmail}
                          onChange={(e) => setContactPersonEmail(e.target.value)}
                          className={`px-3 py-2 border ${contactEmailError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full`}
                          placeholder="Contact Person Email"
                        />
                        {contactEmailError && <p className="text-xs text-red-500 mt-1">{contactEmailError}</p>}
                      </div>
                    ) : (
                      (() => {
                        // Use immediately invoked function expression to calculate contactEmail inside JSX
                        const contactEmail = vendor.contact_person_email || (vendor.contact_person_name ? vendor.email : '');
                        return contactEmail ? (
                          <>
                            <span className="text-[#2C3539]">{contactEmail}</span>
                            {!vendor.contact_person_email && vendor.email && (
                              <span className="text-xs text-gray-500 ml-1">(Company email)</span>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">No contact email provided</div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

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
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] block">Notes</label>
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full min-h-[100px]"
                    placeholder="Add notes about this vendor"
                  />
                ) : (
                  vendor.notes ? (
                    <div className="p-3 bg-gray-50 rounded-md text-sm text-[#2C3539]">
                      {vendor.notes}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No notes available</div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
