import React, { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import type { Person } from '../../types/people';

export interface Column {
  key: string;
  label: string;
  render?: (row: Person) => React.ReactNode;
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
}

const PeopleTable: React.FC<PeopleTableProps> = ({
  data,
  columns,
  onSort,
  onSelect,
  loading = false,
  selectedIds = [],
  onAction,
  onRowClick
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort?.(column.key)}
              >
                {column.label}
              </th>
            ))}
            <th className="relative px-6 py-3">
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
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.key === 'name' ? renderNameCell(row) :
                     column.key === 'status' ? renderStatusCell(row) :
                     column.render ? column.render(row) :
                     <div className="text-sm text-gray-900">{row[column.key as keyof Person]}</div>
                    }
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
    </div>
  );
};

export default PeopleTable; 