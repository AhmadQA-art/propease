import React, { useState, useEffect, useRef } from 'react';
import { RentalDetails } from '../../types/rental';
import AddTaskDrawer from './AddTaskDrawer';
import AddApplicationDrawer from './AddApplicationDrawer';
import { getPropertyLocation } from '../../utils/locations';
import { getInitials, getAvatarBgColor } from '../../utils/avatars';
import { propertyImageService, PropertyImage } from '../../services/property-image.service';
import { ClipboardList, FileText, Edit2, UserCog, Users2, DoorOpen, Building2, MapPin, DollarSign, Home, PercentCircle, Plus, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RentalOverviewsProps {
  rental: RentalDetails;
  onEdit: (id: string) => void;
  showAddTask?: boolean;
}

// Extended RentalDetails type to include property manager
interface ExtendedRentalDetails extends RentalDetails {
  property_manager?: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url?: string;
    };
  };
}

// Update user type to include avatar_url
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export default function RentalOverview({ rental, onEdit, showAddTask = false }: RentalOverviewProps) {
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isAddApplicationDrawerOpen, setIsAddApplicationDrawerOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const dataFetchedRef = useRef(false);
  
  // Cast rental to extended type
  const extendedRental = rental as ExtendedRentalDetails;

  // Fetch property images
  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    
    const fetchPropertyImages = async () => {
      if (rental.id) {
        try {
          console.log(`Fetching property images for property ${rental.id}`);
          const images = await propertyImageService.getPropertyImages(rental.id);
          console.log(`Received ${images.length} property images`);
          setPropertyImages(images);
          dataFetchedRef.current = true;
        } catch (error) {
          console.error("Error fetching property images:", error);
        }
      }
    };
    
    fetchPropertyImages();
    
    // Reset the ref when rental ID changes
    return () => {
      if (rental.id) {
        console.log(`Cleaning up for property ${rental.id}`);
      }
      // Only reset if unmounting completely, not on every render
      // dataFetchedRef.current = false;
    };
  }, [rental.id]);

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    dueDate: string;
    assignee: string;
    owner: string;
  }) => {
    // TODO: Implement task creation logic
    console.log('Create new task:', taskData);
    setIsAddTaskDrawerOpen(false);
  };

  const handleAddApplication = () => {
    // The actual submission is handled in the drawer component
    toast.success('Application submitted successfully');
    setIsAddApplicationDrawerOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !rental.id) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const uploadedImage = await propertyImageService.uploadPropertyImage(rental.id, files[i]);
        if (uploadedImage) {
          setPropertyImages(prev => [uploadedImage, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (image: PropertyImage) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const success = await propertyImageService.deletePropertyImage(image.id, image.image_url);
      if (success) {
        setPropertyImages(prev => prev.filter(img => img.id !== image.id));
      }
    }
  };

  // Helper function to render avatar
  const renderAvatar = (firstName?: string, lastName?: string, imageUrl?: string) => {
    if (imageUrl) {
      return (
        <img 
          src={imageUrl}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    
    // If no image but we have a name, display initials
    if (firstName || lastName) {
      const initials = getInitials(`${firstName || ''} ${lastName || ''}`);
      const bgColor = getAvatarBgColor(`${firstName || ''} ${lastName || ''}`);
      
      return (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      );
    }
    
    // Default avatar for no image or name
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">?</span>
      </div>
    );
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-end items-center -mt-1 mb-2 space-x-2">
        {showAddTask && (
          <button
            onClick={() => setIsAddTaskDrawerOpen(true)}
            className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* ClipboardList icon */}
            <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"></path>
            </svg>
            <span className="text-sm">Add Task</span>
          </button>
        )}
        <button
          onClick={() => setIsAddApplicationDrawerOpen(true)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* FileText icon */}
          <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
          <span className="text-sm">New Rental Application</span>
        </button>
        <button
          onClick={() => onEdit(rental.id)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Edit2 icon */}
          <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          <span className="text-sm">Edit</span>
        </button>
      </div>

      {/* Stakeholders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholders</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              {/* Users2 icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-4-4h-4"></path>
                <circle cx="17" cy="7" r="4"></circle>
              </svg>
              <p>Owner</p>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              {rental.owner && rental.owner.user ? (
                <>
                  {renderAvatar(
                    rental.owner.user.first_name,
                    rental.owner.user.last_name,
                    (rental.owner.user as User).avatar_url
                  )}
                  <p className="text-[#2C3539] font-medium">
                    {`${rental.owner.user.first_name} ${rental.owner.user.last_name}`}
                  </p>
                </>
              ) : (
                <p className="text-[#6B7280]">No owner assigned</p>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              {/* UserCog icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M19.43 18.02C20.5 17.95 21.63 17.15 22 16v-1.87c-.37-1.15-1.5-1.95-2.57-2.02-1.57-.09-2.95.85-3.35 2.1H16v3.58h.08c.41 1.26 1.81 2.19 3.35 2.1"></path>
              </svg>
              <p>Property Manager</p>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              {extendedRental.property_manager && extendedRental.property_manager.user ? (
                <>
                  {renderAvatar(
                    extendedRental.property_manager.user.first_name,
                    extendedRental.property_manager.user.last_name,
                    extendedRental.property_manager.user.avatar_url
                  )}
                  <p className="text-[#2C3539] font-medium">
                    {`${extendedRental.property_manager.user.first_name} ${extendedRental.property_manager.user.last_name}`}
                  </p>
                </>
              ) : (
                <p className="text-[#6B7280]">No manager assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Information Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Property Information</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* DoorOpen icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
                  <path d="M2 20h3"></path>
                  <path d="M13 20h9"></path>
                  <path d="M10 12v.01"></path>
                  <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
                </svg>
                <p>Units</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.unit}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* Building2 icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v20Z"></path>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  <path d="M10 6h4"></path>
                  <path d="M10 10h4"></path>
                  <path d="M10 14h4"></path>
                  <path d="M10 18h4"></path>
                </svg>
                <p>Property Type</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1 capitalize">{rental.type}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* MapPin icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p>Location</p>
              </div>
              <p className="text-[#6B7280] text-sm mt-1">{rental.address || getPropertyLocation(rental.propertyName)}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* DollarSign icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <p>Monthly Revenue</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">${rental.monthly_revenue || 0}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* Home icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <p>Active Leases</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.active_leases || 0}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                {/* PercentCircle icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m15 9-6 6"></path>
                  <path d="m9 9 6 6"></path>
                </svg>
                <p>Occupancy Rate</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.occupancy_rate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">Property Images</h2>
          
          {/* Image upload button */}
          <label className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload} 
              disabled={isUploading}
            />
            {/* Plus icon */}
            <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span className="text-sm">{isUploading ? 'Uploading...' : 'Add Image'}</span>
          </label>
        </div>
        
        {propertyImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {propertyImages.map((image) => (
              <div key={image.id} className="aspect-[4/3] rounded-lg overflow-hidden group relative">
                <img 
                  src={propertyImageService.getResizedImageUrl(image.image_url, 400)}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDeleteImage(image)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="mb-1">No property images yet</p>
            <p className="text-sm">Click "Add Image" to upload property photos</p>
          </div>
        )}
      </div>

      {/* Add Task Drawer */}
      <AddTaskDrawer
        isOpen={isAddTaskDrawerOpen}
        onClose={() => setIsAddTaskDrawerOpen(false)}
        onSubmit={handleAddTask}
        users={[
          { id: '1', name: 'John Doe', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
          { id: '2', name: 'Jane Smith', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
        ]}
        currentUser={{ id: '1', name: 'John Doe', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }}
      />

      {/* Add Application Drawer */}
      <AddApplicationDrawer
        isOpen={isAddApplicationDrawerOpen}
        onClose={() => setIsAddApplicationDrawerOpen(false)}
        propertyId={rental.id}
        organizationId={rental.organization_id || ''}
        onSuccess={handleAddApplication}
        availableUnits={rental.units?.map(unit => ({
          id: unit.id,
          unit_number: unit.unit_number || unit.number || `${unit.name || 'Unit'}`
        })) || []}
      />

      {/* Backdrop */}
      {(isAddTaskDrawerOpen || isAddApplicationDrawerOpen) && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => {
            setIsAddTaskDrawerOpen(false);
            setIsAddApplicationDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}
