import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Plus, User, Building2 } from 'lucide-react';

interface CreateAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const mockProperties = [
  { id: 'P1', name: 'Sunset Apartments', activeLeases: 24 },
  { id: 'P2', name: 'Harbor View Complex', activeLeases: 18 },
  { id: 'P3', name: 'Green Valley Residences', activeLeases: 32 }
];

const mockTenants = [
  { id: 'T1', name: 'John Smith', email: 'john@example.com' },
  { id: 'T2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'T3', name: 'Michael Chen', email: 'michael@example.com' }
];

export default function CreateAnnouncementDialog({
  isOpen,
  onClose,
  onSubmit
}: CreateAnnouncementDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    properties: [] as string[],
    tenants: [] as string[],
    methods: [] as string[],
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: ''
  });
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      content: '',
      properties: [],
      tenants: [],
      methods: [],
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: ''
    });
  };

  const toggleProperty = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.includes(propertyId)
        ? prev.properties.filter(id => id !== propertyId)
        : [...prev.properties, propertyId]
    }));
  };

  const toggleTenant = (tenantId: string) => {
    setFormData(prev => ({
      ...prev,
      tenants: prev.tenants.includes(tenantId)
        ? prev.tenants.filter(id => id !== tenantId)
        : [...prev.tenants, tenantId]
    }));
  };

  const toggleMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(tenantSearchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-[#2C3539]">
              Create New Announcement
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] min-h-[120px]"
                placeholder="Enter announcement content"
                required
              />
            </div>

            {/* Properties */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Select Properties
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPropertySearch(true)}
                  className="flex items-center w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Properties
                </button>

                {showPropertySearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={propertySearchQuery}
                          onChange={(e) => setPropertySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                          placeholder="Search properties..."
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {mockProperties
                        .filter(property =>
                          property.name.toLowerCase().includes(propertySearchQuery.toLowerCase())
                        )
                        .map((property) => (
                          <div
                            key={property.id}
                            onClick={() => toggleProperty(property.id)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-[#2C3539]">{property.name}</p>
                                <p className="text-xs text-[#6B7280]">{property.activeLeases} active leases</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.properties.includes(property.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-[#2C3539] rounded border-gray-300"
                            />
                          </div>
                        ))}
                    </div>
                    <div className="p-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowPropertySearch(false)}
                        className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {formData.properties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.properties.map((propertyId) => {
                    const property = mockProperties.find(p => p.id === propertyId);
                    return property ? (
                      <span
                        key={property.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-[#2C3539]"
                      >
                        {property.name}
                        <button
                          type="button"
                          onClick={() => toggleProperty(property.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Contacts */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Select Specific Contacts
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTenantSearch(true)}
                  className="flex items-center w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contacts
                </button>

                {showTenantSearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={tenantSearchQuery}
                          onChange={(e) => setTenantSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                          placeholder="Search contacts..."
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredTenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          onClick={() => toggleTenant(tenant.id)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-[#2C3539]">{tenant.name}</p>
                              <p className="text-xs text-[#6B7280]">{tenant.email}</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.tenants.includes(tenant.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-[#2C3539] rounded border-gray-300"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowTenantSearch(false)}
                        className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {formData.tenants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tenants.map((tenantId) => {
                    const tenant = mockTenants.find(t => t.id === tenantId);
                    return tenant ? (
                      <span
                        key={tenant.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-[#2C3539]"
                      >
                        {tenant.name}
                        <button
                          type="button"
                          onClick={() => toggleTenant(tenant.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Communication Methods */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Communication Methods
              </label>
              <div className="space-y-3">
                {['email', 'sms', 'in-app'].map((method) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm text-[#2C3539] capitalize">{method}</span>
                    <button
                      type="button"
                      onClick={() => toggleMethod(method)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        formData.methods.includes(method) ? 'bg-[#2C3539]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform ${
                          formData.methods.includes(method) ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Announcement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[#6B7280]">
                  Schedule the Announcement?
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isScheduled: !prev.isScheduled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.isScheduled ? 'bg-[#2C3539]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.isScheduled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {formData.isScheduled && (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#6B7280] hover:text-[#2C3539]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
              >
                Create Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}