import React from 'react';
import clsx from 'clsx';

interface TimeRangeSelectorProps {
  ranges: string[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

export default function TimeRangeSelector({
  ranges,
  selectedRange,
  onRangeChange
}: TimeRangeSelectorProps) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onRangeChange(range)}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            selectedRange === range
              ? 'bg-white text-[#2C3539] shadow-sm'
              : 'text-[#6B7280] hover:text-[#2C3539]'
          )}
        >
          {range}
        </button>
      ))}
    </div>
  );
}