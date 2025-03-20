import React from 'react';
import { MoreVertical } from 'lucide-react';
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
}

const PeopleTable: React.FC<PeopleTableProps> = ({
  data,
  columns,
  onSort,
  onSelect,
  loading = false,
  selectedIds = [],
  onAction
}) => {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.key === 'name' ? renderNameCell(row) :
                     column.key === 'status' ? renderStatusCell(row) :
                     column.render ? column.render(row) :
                     <div className="text-sm text-gray-900">{row[column.key as keyof Person]}</div>
                    }
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => onAction?.('menu', row)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
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