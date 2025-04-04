import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Clock, Tag, User, MessageSquare, CheckCircle, Hash, Calendar, ChevronDown, Search, Plus, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Ticket, TicketHistory } from '../types/maintenance';
import clsx from 'clsx';
import { supabase } from '../config/supabase';

interface Assignee {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_image_url: string | null;
}

interface VendorDetails {
  id: string;
  vendor_name: string;
  service_type: string;
  business_type: string;
  hourly_rate: number;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  emergency_service: boolean;
  performance_rating: number;
}

interface TicketDrawerProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete?: (ticketId: string) => void;
  onStatusChange?: (ticketId: string, newStatus: string) => void;
  onAssigneeChange?: (ticketId: string, assigneeId: string) => void;
  onPriorityChange?: (ticketId: string, newPriority: string) => void;
}

const mockHistory: TicketHistory[] = [
  {
    id: 1,
    action: 'status_change',
    description: 'Changed status from "New" to "In Progress"',
    user: 'John Smith',
    timestamp: new Date(2024, 2, 15, 14, 30),
    type: 'update'
  },
  {
    id: 2,
    action: 'comment',
    description: 'Technician scheduled for tomorrow morning',
    user: 'Sarah Johnson',
    timestamp: new Date(2024, 2, 15, 10, 15),
    type: 'comment'
  },
  {
    id: 3,
    action: 'created',
    description: 'Ticket created',
    user: 'Mike Wilson',
    timestamp: new Date(2024, 2, 15, 9, 0),
    type: 'create'
  }
];

export default function TicketDrawer({ ticket, isOpen, onClose, onMarkComplete, onStatusChange, onAssigneeChange, onPriorityChange }: TicketDrawerProps) {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  
  // Vendor state
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loadingVendor, setLoadingVendor] = useState<boolean>(false);
  const [showVendorSearch, setShowVendorSearch] = useState<boolean>(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState<string>('');
  const [availableVendors, setAvailableVendors] = useState<VendorDetails[]>([]);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false);
  const [isChangingVendor, setIsChangingVendor] = useState<boolean>(false);
  
  // Priority management states
  const [showPriorityDropdown, setShowPriorityDropdown] = useState<boolean>(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState<boolean>(false);
  const [currentPriority, setCurrentPriority] = useState<string>('');
  
  // Assignee management states
  const [showAssigneeSearch, setShowAssigneeSearch] = useState<boolean>(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<Assignee[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [isChangingAssignee, setIsChangingAssignee] = useState<boolean>(false);
  
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeSearchRef = useRef<HTMLDivElement>(null);
  const vendorSearchRef = useRef<HTMLDivElement>(null);

  // Status options based on database constraints
  const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];
  
  // Priority options
  const PRIORITY_OPTIONS = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  // Close status dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownRef]);
  
  // Close priority dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [priorityDropdownRef]);

  // Close assignee search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeSearchRef.current && !assigneeSearchRef.current.contains(event.target as Node)) {
        setShowAssigneeSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [assigneeSearchRef]);

  // Close vendor search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (vendorSearchRef.current && !vendorSearchRef.current.contains(event.target as Node)) {
        setShowVendorSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [vendorSearchRef]);

  useEffect(() => {
    // Fetch assignee information if we have a ticket id
    const fetchAssigneeInfo = async () => {
      if (!ticket || !isOpen) return;
      
      try {
        setLoadingAssignees(true);
        
        // First get all assignees for this ticket from the task_assignees table
        const { data: assigneeData, error: assigneeError } = await supabase
          .from('task_assignees')
          .select('user_id')
          .eq('task_id', ticket.id);
        
        if (assigneeError) throw assigneeError;
        
        if (assigneeData && assigneeData.length > 0) {
          // Extract the user IDs
          const userIds = assigneeData.map(a => a.user_id);
          
          // Now get all team members that match these user IDs
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select(`
              id,
              user_id,
              user_profiles (
                id, 
                first_name, 
                last_name, 
                email, 
                profile_image_url
              )
            `)
            .in('user_id', userIds);
          
          if (teamMemberError) throw teamMemberError;
          
          if (teamMemberData) {
            // Format the team members data
            const formattedAssignees = teamMemberData.map(member => {
              const user = member.user_profiles;
              const firstName = user?.first_name || '';
              const lastName = user?.last_name || '';
              const fullName = `${firstName} ${lastName}`.trim();
              const displayName = fullName || user?.email || `User-${user?.id.substring(0, 8)}`;
              
              return {
                id: user?.id,
                first_name: firstName,
                last_name: lastName,
                display_name: displayName,
                profile_image_url: user?.profile_image_url
              };
            }).filter(user => user.id !== undefined); // Filter out any undefined users
            
            setAssignees(formattedAssignees);
          }
        } else {
          // No assignees for this ticket
          setAssignees([]);
        }
      } catch (err) {
        console.error('Error fetching assignee information:', err);
        setAssignees([]);
      } finally {
        setLoadingAssignees(false);
      }
    };
    
    fetchAssigneeInfo();
  }, [ticket, isOpen]);

  useEffect(() => {
    if (ticket) {
      setCurrentStatus(ticket.status);
      setCurrentPriority(ticket.priority);
    }
  }, [ticket]);

  // Load available users for assignment
  useEffect(() => {
    if (!showAssigneeSearch) return;
    
    const fetchAvailableUsers = async () => {
      try {
        setLoadingUsers(true);
        
        // Fetch team members instead of all users
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            user_profiles (
              id,
              first_name,
              last_name,
              email,
              profile_image_url
            )
          `)
          .order('created_at');
        
        if (error) throw error;
        
        if (data) {
          const formattedUsers = data.map(member => {
            const user = member.user_profiles;
            const firstName = user?.first_name || '';
            const lastName = user?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const displayName = fullName || user?.email || `User-${user?.id.substring(0, 8)}`;
            
            return {
              id: user?.id,
              first_name: firstName,
              last_name: lastName,
              display_name: displayName,
              profile_image_url: user?.profile_image_url
            };
          }).filter(user => user.id !== undefined); // Filter out any undefined users
          
          setAvailableUsers(formattedUsers);
        }
      } catch (err) {
        console.error('Error fetching available team members:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchAvailableUsers();
  }, [showAssigneeSearch]);

  // Load available vendors for assignment
  useEffect(() => {
    if (!showVendorSearch) return;
    
    const fetchAvailableVendors = async () => {
      try {
        setLoadingVendors(true);
        
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            id,
            vendor_name,
            service_type,
            business_type,
            hourly_rate,
            contact_person_name,
            contact_person_email,
            contact_person_phone,
            emergency_service,
            performance_rating
          `)
          .order('vendor_name');
        
        if (error) throw error;
        
        if (data) {
          setAvailableVendors(data as VendorDetails[]);
        }
      } catch (err) {
        console.error('Error fetching available vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };
    
    fetchAvailableVendors();
  }, [showVendorSearch]);

  // Fetch vendor information if available
  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!ticket || !ticket.vendor_id || !isOpen) return;
      
      try {
        setLoadingVendor(true);
        
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            id,
            vendor_name,
            service_type,
            business_type,
            hourly_rate,
            contact_person_name,
            contact_person_email,
            contact_person_phone,
            emergency_service,
            performance_rating
          `)
          .eq('id', ticket.vendor_id)
          .single();
        
        if (error) {
          console.error('Error fetching vendor details:', error);
          setVendor(null);
          return;
        }
        
        if (data) {
          setVendor(data as VendorDetails);
        } else {
          setVendor(null);
        }
      } catch (err) {
        console.error('Error in vendor fetch process:', err);
        setVendor(null);
      } finally {
        setLoadingVendor(false);
      }
    };
    
    fetchVendorDetails();
  }, [ticket, isOpen]);

  // Handle changing the ticket assignee
  const handleChangeAssignee = async (userId: string) => {
    if (!ticket || isChangingAssignee) return;
    
    try {
      setIsChangingAssignee(true);
      
      // First, remove any existing assignees for this ticket
      const { error: removeError } = await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', ticket.id);
      
      if (removeError) throw removeError;
      
      // Then, add the new assignee
      const { error: addError } = await supabase
        .from('task_assignees')
        .insert({
          task_id: ticket.id,
          user_id: userId,
          assigned_at: new Date().toISOString()
        });
      
      if (addError) throw addError;
      
      // Close the assignee search
      setShowAssigneeSearch(false);
      setAssigneeSearchTerm('');
      
      // Notify parent component of the assignee change
      if (onAssigneeChange) {
        onAssigneeChange(ticket.id, userId);
      }
      
      // Fetch updated assignee information
      fetchAssigneeInfo();
      
    } catch (err) {
      console.error('Error changing assignee:', err);
    } finally {
      setIsChangingAssignee(false);
    }
  };

  // Handle changing the ticket vendor
  const handleChangeVendor = async (vendorId: string) => {
    if (!ticket || isChangingVendor) return;
    
    try {
      setIsChangingVendor(true);
      
      // Update the ticket vendor
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({
          vendor_id: vendorId,
          updated_at: now
        })
        .eq('id', ticket.id);
      
      if (error) throw error;
      
      // Find the selected vendor from available vendors
      const selectedVendor = availableVendors.find(v => v.id === vendorId);
      
      // Update local state
      if (selectedVendor) {
        setVendor(selectedVendor);
      }
      
      // Close the vendor search
      setShowVendorSearch(false);
      setVendorSearchTerm('');
      
    } catch (err) {
      console.error('Error changing vendor:', err);
    } finally {
      setIsChangingVendor(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket || isUpdatingPriority || newPriority === currentPriority) return;
    
    try {
      setIsUpdatingPriority(true);
      
      // Update ticket priority in database
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({ 
          priority: newPriority,
          updated_at: now
        })
        .eq('id', ticket.id);
      
      if (error) throw error;
      
      // Update local state
      setCurrentPriority(newPriority);
      
      // Close the dropdown
      setShowPriorityDropdown(false);
      
      // Notify parent component of the priority change
      if (onPriorityChange) {
        onPriorityChange(ticket.id, newPriority);
      }
      
    } catch (err) {
      console.error('Error updating ticket priority:', err);
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || isUpdatingStatus || newStatus === currentStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // Update ticket status in database
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: now
        })
        .eq('id', ticket.id);
      
      if (error) throw error;
      
      // Update local state
      setCurrentStatus(newStatus);
      
      // Close the dropdown
      setShowStatusDropdown(false);
      
      // Notify parent component of the status change
      if (onStatusChange) {
        onStatusChange(ticket.id, newStatus);
      }
      
      // Optionally call the onMarkComplete callback if status is completed
      if (newStatus === 'completed' && onMarkComplete) {
        onMarkComplete(ticket.id);
      }
      
    } catch (err) {
      console.error('Error updating ticket status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter available users based on search term
  const filteredUsers = availableUsers.filter(user => {
    if (!assigneeSearchTerm) return true;
    
    const searchTermLower = assigneeSearchTerm.toLowerCase();
    const displayNameLower = user.display_name.toLowerCase();
    
    return displayNameLower.includes(searchTermLower);
  });

  // Filter available vendors based on search term
  const filteredVendors = availableVendors.filter(vendor => {
    if (!vendorSearchTerm) return true;
    
    const searchTermLower = vendorSearchTerm.toLowerCase();
    const vendorNameLower = vendor.vendor_name?.toLowerCase() || '';
    const serviceTypeLower = vendor.service_type?.toLowerCase() || '';
    const businessTypeLower = vendor.business_type?.toLowerCase() || '';
    
    return (
      vendorNameLower.includes(searchTermLower) ||
      serviceTypeLower.includes(searchTermLower) ||
      businessTypeLower.includes(searchTermLower)
    );
  });

  // Get status button color based on current status
  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'new':
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case 'inprogress':
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case 'paused':
        return "bg-gray-400 hover:bg-gray-500 text-white";
      case 'completed':
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  // Get priority display class
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-50 text-red-700";
      case 'medium':
        return "bg-yellow-50 text-yellow-700";
      case 'low':
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // Get priority style classes
  const getPriorityButtonStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (!ticket) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 overflow-hidden z-50"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Dialog.Overlay className="absolute inset-0 bg-black bg-opacity-40 transition-opacity" />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div></div>
                  <button
                    className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {/* Ticket Info */}
                <div className="px-6 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#2C3539]">{ticket.title}</h3>
                    
                    {/* Status Dropdown Button */}
                    <div className="relative" ref={statusDropdownRef}>
                      <button
                        className={clsx(
                          "flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          getStatusButtonStyle(currentStatus)
                        )}
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></span>
                        ) : (
                          <span className="flex items-center">
                            {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || 'Unknown'}
                            <ChevronDown className="w-4 h-4 ml-1.5" />
                          </span>
                        )}
                      </button>
                      
                      {showStatusDropdown && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <div className="py-1">
                            {STATUS_OPTIONS.map(status => (
                              <button
                                key={status.value}
                                className={clsx(
                                  "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                                  currentStatus === status.value ? "font-medium bg-gray-50" : ""
                                )}
                                onClick={() => handleStatusChange(status.value)}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Always show the assignee section */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-[#2C3539]">
                          {assignees.length > 1 ? 'Assignees' : 'Assignee'}
                        </p>
                        <button 
                          className="p-1 rounded text-[#2C3539] hover:bg-gray-100 transition-colors"
                          onClick={() => setShowAssigneeSearch(!showAssigneeSearch)}
                        >
                          {assignees.length === 0 ? (
                            <Plus className="w-4 h-4" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Assignee Search Dropdown */}
                      {showAssigneeSearch && (
                        <div className="relative mb-4" ref={assigneeSearchRef}>
                          <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="p-3 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  type="text"
                                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                                  placeholder="Search users..."
                                  value={assigneeSearchTerm}
                                  onChange={(e) => setAssigneeSearchTerm(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto">
                              {loadingUsers ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-[#2C3539] rounded-full animate-spin mr-2"></div>
                                  Loading users...
                                </div>
                              ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                  <div 
                                    key={user.id} 
                                    className={clsx(
                                      "p-2 hover:bg-gray-50 cursor-pointer",
                                      isChangingAssignee ? "opacity-50 pointer-events-none" : ""
                                    )}
                                    onClick={() => handleChangeAssignee(user.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {user.profile_image_url ? (
                                          <img 
                                            src={user.profile_image_url} 
                                            alt={user.display_name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <User className="w-4 h-4 text-[#6B7280]" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-[#2C3539]">{user.display_name}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  No users found
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {loadingAssignees ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-[#2C3539] rounded-full animate-spin"></div>
                          </div>
                          <p className="text-sm text-[#6B7280]">Loading...</p>
                        </div>
                      ) : assignees.length > 0 ? (
                        <div className="space-y-3">
                          {assignees.map((assignee) => (
                            <div key={assignee.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {assignee.profile_image_url ? (
                                    <img 
                                      src={assignee.profile_image_url} 
                                      alt={`${assignee.first_name} ${assignee.last_name}`} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = '';
                                        e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-[#6B7280]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                      }}
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-[#6B7280]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-[#2C3539] font-medium">
                                    {assignee.display_name}
                                  </p>
                                  <p className="text-xs text-[#6B7280]">Assigned</p>
                                </div>
                              </div>
                              <button 
                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowAssigneeSearch(true)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-[#6B7280]" />
                            </div>
                            <p className="text-sm text-[#6B7280]">Unassigned</p>
                          </div>
                          <button 
                            className="p-1 rounded text-gray-400 hover:text-[#2C3539] hover:bg-gray-100 transition-colors"
                            onClick={() => setShowAssigneeSearch(true)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#2C3539] mb-1">Ticket ID</p>
                        <div className="flex items-center text-sm text-[#6B7280]">
                          <Hash className="w-4 h-4 mr-1 text-[#6B7280]" />
                          <span>{ticket.id.substring(0, 8)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-[#2C3539] mb-1">Priority</p>
                        <div className="flex items-center relative">
                          <button
                            className={clsx(
                              "px-2 py-1 text-xs font-medium rounded-full flex items-center",
                              getPriorityButtonStyle(currentPriority)
                            )}
                            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                            disabled={isUpdatingPriority}
                          >
                            {isUpdatingPriority ? (
                              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
                            ) : (
                              <>
                                {currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1)}
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </button>
                          
                          {/* Priority dropdown */}
                          {showPriorityDropdown && (
                            <div ref={priorityDropdownRef} className="absolute top-full mt-1 right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                              <div className="py-1">
                                {PRIORITY_OPTIONS.map(priority => (
                                  <button
                                    key={priority.value}
                                    className={clsx(
                                      "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100",
                                      currentPriority === priority.value ? "font-medium bg-gray-50" : ""
                                    )}
                                    onClick={() => handlePriorityChange(priority.value)}
                                  >
                                    {priority.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#2C3539] mb-1">Created On</p>
                        <div className="flex items-center text-sm text-[#6B7280]">
                          <Calendar className="w-4 h-4 mr-1 text-[#6B7280]" />
                          <span>{format(new Date(ticket.openDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      
                      {ticket.scheduledDate && (
                        <div>
                          <p className="text-sm font-medium text-[#2C3539] mb-1">Scheduled Date</p>
                          <div className="flex items-center text-sm text-[#6B7280]">
                            <Clock className="w-4 h-4 mr-1 text-[#6B7280]" />
                            <span>{format(new Date(ticket.scheduledDate), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vendor Details Section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-[#2C3539]">Vendor Details</p>
                      {!loadingVendor && (
                        <button 
                          className="p-1 rounded text-[#2C3539] hover:bg-gray-100 transition-colors"
                          onClick={() => setShowVendorSearch(!showVendorSearch)}
                        >
                          {!vendor ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    
                    {/* Vendor Search Dropdown */}
                    {showVendorSearch && (
                      <div className="relative mb-4" ref={vendorSearchRef}>
                        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                                placeholder="Search vendors..."
                                value={vendorSearchTerm}
                                onChange={(e) => setVendorSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto">
                            {loadingVendors ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-[#2C3539] rounded-full animate-spin mr-2"></div>
                                Loading vendors...
                              </div>
                            ) : filteredVendors.length > 0 ? (
                              filteredVendors.map(vendor => (
                                <div 
                                  key={vendor.id} 
                                  className={clsx(
                                    "p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                                    isChangingVendor ? "opacity-50 pointer-events-none" : ""
                                  )}
                                  onClick={() => handleChangeVendor(vendor.id)}
                                >
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-[#2C3539]">{vendor.vendor_name}</p>
                                    <div className="flex items-center text-xs text-[#6B7280] mt-1">
                                      <span className="capitalize">{vendor.service_type}</span>
                                      <span className="mx-1">•</span>
                                      <span>${vendor.hourly_rate}/hr</span>
                                      {vendor.emergency_service && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <span className="text-green-600">24/7 Emergency</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                No vendors found
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {loadingVendor ? (
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-center">
                        <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-[#2C3539] rounded-full animate-spin mr-2"></div>
                        <p className="text-sm text-[#6B7280]">Loading vendor details...</p>
                      </div>
                    ) : vendor ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-3">
                          <p className="text-sm font-medium text-[#2C3539]">{vendor.vendor_name}</p>
                        </div>
                        
                        <div className="text-sm text-[#6B7280]">
                          {vendor.contact_person_name && (
                            <div className="flex items-center mb-2">
                              <User className="w-4 h-4 text-[#6B7280] mr-2" />
                              <p className="text-sm text-[#2C3539]">{vendor.contact_person_name}</p>
                            </div>
                          )}
                          
                          {vendor.contact_person_email && (
                            <div className="flex items-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-[#6B7280] mr-2">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                              <a href={`mailto:${vendor.contact_person_email}`} className="text-sm text-blue-600 hover:underline">
                                {vendor.contact_person_email}
                              </a>
                            </div>
                          )}
                          
                          {vendor.contact_person_phone && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-[#6B7280] mr-2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              <a href={`tel:${vendor.contact_person_phone}`} className="text-sm text-blue-600 hover:underline">
                                {vendor.contact_person_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-[#6B7280]">No vendor assigned</p>
                        <button 
                          className="ml-2 p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          onClick={() => setShowVendorSearch(true)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-[#2C3539] mb-2">Description</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-[#2C3539] whitespace-pre-wrap">{ticket.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}