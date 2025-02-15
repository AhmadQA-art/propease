import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Building2 } from 'lucide-react';

interface AddVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VendorFormData {
  vendorName: string;
  vendorType: string;
  contactPersonName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
}

const vendorTypes = [
  'General Maintenance',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Landscaping',
  'Cleaning',
  'Security',
  'Pest Control',
  'Other'
];

export default function AddVendorDialog({ isOpen, onClose }: AddVendorDialogProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    vendorName: '',
    vendorType: '',
    contactPersonName: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Vendor form submitted:', formData);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center mr-3">
                <Building2 className="w-5 h-5 text-[#2C3539]" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-[#2C3539]">
                Add New Vendor
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter vendor company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Vendor Type
              </label>
              <select
                required
                value={formData.vendorType}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="">Select vendor type</option>
                {vendorTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={formData.contactPersonName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter contact phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Status
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VendorFormData['status'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#2C3539]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm font-medium"
              >
                Add Vendor
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
