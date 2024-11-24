import React, { useState } from 'react';
import { Eye, Edit2, CheckCircle, Plus } from 'lucide-react';
import TicketDrawer from '../components/TicketDrawer';
import AddTicketDrawer from '../components/AddTicketDrawer';
import { Ticket } from '../types/maintenance';

const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Broken AC Unit',
    description: 'AC unit in apartment 204 is not cooling properly and making strange noises.',
    openDate: '2024-03-15',
    priority: 'high',
    status: 'new'
  },
  {
    id: 'TKT-002',
    title: 'Leaking Faucet',
    description: 'Kitchen faucet in unit 512 has been continuously dripping for the past two days.',
    openDate: '2024-03-14',
    priority: 'normal',
    status: 'in-progress'
  },
  {
    id: 'TKT-003',
    title: 'Light Bulb Replacement',
    description: 'Common area hallway on floor 3 needs two light bulbs replaced.',
    openDate: '2024-03-13',
    priority: 'low',
    status: 'resolved'
  }
];

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
    case 'in-progress':
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

  const openViewDrawer = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDrawerOpen(true);
  };

  const handleAddTicket = (newTicket: Omit<Ticket, 'id'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`
    };
    setTickets(prev => [ticket, ...prev]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Maintenance Tickets</h1>
          <p className="text-[#6B7280] mt-1">Manage and track maintenance requests</p>
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          onClick={() => setIsAddDrawerOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#2C3539]">{ticket.title}</h3>
                  <span className="text-sm text-[#6B7280]">#{ticket.id}</span>
                </div>
                <p className="text-[#6B7280] mb-4">{ticket.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">
                Opened on {new Date(ticket.openDate).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-[#6B7280] hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => openViewDrawer(ticket)}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-[#6B7280] hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-[#6B7280] hover:bg-gray-50 rounded-lg transition-colors">
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TicketDrawer
        ticket={selectedTicket}
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
      />

      <AddTicketDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSubmit={handleAddTicket}
      />
    </div>
  );
}