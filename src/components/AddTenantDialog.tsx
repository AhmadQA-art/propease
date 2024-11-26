import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Plus, User } from 'lucide-react';
import { Tenant } from '../types/tenant.ts';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Tenant) => void;
  existingTenants: Tenant[];
  onSelectExisting: (tenant: Tenant) => void;
}

export default function AddTenantDialog({
  isOpen,
  onClose,
  onAddTenant,
  existingTenants,
  onSelectExisting
}: AddTenantDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const filteredTenants = existingTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTenant({
      ...newTenant,
      id: `T${Date.now()}`
    });
    setNewTenant({ name: '', email: '', phone: '' });
    setShowAddForm(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-[#2C3539]">
              {showAddForm ? 'Add New Tenant' : 'Select Tenant'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showAddForm && (
            <>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4 max-h-60 overflow-y-auto">
                {filteredTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => onSelectExisting(tenant)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-[#2C3539]">{tenant.name}</p>
                      <p className="text-xs text-gray-500">{tenant.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#2C3539] rounded-lg hover:bg-[#3d474c]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Tenant
              </button>
            </>
          )}

          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-[#2C3539] hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2C3539] rounded-lg hover:bg-[#3d474c]"
                >
                  Add Tenant
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  );
}