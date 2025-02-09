import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Building2, Briefcase } from 'lucide-react';
import { PersonType } from '../../types/people';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
}

interface FormData {
  name: string;
  email: string;
  role: string;
  jobTitle: string;
}

export default function AddPersonDialog({ isOpen, onClose, personType }: AddPersonDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '',
    jobTitle: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  const getDialogTitle = () => {
    switch (personType) {
      case 'team':
        return 'Add Team Member';
      case 'tenant':
        return 'Add Tenant';
      case 'vendor':
        return 'Add Vendor';
      default:
        return 'Add Person';
    }
  };

  const getDialogIcon = () => {
    switch (personType) {
      case 'team':
        return User;
      case 'tenant':
        return Building2;
      case 'vendor':
        return Briefcase;
      default:
        return User;
    }
  };

  const DialogIcon = getDialogIcon();

  if (!personType) return null;

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
                <DialogIcon className="w-5 h-5 text-[#2C3539]" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-[#2C3539]">
                {getDialogTitle()}
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter full name"
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
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Role
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="">Select role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Property Manager</option>
                <option value="maintenance">Maintenance Staff</option>
                <option value="leasing">Leasing Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Job Title
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter job title"
              />
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
                {personType === 'team' ? 'Send Invitation' : 'Add Person'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}