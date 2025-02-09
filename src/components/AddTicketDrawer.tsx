import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, AlertCircle, Calendar, User, Search } from 'lucide-react';
import { Ticket } from '../types/maintenance';
import { format } from 'date-fns';

// Mock vendors for demonstration
const mockVendors = [
  { id: '1', name: 'ABC Plumbing Services', specialty: 'Plumbing' },
  { id: '2', name: 'XYZ Electrical Repairs', specialty: 'Electrical' },
  { id: '3', name: 'Quick Fix HVAC', specialty: 'HVAC' },
];

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
    status: 'new' as Ticket['status'],
    scheduledDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    vendorId: '',
  });

  const [vendorSearch, setVendorSearch] = useState('');

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
      status: 'new',
      scheduledDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      vendorId: '',
    });
    onClose();
  };

  const filteredVendors = mockVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    vendor.specialty.toLowerCase().includes(vendorSearch.toLowerCase())
  );

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
                  {/* Note */}
                  <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      New tickets will automatically be assigned a status of "New" and the current date.
                    </p>
                  </div>

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
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))}
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
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
                      Schedule <span className="text-red-500">*</span>
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

                  {/* Assign Vendor */}
                  <div>
                    <label htmlFor="vendorSearch" className="block text-sm font-medium text-[#2C3539] mb-1">
                      Assign Vendor
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="text"
                        id="vendorSearch"
                        placeholder="Search vendors"
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-[#2C3539] placeholder-[#6B7280]"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>

                    {(vendorSearch || formData.vendorId) && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredVendors.map((vendor) => (
                          <div 
                            key={vendor.id} 
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${formData.vendorId === vendor.id ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, vendorId: vendor.id }));
                              setVendorSearch(vendor.name);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-[#2C3539]">{vendor.name}</p>
                                <p className="text-xs text-[#6B7280]">{vendor.specialty}</p>
                              </div>
                              {formData.vendorId === vendor.id && (
                                <User className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.vendorId && (
                      <div className="mt-2 text-sm text-[#2C3539]">
                        Selected Vendor: {mockVendors.find(v => v.id === formData.vendorId)?.name}
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