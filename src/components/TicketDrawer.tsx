import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Clock, Tag, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Ticket, TicketHistory } from '../types/maintenance';
import clsx from 'clsx';

interface TicketDrawerProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function TicketDrawer({ ticket, isOpen, onClose }: TicketDrawerProps) {
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
                <div className="flex items-start justify-between">
                  <Dialog.Title className="text-lg font-semibold text-[#2C3539]">
                    Ticket Details
                  </Dialog.Title>
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
                  <h3 className="text-xl font-semibold text-[#2C3539] mb-1">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-4">#{ticket.id}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#6B7280] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#2C3539]">Opened</p>
                        <p className="text-sm text-[#6B7280]">
                          {format(new Date(ticket.openDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-[#6B7280] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#2C3539]">Status</p>
                        <div className="flex gap-2 mt-1">
                          <span className={clsx(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            ticket.status === 'new' && 'bg-purple-100 text-purple-800',
                            ticket.status === 'in-progress' && 'bg-yellow-100 text-yellow-800',
                            ticket.status === 'resolved' && 'bg-green-100 text-green-800'
                          )}>
                            {ticket.status.replace('-', ' ')}
                          </span>
                          <span className={clsx(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            ticket.priority === 'high' && 'bg-red-100 text-red-800',
                            ticket.priority === 'normal' && 'bg-blue-100 text-blue-800',
                            ticket.priority === 'low' && 'bg-green-100 text-green-800'
                          )}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[#6B7280] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#2C3539]">Description</p>
                        <p className="text-sm text-[#6B7280] mt-1">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-[#2C3539] mb-4">History</h4>
                  <div className="space-y-4">
                    {mockHistory.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <User className="w-5 h-5 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-sm text-[#2C3539]">
                            <span className="font-medium">{item.user}</span>
                            {' '}{item.description}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-0.5">
                            {format(item.timestamp, 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
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