import React from 'react';
import { MapPin, Home, DoorOpen, Building2, Warehouse } from 'lucide-react';

export default function RentalsReference() {
  return (
    <section>
      <div className="border-b border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Components</h2>
      </div>

      <div className="space-y-8">
        {/* Rental Components Section */}
        <section>
          <div className="border-b border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-[#2C3539] pb-4">Rental Components</h2>
          </div>

          <div className="space-y-8">
            {/* Rental Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#2C3539]">Rental Cards</h3>
              
              <div className="space-y-4">
                {/* Example Rental Cards */}
                <div className="w-full p-4 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    {/* Property Image and Info */}
                    <div className="flex items-center flex-1">
                      <img
                        src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                        alt="Sunset Gardens"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[#2C3539]">
                            Sunset Gardens
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Maintenance
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[#6B7280] mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          123 Sunset Blvd, Los Angeles, CA
                        </div>
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="flex items-center px-4 min-w-[200px]">
                      <Home className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539] capitalize">Residential</span>
                    </div>

                    {/* Active Units */}
                    <div className="flex items-center px-4 min-w-[150px] justify-end">
                      <DoorOpen className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">12 units</span>
                    </div>

                    {/* Placeholder for alignment */}
                    <div className="w-10"></div>
                  </div>
                </div>

                {/* Commercial Property Example */}
                <div className="w-full p-4 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex items-center flex-1">
                      <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                        alt="Downtown Business Center"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[#2C3539]">
                            Downtown Business Center
                          </h3>
                        </div>
                        <div className="flex items-center text-xs text-[#6B7280] mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          456 Main St, New York, NY
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center px-4 min-w-[200px]">
                      <Building2 className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539] capitalize">Commercial</span>
                    </div>

                    <div className="flex items-center px-4 min-w-[150px] justify-end">
                      <DoorOpen className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">8 units</span>
                    </div>

                    {/* Placeholder for alignment */}
                    <div className="w-10"></div>
                  </div>
                </div>

                {/* Industrial Property Example */}
                <div className="w-full p-4 cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex items-center flex-1">
                      <img
                        src="https://images.unsplash.com/photo-1553697388-94e804e2f0f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                        alt="Innovation Hub"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[#2C3539]">
                            Innovation Hub
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[#6B7280] mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          789 Tech Park Way, Austin, TX
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center px-4 min-w-[200px]">
                      <Warehouse className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539] capitalize">Industrial</span>
                    </div>

                    <div className="flex items-center px-4 min-w-[150px] justify-end">
                      <DoorOpen className="w-5 h-5 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">4 units</span>
                    </div>

                    {/* Placeholder for alignment */}
                    <div className="w-10"></div>
                  </div>
                </div>
              </div>

              {/* Usage Guidelines */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-[#2C3539] mb-2">Usage Guidelines:</h4>
                <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
                  <li>Cards should span full width of the container</li>
                  <li>Maintain consistent spacing between cards (space-y-4)</li>
                  <li>Use flex layout for content alignment</li>
                  <li>Include property image, name, location, type, and unit count</li>
                  <li>Optional status badges for maintenance, new listings, etc.</li>
                  <li>Consistent icon usage across all cards</li>
                  <li>Add placeholder div at the end for proper alignment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}