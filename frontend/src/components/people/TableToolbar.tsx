import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onAdd: () => void;
  addButtonText?: string;
  selectedIds?: string[];
  onBulkDelete?: () => void;
  onExport?: () => void;
  customAddButton?: React.ReactNode;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onFilter,
  onAdd,
  addButtonText = 'Add New',
  selectedIds = [],
  onBulkDelete,
  onExport,
  customAddButton
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-4">
      {/* Search */}
      <div className="flex-grow relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Filter Button */}
      <button 
        onClick={onFilter}
        className="h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-5 h-5 text-[#2C3539]" />
      </button>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          {onBulkDelete && (
            <button 
              onClick={onBulkDelete}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Selected
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 text-sm text-[#2C3539] hover:text-[#3d474c] font-medium"
            >
              Export Selected
            </button>
          )}
        </div>
      )}

      {/* Add Button */}
      <div className="flex-shrink-0">
        {customAddButton ? (
          customAddButton
        ) : (
          <button 
            onClick={onAdd}
            className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default TableToolbar; 