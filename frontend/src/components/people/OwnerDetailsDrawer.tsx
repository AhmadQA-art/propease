import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Briefcase, User, Calendar, Edit2, Save, Home, MapPin } from 'lucide-react';
import { UiOwner } from '../../services/adapters/ownerAdapter';
import { ownersApi, CreateOwnerData } from '../../services/api/owners';
import { propertyApi } from '../../services/api/properties';
import { Property } from '../../services/supabase/types';
import { toast } from 'react-hot-toast';

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
  
  // Initialize form when owner data changes
  React.useEffect(() => {
    if (owner) {
      setFirstName(owner.user_profiles.first_name);
      setLastName(owner.user_profiles.last_name);
      setEmail(owner.user_profiles.email);
      setPhone(owner.user_profiles.phone);
      setCompanyName(owner.company_name);
      setOwnerType(owner.owner_type || owner.business_type); // Support both field names
    }
  }, [owner]);
  
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
  };

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
      
      // Show success message
      toast.success('Owner updated successfully');
      
      // Call onUpdate if provided
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating owner:', error);
      toast.error('Failed to update owner');
    } finally {
      setIsSaving(false);
    }
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
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#2C3539]"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Owner Profile */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center">
                  <User size={32} />
                </div>
                <div className="ml-4">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 mb-2">
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
                  ) : (
                    <h3 className="text-lg font-semibold text-[#2C3539]">
                      {owner.user_profiles.first_name} {owner.user_profiles.last_name}
                    </h3>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    owner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {owner.status}
                  </span>
                </div>
              </div>
              
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-3 py-1.5 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm disabled:opacity-50"
                >
                  <Save size={16} className="mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </button>
              )}
            </div>
            
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
                  <span>{owner.user_profiles.email}</span>
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
                  <span>{owner.user_profiles.phone}</span>
                )}
              </div>
              
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
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Manage Properties
              </button>
            </div>
            
            {isLoadingProperties ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-[#6B7280]">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-[#6B7280]">No properties associated with this owner yet.</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  + Add Property
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
                          <span>{property.address}</span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm text-gray-500">{property.units} units</span>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Activity Section (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold text-[#2C3539] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-gray-200 pl-4 py-1">
                <p className="text-[#6B7280] text-sm">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 