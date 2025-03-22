import React, { useState, useEffect } from 'react';
import { User, Calendar, DollarSign, FileText, Filter, Search, NotepadText } from 'lucide-react';
import { format } from 'date-fns';
import ApplicationDetailsDrawer from './ApplicationDetailsDrawer';
import AddApplicationDrawer from './AddApplicationDrawer';
import { useAuth } from '../../contexts/AuthContext';
import { rentalService } from '../../services/rental.service';
import { applicationService, RentalApplication } from '../../services/application.service';
import toast from 'react-hot-toast';

// Define a frontend application model that combines DB data with UI needs
interface ApplicationViewModel {
  id: string;
  applicant: {
    name: string;
    id: number;
    imageUrl?: string;
  };
  submitDate: string;
  desiredMoveIn: string;
  status: 'pending' | 'approved' | 'rejected';
  monthly_income?: number;
  documents: { 
    id: string; 
    file_name?: string;
    file_path?: string;
    file_type?: string;
    uploaded_at?: string;
    document_name?: string; 
    document_url?: string;
    document_type?: string;
  }[];
  unit?: {
    id: string;
    unit_number: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    floor_plan?: string;
  };
  // Include all other application fields
  has_pets: boolean;
  has_vehicles: boolean; 
  is_employed: boolean;
  emergency_contact?: {
    name?: string;
    phone?: string; 
    relationship?: string;
  };
  notes?: string;
  id_type: 'passport' | 'qid' | 'driving_license';
  lease_term: number;
  organization_id: string;
  // Add fields from schema
  application_date: string;
  desired_move_in_date: string;
  applicant_id: number;
  applicant_name: string;
  applicant_email?: string;
  applicant_phone_number?: string;
  preferred_contact_method?: string[];
  property_id: string;
  unit_id: string;
  background_check_status?: 'pending' | 'passed' | 'failed';
  credit_check_status?: 'pending' | 'approved' | 'rejected';
  previous_address?: string;
  vehicle_details?: Record<string, any>;
  pet_details?: Record<string, any>;
  application_fee_paid?: boolean;
  employment_info?: Record<string, any>;
  rejection_reason?: string;
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

// Helper function to convert API data to view model
const mapToViewModel = (application: RentalApplication, documents: any[] = []): ApplicationViewModel => {
  // Make sure we have a documents array from either the documents parameter or the application
  const applicationDocuments = application.documents || documents || [];
  
  // Transform document properties if needed
  const transformedDocuments = applicationDocuments.map(doc => ({
    id: doc.id,
    file_name: doc.file_name,
    file_path: doc.file_path,
    file_type: doc.file_type,
    uploaded_at: doc.uploaded_at,
    // Keep these for backward compatibility
    document_name: doc.document_name || doc.file_name,
    document_url: doc.document_url || doc.file_path,
    document_type: doc.document_type || doc.file_type
  }));
  
  return {
    id: application.id || '',
    applicant: {
      name: application.applicant_name,
      id: application.applicant_id,
    },
    submitDate: application.application_date || new Date().toISOString(),
    desiredMoveIn: application.desired_move_in_date,
    status: (application.status as 'pending' | 'approved' | 'rejected') || 'pending',
    monthly_income: application.monthly_income,
    documents: transformedDocuments,
    unit: application.unit,
    has_pets: application.has_pets,
    has_vehicles: application.has_vehicles,
    is_employed: application.is_employed,
    emergency_contact: application.emergency_contact,
    notes: application.notes,
    id_type: application.id_type,
    lease_term: application.lease_term,
    organization_id: application.organization_id,
    application_date: application.application_date || new Date().toISOString(),
    desired_move_in_date: application.desired_move_in_date,
    applicant_id: application.applicant_id,
    applicant_name: application.applicant_name,
    applicant_email: application.applicant_email,
    applicant_phone_number: application.applicant_phone_number,
    preferred_contact_method: application.preferred_contact_method,
    property_id: application.property_id,
    unit_id: application.unit_id,
    background_check_status: application.background_check_status,
    credit_check_status: application.credit_check_status,
    previous_address: application.previous_address,
    vehicle_details: application.vehicle_details,
    pet_details: application.pet_details,
    application_fee_paid: application.application_fee_paid,
    employment_info: application.employment_info,
    rejection_reason: application.rejection_reason,
    reviewed_by: application.reviewed_by,
    review_date: application.review_date ? application.review_date.toString() : undefined,
    expiry_date: application.expiry_date ? application.expiry_date.toString() : undefined,
    property: application.property
  };
};

const getStatusColor = (status: ApplicationViewModel['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface RentalApplicationsProps {
  rentalId: string;
}

// Helper function to cast Lucide icon components to React elements
const IconWrapper = ({ icon: Icon, size = 20, className = "" }) => {
  return <Icon size={size} className={className} />;
};

export default function RentalApplications({ rentalId }: RentalApplicationsProps) {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationViewModel | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationViewModel[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Array<{ id: string; unit_number: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available units for the rental property
  useEffect(() => {
    const fetchAvailableUnits = async () => {
      if (!rentalId || !userProfile?.organization_id) return;
      
      try {
        setLoading(true);
        const propertyData = await rentalService.getRentalById(rentalId, userProfile.organization_id);
        if (propertyData && propertyData.units) {
          // Get all units for the property
          const allUnits = propertyData.units.map(unit => ({
            id: unit.id,
            unit_number: unit.unit_number || unit.number || `${unit.name || 'Unit'}`
          }));
          setAvailableUnits(allUnits);
        }
      } catch (error) {
        console.error('Error fetching property units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableUnits();
  }, [rentalId, userProfile?.organization_id]);
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!rentalId || !userProfile?.organization_id) return;
      
      try {
        setLoading(true);
        const applications = await applicationService.getPropertyApplications(rentalId, userProfile.organization_id);
        
        if (applications && applications.length > 0) {
          // First get basic list
          const basicList = applications.map(app => mapToViewModel(app));
          setApplications(basicList);
          
          // Then fetch detailed data for each application including documents
          const detailedApplications = await Promise.all(
            applications.map(async (app) => {
              try {
                const detailedApp = await applicationService.getApplicationById(
                  app.id || '',
                  userProfile.organization_id
                );
                return mapToViewModel(detailedApp);
              } catch (error) {
                console.error(`Error fetching details for application ${app.id}:`, error);
                return mapToViewModel(app); // Return basic data if detailed fetch fails
              }
            })
          );
          
          setApplications(detailedApplications);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [rentalId, userProfile?.organization_id]);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || application.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleAddApplication = () => {
    // Refresh applications after adding a new one
    if (rentalId && userProfile?.organization_id) {
      setLoading(true);
      applicationService.getPropertyApplications(rentalId, userProfile.organization_id)
        .then(async applications => {
          // First get basic list
          const basicList = applications.map(app => mapToViewModel(app));
          setApplications(basicList);
          
          // Then fetch detailed data for each application including documents
          const detailedApplications = await Promise.all(
            applications.map(async (app) => {
              try {
                const detailedApp = await applicationService.getApplicationById(
                  app.id || '',
                  userProfile.organization_id || ''
                );
                return mapToViewModel(detailedApp);
              } catch (error) {
                console.error(`Error fetching details for application ${app.id}:`, error);
                return mapToViewModel(app);
              }
            })
          );
          
          setApplications(detailedApplications);
          toast.success('Application added successfully');
        })
        .catch(error => {
          console.error('Error refreshing applications:', error);
          toast.error('Failed to refresh applications');
        })
        .finally(() => {
          setLoading(false);
        });
    }
    setIsAddDrawerOpen(false);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    if (!userProfile?.organization_id) return;
    
    try {
      setLoading(true);
      // First update the status
      const updatedApp = await applicationService.updateApplicationStatus(
        applicationId, 
        newStatus, 
        userProfile.organization_id
      );
      
      console.log("Status update successful:", updatedApp);
      
      try {
        // Try to fetch the full updated application with documents
        const fullUpdatedApplication = await applicationService.getApplicationById(
          applicationId,
          userProfile.organization_id
        );
        
        // Update with the full data if fetch succeeded
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === applicationId
              ? mapToViewModel(fullUpdatedApplication)
              : app
          )
        );
      } catch (fetchError) {
        // If fetching the updated application fails, still update the status in the UI
        console.warn("Error fetching updated application:", fetchError);
        
        // Update just the status in the UI
    setApplications(prevApplications =>
      prevApplications.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus }
          : app
      )
    );
      }
      
      toast.success(`Application ${newStatus}`);
    } catch (error) {
      console.error(`Error updating application status:`, error);
      toast.error(`Failed to ${newStatus} application`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3539]">Applications</h2>
          <p className="text-sm text-[#6B7280]">Manage rental applications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-[#2C3539]" />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                <h3 className="font-medium text-[#2C3539] mb-2">Filter Applications</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setIsFilterDropdownOpen(false)}
                      className="px-4 py-2 bg-[#2C3539] text-white rounded-lg text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsAddDrawerOpen(true)}
            className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm"
          >
            Add Application
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-4 space-y-4">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3539]"></div>
          </div>
        )}
        
        {!loading && filteredApplications.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-[#6B7280]">No applications found for this property.</p>
          </div>
        )}
        
        {!loading && filteredApplications.map((application) => (
          <div
            key={application.id}
            onClick={() => {
              setSelectedApplication(application);
              setIsDetailsDrawerOpen(true);
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <IconWrapper icon={NotepadText} className="w-6 h-6 text-gray-500" />
                  </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#2C3539]">{application.applicant.name}</h3>
                  <p className="text-sm text-[#6B7280]">ID: {application.applicant.id}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={Calendar} className="w-4 h-4 mr-2" />
                  Submit Date
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.submitDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={Calendar} className="w-4 h-4 mr-2" />
                  Desired Move-in
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.desiredMoveIn), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={DollarSign} className="w-4 h-4 mr-2" />
                  Monthly Income
                </div>
                <p className="text-[#2C3539] font-medium">
                  ${application.monthly_income?.toLocaleString() || 'Not specified'}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <IconWrapper icon={FileText} className="w-4 h-4 mr-2" />
                  Documents
                </div>
                <p className="text-[#2C3539] font-medium">
                  {application.documents?.length || 0} files
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Details Drawer */}
      <ApplicationDetailsDrawer
        application={selectedApplication}
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedApplication(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Add Application Drawer */}
      <AddApplicationDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        propertyId={rentalId}
        organizationId={userProfile?.organization_id || ''}
        onSuccess={handleAddApplication}
        availableUnits={availableUnits}
      />

      {/* Backdrop */}
      {(isDetailsDrawerOpen || isAddDrawerOpen) && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => {
            setIsDetailsDrawerOpen(false);
            setIsAddDrawerOpen(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}
