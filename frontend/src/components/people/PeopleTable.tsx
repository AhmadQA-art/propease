import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Person } from '../../types/people';

export interface Column {
  key: string;
  label: string;
  render?: (row: Person) => React.ReactNode;
  skipDefaultRenderer?: boolean;
  width?: string;
}

export interface PeopleTableProps {
  data: Person[];
  columns: Column[];
  onSort?: (key: string) => void;
  onSelect?: (ids: string[]) => void;
  loading?: boolean;
  selectedIds?: string[];
  onAction?: (action: string, person: Person) => void;
  onRowClick?: (person: Person) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const PeopleTable: React.FC<PeopleTableProps> = ({
  data,
  columns,
  onSort,
  onSelect,
  loading = false,
  selectedIds = [],
  onAction,
  onRowClick,
  // Pagination props with defaults
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {}
}) => {
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Toggle action menu for a row
  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  // Handle action click
  const handleActionClick = (e: React.MouseEvent, action: string, person: Person) => {
    e.stopPropagation();
    setActiveActionMenu(null);
    onAction?.(action, person);
  };

  // Default cell renderer for the name column
  const renderNameCell = (row: Person) => (
    <div className="flex items-center">
      <div className="h-10 w-10 flex-shrink-0">
        {row.imageUrl ? (
          <img
            className="h-10 w-10 rounded-full"
            src={row.imageUrl}
            alt={row.name}
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#2C3539] bg-opacity-10 flex items-center justify-center">
            <span className="text-[#2C3539] font-medium text-sm">
              {getInitials(row.name)}
            </span>
          </div>
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{row.name}</div>
        <div className="text-sm text-gray-500">{row.email}</div>
      </div>
    </div>
  );

  // Default cell renderer for the status column
  const renderStatusCell = (row: Person) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      row.status === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {row.status}
    </span>
  );

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Complex logic for when we have many pages
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.width ? { width: column.width } : {}}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort?.(column.key)}
              >
                {column.label}
              </th>
            ))}
            <th className="relative px-6 py-3 w-10">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={row.id} 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    style={column.width ? { width: column.width } : {}}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    <div className="truncate">
                      {column.render ? (
                        column.render(row)
                      ) : column.key === 'name' && !column.skipDefaultRenderer ? (
                        renderNameCell(row)
                      ) : column.key === 'status' ? (
                        renderStatusCell(row)
                      ) : (
                        <div className="text-sm text-gray-900 truncate">{row[column.key as keyof Person]}</div>
                      )}
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => toggleActionMenu(e, row.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeActionMenu === row.id && (
                    <div className="absolute right-6 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {row.type === 'tenant' && (
                          <button
                            onClick={(e) => handleActionClick(e, 'view', row)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            role="menuitem"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        )}
                        <button
                          onClick={(e) => handleActionClick(e, 'edit', row)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          role="menuitem"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleActionClick(e, 'delete', row)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          role="menuitem"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination UI */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between sm:hidden w-full">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{data.length > 0 ? ((currentPage - 1) * 10) + 1 : 0}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, ((currentPage - 1) * 10) + data.length)}</span> of{' '}
              <span className="font-medium">{totalPages <= 1 ? data.length : totalPages * 10}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-[#2C3539] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleTable; 