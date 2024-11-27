import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

// Mock resident data - replace with actual data
const mockResidents = [
  { id: '1', name: 'John Smith', email: 'john@example.com' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com' },
];

interface Resident {
  id: string;
  name: string;
  email: string;
}

interface AddUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (unitData: {
    name: string;
    rentAmount: number;
    resident?: Resident;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export default function AddUnitForm({ isOpen, onClose, onSubmit }: AddUnitFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    rentAmount: 0,
    startDate: '',
    endDate: '',
  });

  const [showResidentSearch, setShowResidentSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const filteredResidents = mockResidents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      rentAmount: formData.rentAmount,
      ...(selectedResident && {
        resident: selectedResident,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })
    });
    onClose();
  };

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setShowResidentSearch(false);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Add New Unit</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Form - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Unit Name */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Unit Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter unit name"
            />
          </div>

          {/* Monthly Rent */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Monthly Rent *</label>
            <input
              type="number"
              required
              value={formData.rentAmount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter monthly rent"
              min="0"
            />
          </div>

          {/* Resident Section */}
          <div className="space-y-4">
            {!selectedResident ? (
              <button
                type="button"
                onClick={() => setShowResidentSearch(true)}
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Resident
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2C3539]">{selectedResident.name}</p>
                    <p className="text-sm text-gray-500">{selectedResident.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedResident(null)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Lease Dates */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#6B7280]">Lease Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[#6B7280]">Lease End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      min={formData.startDate}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resident Search Dropdown */}
            {showResidentSearch && (
              <div className="relative border rounded-lg shadow-lg">
                <div className="flex items-center p-2 border-b">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-sm"
                    placeholder="Search residents..."
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredResidents.map(resident => (
                    <button
                      key={resident.id}
                      type="button"
                      onClick={() => handleResidentSelect(resident)}
                      className="w-full p-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-[#2C3539]">{resident.name}</p>
                      <p className="text-sm text-gray-500">{resident.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            Add Unit
          </button>
        </form>
      </div>
    </div>
  );
}
