import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Phone, Briefcase, User, Calendar, Edit2, Save, Home, MapPin } from 'lucide-react';
import { UiOwner } from '../../services/adapters/ownerAdapter';
import { ownersApi, CreateOwnerData } from '../../services/api/owners';
import { propertyApi } from '../../services/api/properties';
import { Property } from '../../services/supabase/types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface OwnerDetailsDrawerProps {
  owner: UiOwner | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function OwnerDetailsDrawer({ owner, isOpen, onClose, onUpdate }: OwnerDetailsDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ownerType, setOwnerType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoadingAllProperties, setIsLoadingAllProperties] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isLinkingProperty, setIsLinkingProperty] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Function to load form data from owner object
  const loadFormData = () => {
    if (!owner) return;
    
    // Check if owner has direct name field (new format)
    if ((owner as any).name) {
      // Try to split the name into first and last
      const nameParts = (owner as any).name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail((owner as any).email || '');
      setPhone((owner as any).phone || '');
    } 
    // Fallback to user_profiles (old format)
    else if (owner.user_profiles) {
      setFirstName(owner.user_profiles.first_name || '');
      setLastName(owner.user_profiles.last_name || '');
      setEmail(owner.user_profiles.email || '');
      setPhone(owner.user_profiles.phone || '');
    }
    
    setCompanyName(owner.company_name || '');
    setOwnerType(owner.owner_type || owner.business_type || ''); // Support both field names
  };
  
  // Effect to handle clicking outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Load all properties when adding a property
  useEffect(() => {
    if (isAddingProperty && allProperties.length === 0) {
      const loadAllProperties = async () => {
        setIsLoadingAllProperties(true);
        try {
          const properties = await propertyApi.getProperties();
          setAllProperties(properties);
          setFilteredProperties(properties);
        } catch (error) {
          console.error('Error loading properties:', error);
          toast.error('Failed to load properties');
        } finally {
          setIsLoadingAllProperties(false);
        }
      };
      
      loadAllProperties();
    }
  }, [isAddingProperty, allProperties.length]);
  
  // Filter properties based on search
  useEffect(() => {
    if (allProperties.length > 0) {
      if (!propertySearchQuery.trim()) {
        setFilteredProperties(allProperties);
      } else {
        const filtered = allProperties.filter(property => 
          property.name.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
          (property.address && property.address.toLowerCase().includes(propertySearchQuery.toLowerCase()))
        );
        setFilteredProperties(filtered);
      }
    }
  }, [propertySearchQuery, allProperties]);
  
  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
    setPropertySearchQuery(property.name);
    setIsDropdownOpen(false);
  };
  
  // Format the owner's full name with proper handling of missing data
  const getFormattedName = () => {
    // Debug: Log the actual owner object structure
    console.log("Owner object in OwnerDetailsDrawer:", owner);
    
    if (!owner) return 'Unknown Owner';
    
    // Check for all possible name variants
    // 1. Direct name property from the updated UiOwner interface
    if (owner.name) {
      return owner.name;
    }
    
    // 2. Name could be inside user_profiles
    if (owner.user_profiles) {
      const firstName = owner.user_profiles.first_name?.trim() || '';
      const lastName = owner.user_profiles.last_name?.trim() || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    return 'Unknown Owner';
  };
  
  // Initialize form when owner data changes
  React.useEffect(() => {
    if (owner) {
      loadFormData();
    }
  }, [owner]);
  
  // Make sure to update the form when entering edit mode to ensure latest values
  React.useEffect(() => {
    if (isEditing && owner) {
      loadFormData();
    }
  }, [isEditing, owner]);
  
  // Fetch properties when owner changes
  useEffect(() => {
    const fetchProperties = async () => {
      if (!owner) return;
      
      setIsLoadingProperties(true);
      try {
        const ownerProperties = await propertyApi.getPropertiesByOwner(owner.id);
        setProperties(ownerProperties);
      } catch (error) {
        console.error('Error fetching owner properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setIsLoadingProperties(false);
      }
    };
    
    fetchProperties();
  }, [owner]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form values to current owner values when entering edit mode
    if (!isEditing && owner) {
      loadFormData();
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form values to current owner values
    if (owner) {
      loadFormData();
    }
  };
  
  const handleDeleteOwner = async () => {
    if (!owner) return;
    
    if (window.confirm(`Are you sure you want to delete ${getFormattedName()}?`)) {
      try {
        await ownersApi.deleteOwner(owner.id);
        toast.success('Owner deleted successfully');
        onClose(); // Close the drawer
        if (onUpdate) onUpdate(); // Refresh the owners list
      } catch (error) {
        console.error('Error deleting owner:', error);
        toast.error('Failed to delete owner');
      }
    }
  };

  // Reset edit state when drawer closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!owner) return;
    
    setIsSaving(true);
    
    try {
      // Prepare update data
      const updateData: Partial<CreateOwnerData> = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        company_name: companyName,
        owner_type: ownerType
      };
      
      // Update owner in API
      await ownersApi.updateOwner(owner.id, updateData);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Update local state to reflect changes immediately without waiting for refresh
      if (owner.name) {
        // Update with the new full name
        (owner as any).name = `${firstName} ${lastName}`.trim();
      }
      if (owner.user_profiles) {
        owner.user_profiles.first_name = firstName;
        owner.user_profiles.last_name = lastName;
        owner.user_profiles.email = email;
        owner.user_profiles.phone = phone;
      }
      // Update direct properties too if they exist
      (owner as any).email = email;
      (owner as any).phone = phone;
      owner.company_name = companyName;
      owner.owner_type = ownerType;
      
      // Show success message
      toast.success('Owner updated successfully');
      
      // Call onUpdate if provided to refresh the parent list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating owner:', error);
      toast.error('Failed to update owner');
    } finally {
      setIsSaving(false);
    }
  };

  const loadOwnerProperties = async () => {
    if (owner) {
      setIsLoadingProperties(true);
      try {
        const ownerProperties = await propertyApi.getPropertiesByOwner(owner.id);
        setProperties(ownerProperties);
      } catch (error) {
        console.error('Error loading owner properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setIsLoadingProperties(false);
      }
    }
  };

  // Load owner data and properties when the drawer opens
  useEffect(() => {
    if (isOpen && owner) {
      loadFormData();
      loadOwnerProperties();
    }
  }, [isOpen, owner]);

  const handleLinkProperty = async () => {
    if (!owner || !selectedPropertyId) return;
    
    setIsLinkingProperty(true);
    
    try {
      // Link the selected property to the owner
      await propertyApi.linkPropertyToOwner(selectedPropertyId, owner.id);
      
      // Reset form
      setPropertySearchQuery('');
      setSelectedPropertyId(null);
      setIsAddingProperty(false);
      
      // Refresh properties list
      loadOwnerProperties();
      
      toast.success('Property linked to owner successfully');
    } catch (error) {
      console.error('Error linking property to owner:', error);
      toast.error('Failed to link property to owner');
    } finally {
      setIsLinkingProperty(false);
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/rentals/${propertyId}`);
  };

  if (!isOpen || !owner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#2C3539]">Owner Details</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleDeleteOwner}
                  className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Delete
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
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Owner Profile Header - Name and Image */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center">
              <User size={32} />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-[#2C3539]">
                {getFormattedName()}
              </h2>
            </div>
          </div>
          
          {/* Owner Profile */}
          <div className="mb-8">
            {/* Edit Form */}
            {isEditing && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Last Name"
                />
              </div>
            )}
            
            {/* Contact Information */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center text-[#6B7280]">
                <Mail size={20} className="mr-3" />
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Email Address"
                  />
                ) : (
                  <span>{(owner as any).email || owner.user_profiles?.email || 'No email provided'}</span>
                )}
              </div>
              
              <div className="flex items-center text-[#6B7280]">
                <Phone size={20} className="mr-3" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    placeholder="Phone Number"
                  />
                ) : (
                  <span>{(owner as any).phone || owner.user_profiles?.phone || 'No phone provided'}</span>
                )}
              </div>
              
              {/* Only show company name if owner is not individual type */}
              {(ownerType !== 'individual') && (
                <div className="flex items-center text-[#6B7280]">
                  <Briefcase size={20} className="mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      placeholder="Company Name"
                    />
                  ) : (
                    <span>{owner.company_name}</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-[#6B7280]">
                <Calendar size={20} className="mr-3" />
                <span>Added on {new Date(owner.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Owner Type */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-[#6B7280] mb-2">Owner Type</h4>
              {isEditing ? (
                <select
                  value={ownerType}
                  onChange={(e) => setOwnerType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                >
                  <option value="">Select owner type</option>
                  <option value="individual">Individual</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                </select>
              ) : (
                <p className="text-[#2C3539]">{owner.owner_type || owner.business_type || 'Not specified'}</p>
              )}
            </div>
          </div>
          
          {/* Properties Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2C3539]">Properties</h3>
            </div>
            
            {isLoadingProperties ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-[#6B7280]">Loading properties...</p>
              </div>
            ) : isAddingProperty ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-[#2C3539]">Link Property to Owner</h4>
                <div ref={dropdownRef} className="relative">
                  <label htmlFor="property-selector" className="block text-sm text-gray-600 mb-1">
                    Select Property
                  </label>
                  <div 
                    className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#2C3539] cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <input
                      id="property-selector"
                      type="text"
                      value={propertySearchQuery}
                      onChange={(e) => {
                        setPropertySearchQuery(e.target.value);
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }}
                      className="flex-1 border-none focus:outline-none focus:ring-0"
                      placeholder="Search for a property..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {isLoadingAllProperties ? (
                        <div className="p-3 text-center text-gray-500">Loading properties...</div>
                      ) : filteredProperties.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">No properties found</div>
                      ) : (
                        filteredProperties.map(property => (
                          <div
                            key={property.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer ${
                              selectedPropertyId === property.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handlePropertySelect(property)}
                          >
                            <div className="font-medium text-[#2C3539]">{property.name}</div>
                            <div className="text-xs text-gray-500">
                              {property.address || 'No address'} • {property.units || 0} units
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2 mt-4">
                  <button
                    onClick={() => {
                      setIsAddingProperty(false);
                      setPropertySearchQuery('');
                      setSelectedPropertyId(null);
                      setIsDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLinkProperty}
                    disabled={!selectedPropertyId || isLinkingProperty}
                    className="px-3 py-1.5 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm disabled:opacity-50"
                  >
                    {isLinkingProperty ? 'Linking...' : 'Link Property'}
                  </button>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-[#6B7280]">No properties associated with this owner yet.</p>
                <button 
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => setIsAddingProperty(true)}
                >
                  + Link Property
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex-shrink-0 flex items-center justify-center mr-3">
                        <Home size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#2C3539]">{property.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin size={14} className="mr-1" />
                          <span>{property.address || 'No address available'}</span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-500">{property.units || 0} units</span>
                          <button 
                            onClick={() => handleViewProperty(property.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Property Button */}
                <button
                  onClick={() => setIsAddingProperty(true)}
                  className="w-full flex items-center justify-center py-2 border border-dashed border-gray-300 rounded-lg text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  + Link Another Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 