import React, { useState, useEffect, useRef } from 'react';
import { UserRound, Calendar, Search, Plus, Filter, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import TicketDrawer from '../components/TicketDrawer';
import AddTicketDrawer from '../components/AddTicketDrawer';
import { Ticket } from '../types/maintenance';
import { supabase } from '../config/supabase';

// Define priority options based on database constraints
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Define status options based on database constraints
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

// Map status display values to database values
const mapStatusToDisplay = (status: string): string => {
  switch (status) {
    case 'inprogress': return 'In Progress';
    case 'paused': return 'Paused';
    case 'completed': return 'Completed';
    case 'new': return 'New';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Map priority display values
const mapPriorityToDisplay = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-gray-100 text-gray-700';
    case 'inprogress':
      return 'bg-blue-50 text-blue-700';
    case 'paused':
      return 'bg-yellow-50 text-yellow-700';
    case 'completed':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface Assignee {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_image_url: string | null;
}

interface TicketWithAssignees extends Ticket {
  assignees: Assignee[];
}

const AssigneeDisplay = ({ assignees }: { assignees: Assignee[] }) => {
  if (!assignees || assignees.length === 0) {
    return <span className="text-[#6B7280]">Unassigned</span>;
  }
  
  if (assignees.length === 1) {
    return <span>{assignees[0].display_name}</span>;
  }
  
  return <span>{assignees[0].display_name} +{assignees.length - 1}</span>;
};

export default function Maintenance() {
  const [tickets, setTickets] = useState<TicketWithAssignees[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithAssignees | null>(null);
  const [isTicketDrawerOpen, setIsTicketDrawerOpen] = useState<boolean>(false);
  const [isAddTicketDrawerOpen, setIsAddTicketDrawerOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterRef]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('type', 'ticket')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the data into our Ticket interface
        const formattedTickets: TicketWithAssignees[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          priority: item.priority as 'low' | 'medium' | 'high',
          status: item.status as 'new' | 'inprogress' | 'paused' | 'completed',
          openDate: item.created_at,
          scheduledDate: item.due_date,
          assigneeId: '',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          assignees: [],
          vendor_id: item.vendor_id
        }));
        
        setTickets(formattedTickets);
        
        // Fetch assignees for each ticket
        // fetchAssignees(formattedTickets);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetchTicket = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update the selected ticket with fresh data
        const updatedTicket: TicketWithAssignees = {
          id: data.id,
          title: data.title,
          description: data.description,
          priority: data.priority as 'low' | 'medium' | 'high',
          status: data.status as 'new' | 'inprogress' | 'paused' | 'completed',
          openDate: data.created_at,
          scheduledDate: data.due_date,
          assigneeId: selectedTicket?.assigneeId || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          assignees: selectedTicket?.assignees || [],
          vendor_id: data.vendor_id
        };
        
        // Update the ticket in the tickets array
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        
        // Update the selected ticket if it's currently selected
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        
        return updatedTicket;
      }
    } catch (err) {
      console.error('Error refetching ticket:', err);
    }
    
    return null;
  };

  const handleOpenTicket = (ticket: TicketWithAssignees) => {
    setSelectedTicket(ticket);
    setIsTicketDrawerOpen(true);
  };

  const handleAddTicket = async (newTicket: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    try {
      const now = new Date().toISOString();
      
      // Map the Ticket interface to the tasks table schema
      const taskData = {
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        status: newTicket.status,
        due_date: newTicket.scheduledDate || null,
        type: 'ticket', // Set the type to 'ticket'
        created_at: now,
        updated_at: now
      };
      
      // Insert the task
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      const assignees: Assignee[] = [];
      
      // If the task has an assignee, create a record in task_assignees
      if (newTicket.assigneeId) {
        const assigneeData = {
          task_id: data.id,
          user_id: newTicket.assigneeId,
          assigned_at: now
        };
        
        const { error: assigneeError } = await supabase
          .from('task_assignees')
          .insert(assigneeData);
          
        if (assigneeError) {
          console.error('Error assigning task:', assigneeError);
          // Continue even if assignee insertion fails
        } else {
          // Get assignee information
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, profile_image_url')
            .eq('id', newTicket.assigneeId)
            .single();
            
          if (!userError && userData) {
            assignees.push({
              id: userData.id,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              display_name: userData.first_name || userData.last_name || `User-${userData.id.substring(0, 8)}`,
              profile_image_url: userData.profile_image_url
            });
          }
        }
      }
      
      // Format the new ticket and add it to state
      const formattedTicket: TicketWithAssignees = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority as 'low' | 'medium' | 'high',
        status: data.status as 'new' | 'inprogress' | 'paused' | 'completed',
        openDate: data.created_at,
        scheduledDate: data.due_date,
        assigneeId: newTicket.assigneeId || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        assignees
      };
      
      setTickets(prev => [formattedTicket, ...prev]);
    } catch (err) {
      console.error('Error adding ticket:', err);
      alert('Failed to add ticket. Please try again.');
    }
  };

  const handleMarkComplete = async (ticketId: string) => {
    try {
      setLoading(true);
      
      // Update the ticket status to completed
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          updated_at: now
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: 'completed', updatedAt: now } 
            : ticket
        )
      );
      
      // Close the ticket drawer
      setIsTicketDrawerOpen(false);
      setSelectedTicket(null);
      
      // Optionally fetch tickets again to ensure data is fresh
      fetchTickets();
    } catch (err) {
      console.error('Error marking ticket as complete:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      // Fetch the updated ticket to make sure we have the latest data
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      
      // Update the local state with the fresh data
      if (data) {
        // Format the ticket data according to our interface
        const updatedTicket: TicketWithAssignees = {
          id: data.id,
          title: data.title,
          description: data.description,
          priority: data.priority as 'low' | 'medium' | 'high',
          status: data.status as 'new' | 'inprogress' | 'paused' | 'completed',
          openDate: data.created_at,
          scheduledDate: data.due_date,
          assigneeId: selectedTicket?.assigneeId || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          assignees: selectedTicket?.assignees || [],
          vendor_id: data.vendor_id
        };
        
        // Update the tickets array
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
      }
    } catch (err) {
      console.error('Error refreshing ticket after status change:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = async (ticketId: string, assigneeId: string) => {
    try {
      setLoading(true);
      
      // Verify the user is a team member first
      const { data: teamMemberData, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, user_id')
        .eq('user_id', assigneeId)
        .single();
      
      if (teamMemberError) {
        console.error('Error: User is not a team member');
        throw new Error('Selected user is not a team member');
      }
      
      // Fetch the updated ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (ticketError) throw ticketError;
      
      // Fetch the assigned user's profile
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, profile_image_url')
        .eq('id', assigneeId)
        .single();
      
      if (userError) throw userError;
      
      if (ticketData && userData) {
        // Create the updated assignee
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const displayName = fullName || userData.email || `User-${userData.id.substring(0, 8)}`;
        
        const updatedAssignee = {
          id: userData.id,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          profile_image_url: userData.profile_image_url
        };
        
        // Format the ticket data according to our interface
        const updatedTicket: TicketWithAssignees = {
          id: ticketData.id,
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority as 'low' | 'medium' | 'high',
          status: ticketData.status as 'new' | 'inprogress' | 'paused' | 'completed',
          openDate: ticketData.created_at,
          scheduledDate: ticketData.due_date,
          assigneeId: assigneeId,
          createdAt: ticketData.created_at,
          updatedAt: ticketData.updated_at,
          assignees: [updatedAssignee],
          vendor_id: ticketData.vendor_id
        };
        
        // Update the tickets array
        setTickets(prev => prev.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        ));
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
      }
    } catch (err) {
      console.error('Error updating assignee:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (ticketId: string, newPriority: string) => {
    try {
      setLoading(true);
      
      // Update the ticket priority
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({ 
          priority: newPriority,
          updated_at: now
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, priority: newPriority, updatedAt: now } 
            : ticket
        )
      );
      
      // Update the selected ticket
      setSelectedTicket(prev => 
        prev && prev.id === ticketId 
          ? { ...prev, priority: newPriority, updatedAt: now } 
          : prev
      );
    } catch (err) {
      console.error('Error updating priority:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchesSearch = (ticket: TicketWithAssignees, searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Check if title or description matches
    if (
      ticket.title.toLowerCase().includes(lowerSearchTerm) ||
      ticket.description.toLowerCase().includes(lowerSearchTerm)
    ) {
      return true;
    }
    
    // Check if any assignee name matches
    if (ticket.assignees && ticket.assignees.length > 0) {
      return ticket.assignees.some(assignee => 
        assignee.display_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return false;
  };

  // Map priority to numeric value for sorting (high first, medium second, low last)
  const getPriorityValue = (priority: string): number => {
    switch (priority) {
      case 'high': return 0;
      case 'medium': return 1;
      case 'low': return 2;
      default: return 3;
    }
  };

  // Map status to numeric value for sorting (new first, inprogress second, completed third, paused last)
  const getStatusValue = (status: string): number => {
    switch (status) {
      case 'new': return 0;
      case 'inprogress': return 1;
      case 'completed': return 2;
      case 'paused': return 3;
      default: return 4;
    }
  };

  // Apply filters and sort tickets
  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      // Apply status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
        return false;
      }
      
      // Apply search term
      if (searchTerm && !matchesSearch(ticket, searchTerm)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // First sort by status
      const statusComparison = getStatusValue(a.status) - getStatusValue(b.status);
      if (statusComparison !== 0) return statusComparison;
      
      // Then sort by priority
      return getPriorityValue(a.priority) - getPriorityValue(b.priority);
    });

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Maintenance Tickets</h1>
          <p className="text-[#6B7280] mt-1">Manage and track maintenance requests</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex justify-between items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search tickets by title, description, or assignee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative" ref={filterRef}>
            <button 
              className={clsx(
                "p-2.5 border rounded-lg transition-colors flex items-center",
                activeFilterCount > 0 
                  ? "bg-[#2C3539] text-white border-[#2C3539]" 
                  : "border-gray-200 text-[#2C3539] hover:bg-gray-50"
              )}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-white text-[#2C3539] rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-[#2C3539]">Filters</h3>
                    <button 
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reset all
                    </button>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="mb-4">
                    <label htmlFor="status-filter" className="block text-sm font-medium text-[#2C3539] mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Priority Filter */}
                  <div>
                    <label htmlFor="priority-filter" className="block text-sm font-medium text-[#2C3539] mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      >
                        {PRIORITY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {/* Active filters */}
                {activeFilterCount > 0 && (
                  <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                          Status: {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}
                          <button 
                            onClick={() => setStatusFilter('all')}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {priorityFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                          Priority: {PRIORITY_OPTIONS.find(o => o.value === priorityFilter)?.label}
                          <button 
                            onClick={() => setPriorityFilter('all')}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            onClick={() => setIsAddTicketDrawerOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-[#6B7280]">Loading tickets...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchTickets}
            className="mt-2 px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredAndSortedTickets.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-[#6B7280]">No tickets found.</p>
          {searchTerm && (
            <p className="text-[#6B7280] mt-1">Try adjusting your search criteria.</p>
          )}
          {!searchTerm && (
            <button 
              onClick={() => setIsAddTicketDrawerOpen(true)}
              className="mt-4 px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              Create Your First Ticket
            </button>
          )}
        </div>
      )}

      {/* Tickets list */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAndSortedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
            onClick={() => handleOpenTicket(ticket)}
          >
            <div className="mb-3 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-[#2C3539]">{ticket.title}</h3>
                <span
                  className={clsx(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    ticket.priority === 'low' && "bg-blue-50 text-blue-700",
                    ticket.priority === 'medium' && "bg-yellow-50 text-yellow-700",
                    ticket.priority === 'high' && "bg-red-50 text-red-700"
                  )}
                >
                  {mapPriorityToDisplay(ticket.priority)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center text-xs text-[#6B7280]">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {ticket.scheduledDate 
                    ? format(new Date(ticket.scheduledDate), 'MMM d, yyyy')
                    : 'No date'
                  }
                </div>
                <div className="flex items-center text-xs text-[#6B7280]">
                  <UserRound className="w-3.5 h-3.5 mr-1" />
                  <AssigneeDisplay assignees={ticket.assignees} />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={clsx(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  getStatusColor(ticket.status)
                )}
              >
                {mapStatusToDisplay(ticket.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <TicketDrawer
        ticket={selectedTicket}
        isOpen={isTicketDrawerOpen}
        onClose={() => setIsTicketDrawerOpen(false)}
        onMarkComplete={handleMarkComplete}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        onPriorityChange={handlePriorityChange}
      />

      <AddTicketDrawer
        isOpen={isAddTicketDrawerOpen}
        onClose={() => setIsAddTicketDrawerOpen(false)}
        onAddTicket={handleAddTicket}
      />
    </div>
  );
}