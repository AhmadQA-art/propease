import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle, Calendar, User, Search, Building } from 'lucide-react';
import { Ticket } from '../types/maintenance';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';

interface Assignee {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role?: string;
}

interface Vendor {
  id: string;
  vendor_name: string;
  service_type: string;
  contact_person_name?: string;
}

interface AddTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket?: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => void;
}

const initialFormData = {
  title: '',
  description: '',
  priority: 'medium' as const,
  status: 'new' as const,
  openDate: new Date().toISOString(),
  scheduledDate: '',
  assigneeId: '',
  vendor_id: ''
};

export default function AddTicketDrawer({ isOpen, onClose, onAddTicket }: AddTicketDrawerProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Vendor state
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Fetch assignees from Supabase
  useEffect(() => {
    const fetchAssignees = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        // Query team_members table to get valid assignees
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            user_profiles (
              id, 
              first_name, 
              last_name, 
              email
            )
          `);
        
        if (teamMembersError) throw teamMembersError;
        
        // Format assignees for display
        const formattedAssignees: Assignee[] = teamMembersData
          .map(member => {
            const user = member.user_profiles;
            if (!user) return null;
            
            const firstName = user.first_name || '';
            const lastName = user.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Using email as fallback when name is empty
            const displayName = fullName || user.email || `User-${user.id.substring(0, 8)}`;
            
            return {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              display_name: displayName,
              role: 'Team Member'
            };
          })
          .filter(Boolean) as Assignee[];
        
        setAssignees(formattedAssignees);
      } catch (err) {
        console.error('Error fetching assignees:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignees();
  }, [isOpen]);
  
  // Fetch vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingVendors(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('id, vendor_name, service_type, contact_person_name')
          .order('vendor_name');
        
        if (error) throw error;
        
        if (data) {
          setVendors(data);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };
    
    fetchVendors();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the ticket data with proper database field mapping
    const ticketData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'new', // Always set status to 'new' for new tickets
      openDate: new Date().toISOString(),
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
      assigneeId: formData.assigneeId || undefined,
      vendor_id: formData.vendor_id || undefined
    };
    
    // Let the parent component handle the actual API call to add the ticket
    onAddTicket && onAddTicket(ticketData);
    
    // Reset form and close drawer
    setFormData(initialFormData);
    setVendorSearch('');
    setAssigneeSearch('');
    setSelectedVendor(null);
    onClose();
  };

  const filteredAssignees = assignees.filter(assignee => {
    const fullName = `${assignee.first_name} ${assignee.last_name}`.toLowerCase();
    return fullName.includes(assigneeSearch.toLowerCase()) ||
      (assignee.role && assignee.role.toLowerCase().includes(assigneeSearch.toLowerCase()));
  });
  
  const filteredVendors = vendors.filter(vendor => {
    if (!vendorSearch) return true;
    
    const vendorNameLower = vendor.vendor_name.toLowerCase();
    const serviceTypeLower = vendor.service_type?.toLowerCase() || '';
    const contactPersonLower = vendor.contact_person_name?.toLowerCase() || '';
    
    const searchTermLower = vendorSearch.toLowerCase();
    
    return (
      vendorNameLower.includes(searchTermLower) ||
      serviceTypeLower.includes(searchTermLower) ||
      contactPersonLower.includes(searchTermLower)
    );
  });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 overflow-hidden z-50"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Dialog.Overlay 
          className="fixed inset-0 bg-black bg-opacity-20 cursor-pointer" 
          onClick={onClose}
        />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white shadow-xl rounded-l-xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-semibold text-[#2C3539]">
                    Create New Ticket
                  </Dialog.Title>
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                <div className="px-6 py-4 space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      placeholder="Enter ticket title"
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] placeholder-[#6B7280]"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      placeholder="Provide details about the maintenance issue"
                      rows={4}
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] placeholder-[#6B7280]"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="priority"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] appearance-none pr-8"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B7280]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Schedule (Due Date) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="datetime-local"
                        id="scheduledDate"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539]"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Assign User */}
                  <div>
                    <label htmlFor="assigneeSearch" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Assign To
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="text"
                        id="assigneeSearch"
                        placeholder="Search users"
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] placeholder-[#6B7280]"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                      />
                    </div>

                    {loading && (
                      <div className="mt-2 p-3 text-center text-sm text-gray-500">
                        Loading users...
                      </div>
                    )}

                    {!loading && (assigneeSearch || formData.assigneeId) && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredAssignees.length > 0 ? (
                          filteredAssignees.map((assignee) => (
                            <div 
                              key={assignee.id} 
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${formData.assigneeId === assignee.id ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, assigneeId: assignee.id }));
                                setAssigneeSearch(`${assignee.first_name} ${assignee.last_name}`);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-[#2C3539]">
                                    {assignee.display_name}
                                  </p>
                                  <p className="text-xs text-[#6B7280]">{assignee.role}</p>
                                </div>
                                {formData.assigneeId === assignee.id && (
                                  <User className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No users found matching "{assigneeSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Vendor Selection (Optional) */}
                  <div>
                    <label htmlFor="vendorSearch" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Vendor (Optional)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="text"
                        id="vendorSearch"
                        placeholder="Search vendors"
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] placeholder-[#6B7280]"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>
                    
                    {loadingVendors && (
                      <div className="mt-2 p-3 text-center text-sm text-gray-500">
                        Loading vendors...
                      </div>
                    )}
                    
                    {/* Selected Vendor Display */}
                    {formData.vendor_id && selectedVendor && !vendorSearch && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-[#2C3539]">{selectedVendor.vendor_name}</p>
                            <p className="text-xs text-[#6B7280] capitalize">{selectedVendor.service_type}</p>
                          </div>
                          <button
                            type="button"
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, vendor_id: '' }));
                              setSelectedVendor(null);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {!loadingVendors && vendorSearch && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <div 
                              key={vendor.id} 
                              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${formData.vendor_id === vendor.id ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, vendor_id: vendor.id }));
                                setSelectedVendor(vendor);
                                setVendorSearch('');
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-[#2C3539]">{vendor.vendor_name}</p>
                                  <p className="text-xs text-[#6B7280] capitalize">{vendor.service_type}</p>
                                </div>
                                {formData.vendor_id === vendor.id && (
                                  <Building className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No vendors found matching "{vendorSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2C3539] text-white rounded-lg text-sm font-medium hover:bg-[#3d474c] transition-colors"
                  >
                    Create Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}