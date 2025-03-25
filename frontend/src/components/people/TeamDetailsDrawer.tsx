import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Calendar, Briefcase, Users, Edit2, Save, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { peopleApi } from '../../services/api/people';
import { toast } from 'react-hot-toast';
import { TeamMember } from '../../types/people';
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import SearchableDropdown from './SearchableDropdown';

interface TeamDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember: TeamMember | null;
  onUpdate?: () => void;
}

interface DetailedTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  imageUrl?: string;
  jobTitle?: string;
  department?: string;
  departmentId?: string;
  joinedDate: string;
}

export default function TeamDetailsDrawer({ isOpen, onClose, teamMember, onUpdate }: TeamDetailsDrawerProps) {
  const [detailedMember, setDetailedMember] = useState<DetailedTeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{value: string, label: string}[]>([]);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Fetch team member details and departments when the drawer opens
  useEffect(() => {
    if (isOpen && teamMember) {
      fetchTeamMemberDetails(teamMember.id);
      fetchDepartments();
    } else {
      setDetailedMember(null);
    }
  }, [isOpen, teamMember]);
  
  // Initialize form data when team member changes or edit mode is toggled
  useEffect(() => {
    if (detailedMember) {
      setFirstName(detailedMember.firstName || '');
      setLastName(detailedMember.lastName || '');
      setEmail(detailedMember.email || '');
      setPhone(detailedMember.phone || '');
      setJobTitle(detailedMember.jobTitle || '');
      setDepartmentId(detailedMember.departmentId || '');
    }
  }, [detailedMember, isEditing]);
  
  // Reset edit state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);
  
  const fetchTeamMemberDetails = async (teamMemberId: string) => {
    setLoading(true);
    try {
      // Fetch team member details from the API
      const response = await peopleApi.getTeamMemberById(teamMemberId);
      
      // Transform the response into the detailed team member format
      const memberData: DetailedTeamMember = {
        id: response.id,
        firstName: response.user_profiles?.first_name || '',
        lastName: response.user_profiles?.last_name || '',
        email: response.user_profiles?.email || '',
        phone: response.user_profiles?.phone || '',
        imageUrl: response.user_profiles?.profile_image_url,
        jobTitle: response.job_title || '',
        department: response.departments?.name || '',
        departmentId: response.department_id || '',
        joinedDate: response.created_at || ''
      };
      
      setDetailedMember(memberData);
    } catch (error) {
      console.error('Error fetching team member details:', error);
      toast.error('Failed to load team member details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      // Fetch departments from the API
      const response = await peopleApi.getDepartments();
      
      // Transform the response into the format needed for SearchableDropdown
      const departmentOptions = response.map((dept: any) => ({
        value: dept.id,
        label: dept.name
      }));
      
      setDepartments(departmentOptions);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form values to current team member values
    if (detailedMember) {
      setFirstName(detailedMember.firstName || '');
      setLastName(detailedMember.lastName || '');
      setEmail(detailedMember.email || '');
      setPhone(detailedMember.phone || '');
      setJobTitle(detailedMember.jobTitle || '');
      setDepartmentId(detailedMember.departmentId || '');
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

      // Validate phone
      if (phone && !isPossiblePhoneNumber(phone)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
    }
  }, [email, phone, isEditing]);

  const handleSave = async () => {
    if (!teamMember || !detailedMember) return;
    
    // Validate form before saving
    if (emailError || phoneError) {
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare update data for team member
      const userProfileData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone
      };
      
      const teamMemberData = {
        job_title: jobTitle,
        department_id: departmentId || null
      };
      
      // Update team member through the people API
      await peopleApi.updateTeamMember(teamMember.id, userProfileData, teamMemberData);
      
      // Refetch the team member details to ensure we have the latest data
      await fetchTeamMemberDetails(teamMember.id);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message
      toast.success('Team member updated successfully');
      
      // Call onUpdate if provided to refresh the parent list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!teamMember) return;
    
    // Confirm deletion with user
    const shouldDelete = window.confirm(`Are you sure you want to remove ${teamMember.name} from the team? This will also delete their user account.`);
    
    if (!shouldDelete) return;
    
    setIsDeleting(true);
    
    try {
      await peopleApi.deletePerson(teamMember.id, 'team');
      
      // Show success message
      toast.success('Team member removed successfully');
      
      // Close drawer first (better UX)
      onClose();
      
      // Then refresh the parent list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting team member:', error);
      let errorMessage = 'Failed to remove team member';
      
      // Add more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'This team member cannot be deleted because they are referenced in other data';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'You do not have permission to delete this team member';
        } else {
          errorMessage = `Failed to remove team member: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // If loading or no team member, show loading UI
  if (loading) {
    return (
      isOpen ? (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C3539] mb-4"></div>
            <p className="text-[#6B7280]">Loading team member details...</p>
          </div>
        </div>
      ) : null
    );
  }

  return (
    <>
      {isOpen && (teamMember || detailedMember) ? (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
          {/* Header - Fixed */}
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2C3539]">
                Team Member Details
              </h2>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Removing...' : 'Remove'}
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
              {/* Team Member Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {detailedMember?.imageUrl ? (
                    <img
                      src={detailedMember.imageUrl}
                      alt={`${detailedMember.firstName} ${detailedMember.lastName}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    <h3 className="text-lg font-medium text-[#2C3539]">
                      {detailedMember ? `${detailedMember.firstName} ${detailedMember.lastName}` : teamMember?.name}
                    </h3>
                  )}
                  {!isEditing && (
                    <p className="text-sm text-[#6B7280]">{teamMember?.role || detailedMember?.jobTitle}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-[#2C3539]">Contact Information</h4>
                
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
                      <span className="text-[#2C3539]">{detailedMember?.email || teamMember?.email || 'No email provided'}</span>
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
                      <span className="text-[#2C3539]">{detailedMember?.phone || teamMember?.phone || 'No phone provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-[#2C3539]">Job Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <span className="text-sm text-[#6B7280] block">Job Title</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full mt-1"
                          placeholder="Job Title"
                        />
                      ) : (
                        <span className="text-[#2C3539]">{detailedMember?.jobTitle || teamMember?.jobTitle || 'No job title provided'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <span className="text-sm text-[#6B7280] block">Department</span>
                      {isEditing ? (
                        <div className="mt-1">
                          <SearchableDropdown
                            options={departments}
                            selectedValues={departmentId ? [departmentId] : []}
                            onChange={(values) => setDepartmentId(values[0] || '')}
                            placeholder="Select department"
                            disabled={isSaving}
                          />
                        </div>
                      ) : (
                        <span className="text-[#2C3539]">{detailedMember?.department || teamMember?.department || 'No department assigned'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#6B7280]" />
                    <div className="flex-1">
                      <span className="text-sm text-[#6B7280] block">Joined Date</span>
                      <span className="text-[#2C3539]">
                        {detailedMember?.joinedDate ? format(new Date(detailedMember.joinedDate), 'MMM d, yyyy') : 
                        teamMember?.createdAt ? format(new Date(teamMember.createdAt), 'MMM d, yyyy') : 
                        'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
} 