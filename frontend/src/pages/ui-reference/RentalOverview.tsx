import React from 'react';
import { ClipboardList, FileText, Edit2, UserCog, Users2, DoorOpen, Building2, MapPin, DollarSign, Home, PercentCircle, Plus } from 'lucide-react';

export default function RentalOverviewReference() {
  return (
    <section className="space-y-6">
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Overview Component</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Rental Overview Section */}
                <section className="space-y-6">
                  <div className="border-b border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Overview Component</h2>
                  </div>
        
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {/* Action Buttons */}
                    <div className="flex justify-end items-center -mt-1 mb-6 space-x-2">
                      <button className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-sm">Add Task</span>
                      </button>
                      <button className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-sm">New Rental Application</span>
                      </button>
                      <button className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>
        
                    {/* Stakeholders Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                      <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholders</h2>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <UserCog className="w-4 h-4" />
                            <p>Property Manager</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">John Smith</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <Users2 className="w-4 h-4" />
                            <p>Property Owner</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">Real Estate LLC</p>
                        </div>
                      </div>
                    </div>
        
                    {/* Property Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                      <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Property Information</h2>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <DoorOpen className="w-4 h-4" />
                            <p>Units</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">24 Units</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <Building2 className="w-4 h-4" />
                            <p>Property Type</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1 capitalize">Apartment Complex</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <MapPin className="w-4 h-4" />
                            <p>Location</p>
                          </div>
                          <p className="text-[#6B7280] text-sm mt-1">123 Main Street, City, State</p>
                        </div>
                      </div>
                    </div>
        
                    {/* Performance Metrics Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                      <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Performance Metrics</h2>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <DollarSign className="w-4 h-4" />
                            <p>Monthly Revenue</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">$24,500</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <Home className="w-4 h-4" />
                            <p>Active Leases</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">20</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                            <PercentCircle className="w-4 h-4" />
                            <p>Occupancy Rate</p>
                          </div>
                          <p className="text-[#2C3539] font-medium mt-1">83%</p>
                        </div>
                      </div>
                    </div>
        
                    {/* Property Images Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-[#2C3539]">Property Images</h2>
                        <button className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-sm">Add Image</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {['https://images.unsplash.com/photo-1568605114967-8130f3a36994',
                          'https://images.unsplash.com/photo-1570129477492-45c003edd2be'].map((image, index) => (
                          <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
        
                    {/* Usage Guidelines */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-[#2C3539] mb-2">Overview Section Usage Guidelines:</h4>
                      <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
                        <li>Action buttons should be right-aligned and maintain consistent styling</li>
                        <li>Each section should use the same card styling (rounded-xl, shadow-sm, border)</li>
                        <li>Maintain consistent spacing between sections (mb-6)</li>
                        <li>Use icons consistently within information rows</li>
                        <li>Grid layouts should be responsive (grid-cols-2)</li>
                        <li>Property images should maintain aspect ratio (aspect-[4/3])</li>
                        <li>Text sizes and colors should follow the design system</li>
                      </ul>
                    </div>
                  </div>
                </section>
      </div>
    </section>
  );
}