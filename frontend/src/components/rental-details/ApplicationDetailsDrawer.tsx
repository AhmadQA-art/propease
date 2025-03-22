import React, { useState, useEffect } from 'react';
import { X, User, Calendar, DollarSign, FileText, Phone, Mail, CreditCard, Check, X as XIcon, Home, Briefcase, Car, Cat, ChevronDown, NotepadText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { applicationService } from '../../services/application.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

// Helper function to cast Lucide icon components to React elements
const IconWrapper = ({ icon: Icon, size = 20, className = "" }) => {
  return <Icon size={size} className={className} />;
};

// Update the ApplicationViewModel interface to match the schema
interface ApplicationViewModel {
  id: string;
  organization_id: string;
  applicant_id: number;
  property_id: string;
  unit_id: string;
  applicant_name: string;
  application_date: string;
  desired_move_in_date: string;
  status: 'pending' | 'approved' | 'rejected';
  monthly_income?: number;
  lease_term?: number;
  is_employed: boolean;
  credit_check_status?: 'pending' | 'approved' | 'rejected';
  background_check_status?: 'pending' | 'passed' | 'failed';
  has_pets: boolean;
  has_vehicles: boolean;
  emergency_contact?: Record<string, any>;
  notes?: string;
  previous_address?: string;
  vehicle_details?: Record<string, any>;
  pet_details?: Record<string, any>;
  application_fee_paid?: boolean;
  employment_info?: Record<string, any>;
  applicant_email?: string;
  applicant_phone_number?: string;
  preferred_contact_method?: string[];
  rejection_reason?: string;
  id_type?: 'passport' | 'qid' | 'driving_license';
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  unit?: {
    id: string;
    unit_number: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  documents: {
    id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    uploaded_by: string;
    uploaded_at: string;
  }[];
}

interface ApplicationDetailsDrawerProps {
  application: ApplicationViewModel | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (applicationId: string, newStatus: 'approved' | 'rejected') => void;
}

/**
 * Helper function to get a viewable URL for documents
 */
const getViewableUrl = async (filePath?: string): Promise<string> => {
  if (!filePath) return '';

  try {
    const bucketName = 'rental-application-docs';
    let relativePath = filePath;

    // Check if filePath is a full URL
    if (filePath.startsWith('https://')) {
      const url = new URL(filePath);
      const pathParts = url.pathname.split('/').filter(Boolean);

      // Find the index of 'object' in the URL structure
      const objectIndex = pathParts.indexOf('object');
      if (objectIndex !== -1 && objectIndex + 2 < pathParts.length) {
        // Extract everything after '/object/public/' or '/object/sign/'
        relativePath = pathParts.slice(objectIndex + 3).join('/');
      } else {
        throw new Error('Invalid file path format');
      }
    }

    console.log('Relative path used for signed URL:', relativePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(relativePath, 3600); // 3600 seconds = 1 hour expiration

    if (error) {
      console.error('Error creating signed URL:', error.message);
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getViewableUrl:', error);
    return '';
  }
};

const DocumentItem = ({ doc }: { doc: { id: string; file_name: string; file_path: string; file_type: string; uploaded_by: string; uploaded_at: string } }) => {
  const [viewUrl, setViewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const signedUrl = await getViewableUrl(doc.file_path);
        setViewUrl(signedUrl);
      } catch (err) {
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadUrl();
  }, [doc.file_path]);

  const docName = doc.file_name || 'Unnamed Document';

  return (
    <div key={doc.id} className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="ml-2">{docName}</span>
        {isLoading && <span className="ml-2 text-gray-500">Loading...</span>}
        {error && <span className="ml-2 text-red-500">{error}</span>}
      </div>
      {viewUrl && !isLoading && !error && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          View
        </a>
      )}
    </div>
  );
};

export default function ApplicationDetailsDrawer({ application, isOpen, onClose, onStatusUpdate }: ApplicationDetailsDrawerProps) {
  const { userProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState({
    background: false,
    credit: false
  });

  if (!isOpen || !application) return null;

  const isPending = application.status === 'pending';

  const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
    onStatusUpdate?.(application.id, newStatus);
    onClose();
  };
  
  const formatIdType = (idType: string) => {
    switch (idType) {
      case 'passport': return 'Passport';
      case 'qid': return 'QID';
      case 'driving_license': return 'Driving License';
      default: return idType;
    }
  };

  const handleCheckStatusUpdate = async (checkType: 'background_check_status' | 'credit_check_status', value: string) => {
    if (!application || !userProfile?.organization_id) return;
    
    setIsUpdating(true);
    try {
      // Create an update object with just the field we want to update
      const updateData = {
        [checkType]: value
      };
      
      await applicationService.updateApplicationStatus(
        application.id, 
        application.status as 'pending' | 'approved' | 'rejected', 
        userProfile.organization_id,
        updateData
      );
      
      // Update local state with the new value
      if (checkType === 'background_check_status') {
        application.background_check_status = value as 'pending' | 'passed' | 'failed';
      } else if (checkType === 'credit_check_status') {
        application.credit_check_status = value as 'pending' | 'approved' | 'rejected';
      }
      
      // Close the dropdown
      setStatusDropdownOpen({
        ...statusDropdownOpen,
        [checkType === 'background_check_status' ? 'background' : 'credit']: false
      });
      
      toast.success(`${checkType === 'background_check_status' ? 'Background check' : 'Credit check'} status updated`);
    } catch (error) {
      console.error('Error updating check status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Application Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IconWrapper icon={X} size={20} className="text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-[88px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Application Status - Highlighted at top */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#2C3539]">Application Status</span>
              <span className={`inline-block px-3 py-1 text-sm rounded-full capitalize
                ${application.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : application.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'}`}
              >
                {application.status}
              </span>
            </div>

            {/* Status change buttons for pending applications */}
            {isPending && onStatusUpdate && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="flex-1 flex items-center justify-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <IconWrapper icon={Check} size={14} className="mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="flex-1 flex items-center justify-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  <IconWrapper icon={XIcon} size={14} className="mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
          
          {/* Applicant Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Applicant Information</h3>
            <div className="flex items-center">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <IconWrapper icon={NotepadText} size={32} className="text-gray-500" />
                </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-[#2C3539]">{application.applicant.name}</h4>
                <div className="mt-1">
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <IconWrapper icon={CreditCard} size={16} className="mr-2" />
                    ID: {application.applicant.id} ({formatIdType(application.id_type || 'unknown')})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Contact Information</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {application.applicant_email && (
                <div className="flex items-center mb-2">
                  <IconWrapper icon={Mail} size={16} className="text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">{application.applicant_email}</span>
                </div>
              )}
              
              {application.applicant_phone_number && (
                <div className="flex items-center mb-2">
                  <IconWrapper icon={Phone} size={16} className="text-[#6B7280] mr-2" />
                  <span className="text-sm text-[#2C3539]">{application.applicant_phone_number}</span>
                </div>
              )}
              
              {application.preferred_contact_method && application.preferred_contact_method.length > 0 && (
                <div className="flex items-center">
                  <IconWrapper icon={MessageSquare} size={16} className="text-[#6B7280] mr-2" />
                  <div className="flex flex-wrap gap-2">
                    {application.preferred_contact_method.map((method, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property & Unit Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Property Information</h3>
            
            {application.property && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center mb-2">
                  <IconWrapper icon={Home} size={16} className="text-[#6B7280] mr-2" />
                  <span className="text-sm font-medium text-[#2C3539]">{application.property.name}</span>
                </div>
                <p className="text-sm text-[#6B7280] pl-6">{application.property.address}</p>
                <p className="text-sm text-[#6B7280] pl-6">{application.property.city}, {application.property.state}</p>
              </div>
            )}
            
            {application.unit && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <IconWrapper icon={Home} size={16} className="text-[#6B7280] mr-2" />
                  <span className="text-sm font-medium text-[#2C3539]">Unit {application.unit.unit_number}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {application.unit.rent_amount && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Rent</span>
                      <p className="text-sm text-[#2C3539]">${application.unit.rent_amount.toLocaleString()}</p>
                    </div>
                  )}
                  {application.unit.bedrooms && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Bedrooms</span>
                      <p className="text-sm text-[#2C3539]">{application.unit.bedrooms}</p>
                    </div>
                  )}
                  {application.unit.bathrooms && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Bathrooms</span>
                      <p className="text-sm text-[#2C3539]">{application.unit.bathrooms}</p>
                    </div>
                  )}
                  {application.unit.area && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Area</span>
                      <p className="text-sm text-[#2C3539]">{application.unit.area} sq ft</p>
                    </div>
                  )}
                  {application.unit.floor_plan && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Floor Plan</span>
                      <p className="text-sm text-[#2C3539]">{application.unit.floor_plan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lease Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Lease Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={Calendar} size={16} className="mr-2" />
                  Submit Date
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.submitDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={Calendar} size={16} className="mr-2" />
                  Desired Move-in
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.desiredMoveIn), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={Calendar} size={16} className="mr-2" />
                  Lease Term
                </div>
                <p className="text-[#2C3539] font-medium">
                  {application.lease_term} months
                </p>
              </div>
              {application.expiry_date && (
                <div>
                  <div className="flex items-center text-sm text-[#6B7280] mb-1">
                    <IconWrapper icon={Calendar} size={16} className="mr-2" />
                    Expiry Date
                  </div>
                  <p className="text-[#2C3539] font-medium">
                    {format(new Date(application.expiry_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Financial Information</h3>
            <div>
              <div className="flex items-center text-sm text-[#6B7280] mb-1">
                <IconWrapper icon={DollarSign} size={16} className="mr-2" />
                Monthly Income
              </div>
              <p className="text-[#2C3539] font-medium">
                {application.monthly_income 
                  ? `$${application.monthly_income.toLocaleString()}` 
                  : 'Not specified'}
              </p>
            </div>
          </div>
          
          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Employment Information</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <IconWrapper icon={Briefcase} size={16} className="text-[#6B7280] mr-2" />
                <span className={`text-sm font-medium ${application.is_employed ? 'text-green-600' : 'text-red-600'}`}>
                  {application.is_employed ? 'Currently Employed' : 'Not Currently Employed'}
                </span>
              </div>
              
              {application.employment_info && Object.keys(application.employment_info).length > 0 && (
                <div className="mt-2 pl-6">
                  {application.employment_info.employer && (
                    <div className="mb-1">
                      <span className="text-xs text-[#6B7280]">Employer</span>
                      <p className="text-sm text-[#2C3539]">{application.employment_info.employer}</p>
                    </div>
                  )}
                  {application.employment_info.position && (
                    <div className="mb-1">
                      <span className="text-xs text-[#6B7280]">Position</span>
                      <p className="text-sm text-[#2C3539]">{application.employment_info.position}</p>
                    </div>
                  )}
                  {application.employment_info.duration && (
                    <div className="mb-1">
                      <span className="text-xs text-[#6B7280]">Duration</span>
                      <p className="text-sm text-[#2C3539]">{application.employment_info.duration}</p>
                    </div>
                  )}
                  {application.employment_info.supervisor && (
                    <div className="mb-1">
                      <span className="text-xs text-[#6B7280]">Supervisor</span>
                      <p className="text-sm text-[#2C3539]">{application.employment_info.supervisor}</p>
                    </div>
                  )}
                  {application.employment_info.contact && (
                    <div>
                      <span className="text-xs text-[#6B7280]">Contact</span>
                      <p className="text-sm text-[#2C3539]">{application.employment_info.contact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Previous Address */}
          {application.previous_address && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#6B7280]">Previous Address</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-[#2C3539]">{application.previous_address}</p>
              </div>
            </div>
          )}
          
          {/* Pets & Vehicles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <IconWrapper icon={Cat} size={20} className="text-[#6B7280] mb-1" />
                  <span className="text-xs text-[#6B7280] mt-1">Pets</span>
                  <span className={`text-sm font-medium ${application.has_pets ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {application.has_pets ? 'Has Pets' : 'No Pets'}
                  </span>
                  
                  {application.has_pets && application.pet_details && Object.keys(application.pet_details).length > 0 && (
                    <div className="mt-2 w-full text-left">
                      <span className="text-xs text-[#6B7280]">Pet Details</span>
                      <p className="text-xs text-[#2C3539] mt-1">
                        {Object.entries(application.pet_details).map(([key, value]) => (
                          <span key={key} className="block">{key}: {value}</span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <IconWrapper icon={Car} size={20} className="text-[#6B7280] mb-1" />
                  <span className="text-xs text-[#6B7280] mt-1">Vehicles</span>
                  <span className={`text-sm font-medium ${application.has_vehicles ? 'text-blue-600' : 'text-gray-600'}`}>
                    {application.has_vehicles ? 'Has Vehicles' : 'No Vehicles'}
                  </span>
                  
                  {application.has_vehicles && application.vehicle_details && Object.keys(application.vehicle_details).length > 0 && (
                    <div className="mt-2 w-full text-left">
                      <span className="text-xs text-[#6B7280]">Vehicle Details</span>
                      <p className="text-xs text-[#2C3539] mt-1">
                        {Object.entries(application.vehicle_details).map(([key, value]) => (
                          <span key={key} className="block">{key}: {value}</span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {application.emergency_contact && (
          <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#6B7280]">Emergency Contact</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {application.emergency_contact.name && (
                  <div className="flex items-center mb-2">
                    <IconWrapper icon={User} size={16} className="text-[#6B7280] mr-2" />
                    <span className="text-sm text-[#2C3539]">{application.emergency_contact.name}</span>
                  </div>
                )}
                
                {application.emergency_contact.phone && (
                  <div className="flex items-center mb-2">
                    <IconWrapper icon={Phone} size={16} className="text-[#6B7280] mr-2" />
                    <span className="text-sm text-[#2C3539]">{application.emergency_contact.phone}</span>
                  </div>
                )}
                
                {application.emergency_contact.relationship && (
                  <div className="flex items-center">
                    <span className="text-sm text-[#6B7280] mr-2">Relationship:</span>
                    <span className="text-sm text-[#2C3539]">{application.emergency_contact.relationship}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {application.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#6B7280]">Notes</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-[#2C3539] whitespace-pre-wrap">{application.notes}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <div className="border rounded-md p-4">
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">
                    Total documents: {application.documents.length}
                  </p>
                  {application.documents.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              )}
            </div>
          </div>
          
          {/* Review Information */}
          {(application.reviewed_by || application.review_date) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#6B7280]">Review Information</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                {application.reviewed_by && (
                  <div className="mb-2">
                    <span className="text-xs text-[#6B7280]">Reviewed By</span>
                    <p className="text-sm text-[#2C3539]">{application.reviewed_by}</p>
                  </div>
                )}
                {application.review_date && (
                  <div>
                    <span className="text-xs text-[#6B7280]">Review Date</span>
                    <p className="text-sm text-[#2C3539]">{format(new Date(application.review_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
