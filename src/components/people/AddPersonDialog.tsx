import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Building2, Briefcase, Mail, Phone, Calendar, DollarSign, Star } from 'lucide-react';
import { PersonType } from '../../types/people';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personType: PersonType | null;
}

interface BaseFormData {
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
}

interface TeamMemberFormData extends BaseFormData {
  role: string;
  department: string;
}

interface TenantFormData extends BaseFormData {
  unit: string;
  property: string;
  leaseStart: string;
  leaseEnd: string;
}

interface VendorFormData extends BaseFormData {
  company: string;
  service: string;
  rating: number;
}

type FormData = TeamMemberFormData | TenantFormData | VendorFormData;

const departments = ['Operations', 'Maintenance', 'Leasing', 'Finance', 'Management'];
const properties = ['Sunset Apartments', 'Harbor View Complex', 'Downtown Business Center'];
const services = ['General Maintenance', 'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Cleaning'];

export default function AddPersonDialog({ isOpen, onClose, personType }: AddPersonDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    // Team Member specific
    role: '',
    department: '',
    // Tenant specific
    unit: '',
    property: '',
    leaseStart: '',
    leaseEnd: '',
    // Vendor specific
    company: '',
    service: '',
    rating: 5,
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

  const renderTypeSpecificFields = () => {
    switch (personType) {
      case 'team':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Role</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Department</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as TeamMemberFormData).department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'tenant':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Property</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as TenantFormData).property}
                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                required
              >
                <option value="">Select Property</option>
                {properties.map((prop) => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Unit</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as TenantFormData).unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">Lease Start</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={(formData as TenantFormData).leaseStart}
                  onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">Lease End</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={(formData as TenantFormData).leaseEnd}
                  onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                  required
                />
              </div>
            </div>
          </>
        );

      case 'vendor':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Company</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as VendorFormData).company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Service Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as VendorFormData).service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Initial Rating</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={(formData as VendorFormData).rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

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
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            <div className="space-y-4">
              {renderTypeSpecificFields()}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#6B7280] hover:text-[#2C3539] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
              >
                Add {personType === 'team' ? 'Member' : personType}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}