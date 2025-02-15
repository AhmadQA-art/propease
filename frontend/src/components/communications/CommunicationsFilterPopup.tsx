import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CommunicationsFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (startDate: Date | null, endDate: Date | null) => void;
}

export default function CommunicationsFilterPopup({ 
  isOpen, 
  onClose, 
  onApplyFilter 
}: CommunicationsFilterPopupProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleApplyFilter = () => {
    onApplyFilter(startDate, endDate);
    onClose();
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    onApplyFilter(null, null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#2C3539]">
            Filter Communications
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear Filter
          </button>
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
