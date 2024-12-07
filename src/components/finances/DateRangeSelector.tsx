import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  selected: string;
  onChange: (range: string) => void;
}

export default function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
      <div className="px-3 py-2 border-r border-gray-200">
        <Calendar className="w-5 h-5 text-[#6B7280]" />
      </div>
      <select
        className="px-3 py-2 bg-transparent border-none focus:outline-none text-[#2C3539]"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="yearly">Yearly</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
  );
}