import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Briefcase, Save, Loader2, Building2, MapPin, Globe, Map, Shield, Edit, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile, 
  UserProfile, 
  getUserOrganization, 
  Organization, 
  getUserRole, 
  Role,
  getUserJobTitle,
  updateUserJobTitle
} from '@/services/user.service';

// Utility function to format role names
const formatRoleName = (roleName: string): string => {
  return roleName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function MyAccount() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    jobTitle: '',
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Get user profile (needed for other requests)
        const userProfile = await getUserProfile();
        console.log('Fetched user profile:', userProfile);
        setProfile(userProfile);
        
        // Get job title separately since it's in a different table
        const jobTitleData = await getUserJobTitle().catch(error => {
          console.error('Error fetching job title:', error);
          return null;
        });
        
        setFormData({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          phone: userProfile.phone || '',
          jobTitle: jobTitleData || '',
        });
        
        // Step 2: Fetch other data in parallel
        const [role, orgData] = await Promise.all([
          // Get user role
          getUserRole().catch(error => {
            console.error('Error fetching user role:', error);
            return null;
          }),
          
          // Get organization (only if user has organization_id)
          userProfile.organization_id 
            ? getUserOrganization().catch(error => {
                console.error('Error fetching organization:', error);
                return null;
              })
            : Promise.resolve(null)
        ]);
        
        console.log('All data fetched:');
        console.log('Role:', role);
        console.log('Job title:', jobTitleData);
        console.log('Organization:', orgData);
        
        // Update state with fetched data
        setUserRole(role);
        setJobTitle(jobTitleData);
        setOrganization(orgData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your profile information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate first name (required)
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    // Validate last name (required)
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    // Validate phone number (optional, but if provided must be in the right format)
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Extract profile data (excluding job title which is in team_members table)
      const profileUpdateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      };
      
      // Track what changed for better feedback
      const changedProfileFields = Object.keys(profileUpdateData).filter(key => {
        if (!profile) return false;
        return profileUpdateData[key as keyof typeof profileUpdateData] !== profile[key as keyof typeof profile];
      });
      
      const jobTitleChanged = jobTitle !== formData.jobTitle && formData.jobTitle.trim() !== '';
      
      // Update operations to perform
      const operations = [];
      
      // Only update profile if fields changed
      if (changedProfileFields.length > 0) {
        operations.push(updateUserProfile(profileUpdateData));
      }
      
      // Only update job title if it changed and user has access to update it
      if (jobTitleChanged && !jobTitle) {
        // We can only update job title if user doesn't already have one from team_members
        operations.push(updateUserJobTitle(formData.jobTitle.trim()));
      }
      
      if (operations.length === 0) {
        toast.success('No changes to save');
        setIsEditMode(false);
        return;
      }
      
      // Execute all update operations
      const results = await Promise.allSettled(operations);
      
      // Check results
      const hasErrors = results.some(result => result.status === 'rejected');
      const updatedProfile = results.find(
        result => result.status === 'fulfilled' && 
          'first_name' in (result as PromiseFulfilledResult<any>).value
      )?.status === 'fulfilled' 
        ? (results.find(
            result => result.status === 'fulfilled' && 
              'first_name' in (result as PromiseFulfilledResult<any>).value
          ) as PromiseFulfilledResult<UserProfile>).value 
        : undefined;
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      // If job title was updated, refresh it
      if (jobTitleChanged) {
        try {
          const newJobTitle = await getUserJobTitle();
          setJobTitle(newJobTitle);
        } catch (error) {
          console.error('Error refreshing job title after update:', error);
        }
      }
      
      setIsEditMode(false);
      
      if (hasErrors) {
        toast.error('Some changes could not be saved');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    // Ensure form data is up to date with profile data before editing
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        jobTitle: jobTitle || '',
      });
    }
    
    // Clear any previous form errors
    setFormErrors({});
    
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        jobTitle: jobTitle || '',
      });
    }
    
    // Clear any form errors
    setFormErrors({});
    
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2C3539]">My Account</h1>
          <p className="text-[#6B7280] mt-1">Manage your personal information</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(index => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C3539]">My Account</h1>
        <p className="text-[#6B7280] mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#2C3539]">Profile Information</h2>
            {!isEditMode && (
              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center text-sm font-medium text-[#2C3539] hover:text-[#3d474c]"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>
          
          {isEditMode ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${formErrors.first_name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                      placeholder="First name"
                    />
                    {formErrors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${formErrors.last_name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                      placeholder="Last name"
                    />
                    {formErrors.last_name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                      placeholder="Phone number"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {jobTitle ? (
                      <div className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                        {jobTitle}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2 border ${formErrors.jobTitle ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                          placeholder="Job title"
                        />
                        {formErrors.jobTitle && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.jobTitle}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  {userRole ? (
                    <div className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                      {formatRoleName(userRole.name)}
                      {userRole.description && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {userRole.description}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                      No role assigned
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539] mb-2">First Name</h3>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-700">{profile?.first_name || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539] mb-2">Last Name</h3>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-700">{profile?.last_name || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-[#2C3539] mb-2">Email</h3>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-gray-700">{user?.email || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539] mb-2">Phone Number</h3>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-700">{profile?.phone || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#2C3539] mb-2">Job Title</h3>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-700">{jobTitle || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-[#2C3539] mb-2">Role</h3>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-gray-700">
                    {userRole ? formatRoleName(userRole.name) : 'No role assigned'}
                  </p>
                </div>
                {userRole?.description && (
                  <p className="text-sm text-gray-500 mt-1 ml-8">
                    {userRole.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Organization Information Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-6">Organization Information</h2>
          
          {organization ? (
            <div className="space-y-4">
              <div className="flex items-start">
                <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-md font-medium text-[#2C3539]">{organization.name}</h3>
                  {organization.description && (
                    <p className="text-sm text-gray-500 mt-1">{organization.description}</p>
                  )}
                </div>
              </div>
              
              {(organization.address || organization.city || organization.state || organization.zip) && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    {organization.address && (
                      <p className="text-sm text-gray-700">{organization.address}</p>
                    )}
                    {(organization.city || organization.state || organization.zip) && (
                      <p className="text-sm text-gray-700">
                        {[
                          organization.city,
                          organization.state,
                          organization.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {organization.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-700">{organization.phone}</p>
                </div>
              )}
              
              {organization.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-700">{organization.email}</p>
                </div>
              )}
              
              {organization.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <a 
                    href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No organization information available.</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-6">Security</h2>
          
          <div>
            <h3 className="text-sm font-medium text-[#2C3539] mb-2">Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              To change your password, use the link below
            </p>
            <a
              href="/auth/update-password"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-[#2C3539] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539]"
            >
              Change Password
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 