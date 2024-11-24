import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle } from 'lucide-react';
import { Ticket } from '../types/maintenance';

interface AddTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id'>) => void;
}

export default function AddTicketDrawer({ isOpen, onClose, onSubmit }: AddTicketDrawerProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as Ticket['priority'],
    status: 'new' as Ticket['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      openDate: new Date().toISOString()
    });
    setFormData({
      title: '',
      description: '',
      priority: 'normal',
      status: 'new'
    });
    onClose();
  };

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
            <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white shadow-xl">
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
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[#2C3539]">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3539] focus:ring-[#2C3539] sm:text-sm"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#2C3539]">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3539] focus:ring-[#2C3539] sm:text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-[#2C3539]">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2C3539] focus:ring-[#2C3539] sm:text-sm"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      New tickets will automatically be assigned a status of "New" and the current date.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#2C3539] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539]"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539]"
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