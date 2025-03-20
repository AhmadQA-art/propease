import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus 
} from 'lucide-react';

export default function Common() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link 
          to="/ui-reference" 
          className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to UI Reference
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Common Components</h1>
        <p className="text-[#6B7280] mt-1">Buttons, forms, cards, and basic UI elements</p>
      </div>

      {/* Component Showcase */}
      <div className="space-y-12">
        {/* Search Bar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">Search Bar</h2>
          <div className="p-6 border border-gray-200 rounded-xl space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
              />
            </div>
            <div className="text-sm text-[#6B7280]">
              <p>Usage:</p>
              <ul className="list-disc list-inside">
                <li>Used for searching through lists of items</li>
                <li>Always includes search icon on the left</li>
                <li>Placeholder text should be specific to the content being searched</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filter Button */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">Filter Button</h2>
          <div className="p-6 border border-gray-200 rounded-xl space-y-4">
            <div className="relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-[#2C3539]" />
              </button>
            </div>
            <div className="text-sm text-[#6B7280]">
              <p>Usage:</p>
              <ul className="list-disc list-inside">
                <li>Square button with icon only</li>
                <li>Used alongside search bars for additional filtering options</li>
                <li>Opens a dropdown menu with filter options when clicked</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add New Button */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">Add New Button</h2>
          <div className="p-6 border border-gray-200 rounded-xl space-y-4">
            <div>
              <button className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </button>
            </div>
            <div className="text-sm text-[#6B7280]">
              <p>Usage:</p>
              <ul className="list-disc list-inside">
                <li>Primary action button</li>
                <li>Always includes Plus icon followed by action text</li>
                <li>Used for creating new items or records</li>
                <li>Text should be specific to what's being created (e.g., "Add Member", "Add Property")</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Color Reference */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#2C3539]">Color Palette</h2>
          <div className="p-6 border border-gray-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-[#2C3539] rounded-lg"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-[#6B7280]">#2C3539</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#3d474c] rounded-lg"></div>
              <p className="text-sm font-medium">Primary Hover</p>
              <p className="text-xs text-[#6B7280]">#3d474c</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#6B7280] rounded-lg"></div>
              <p className="text-sm font-medium">Text Secondary</p>
              <p className="text-xs text-[#6B7280]">#6B7280</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <p className="text-sm font-medium">Border</p>
              <p className="text-xs text-[#6B7280]">#E5E7EB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}