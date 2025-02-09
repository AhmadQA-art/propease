import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import TicketDrawer from '../components/TicketDrawer';
import AddTicketDrawer from '../components/AddTicketDrawer';
import { Ticket } from '../types/maintenance';
import { mockTickets, mockVendors } from '../mocks/tickets';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'normal':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-purple-100 text-purple-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Maintenance() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openViewDrawer = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDrawerOpen(true);
  };

  const handleAddTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: tickets.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTickets(prev => [ticket, ...prev]);
  };

  const handleMarkComplete = (ticketId: number) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'resolved', updatedAt: new Date().toISOString() } 
          : ticket
      )
    );
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Search tickets by title, description, or ticket ID" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            // TODO: Implement filter functionality
          >
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openViewDrawer(ticket)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[#2C3539]">{ticket.title}</h3>
                  <span className="text-xs text-[#6B7280]">#{ticket.id}</span>
                </div>
                <p className="text-xs text-[#6B7280] line-clamp-1 mb-1">{ticket.description}</p>
                {ticket.scheduledDate && (
                  <div className="text-xs text-[#6B7280]">
                    <span className="mr-1">Scheduled Date:</span>
                    {new Date(ticket.scheduledDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TicketDrawer
        ticket={selectedTicket}
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        onMarkComplete={handleMarkComplete}
      />

      <AddTicketDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAddTicket={handleAddTicket}
      />
    </div>
  );
}