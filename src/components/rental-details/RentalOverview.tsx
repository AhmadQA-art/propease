import React, { useState } from 'react';
import { Edit2, Building2, DoorOpen, UserCog, Users2, DollarSign, Home, PercentCircle, Image as ImageIcon, MapPin, ClipboardList, FileText } from 'lucide-react';
import { RentalDetails } from '../../types/rental';
import AddTaskDrawer from './AddTaskDrawer';
import AddApplicationDrawer from './AddApplicationDrawer';

interface RentalOverviewProps {
  rental: RentalDetails;
  onEdit: (id: string) => void;
}

export default function RentalOverview({ rental, onEdit }: RentalOverviewProps) {
  const [isAddTaskDrawerOpen, setIsAddTaskDrawerOpen] = useState(false);
  const [isAddApplicationDrawerOpen, setIsAddApplicationDrawerOpen] = useState(false);

  // Sample images - replace with actual data
  const propertyImages = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  ];

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    dueDate: string;
    assignee: string;
    owner: string;
  }) => {
    // TODO: Implement task creation logic
    console.log('Create new task:', taskData);
    setIsAddTaskDrawerOpen(false);
  };

  const handleAddApplication = (applicationData: {
    applicant: {
      name: string;
      email: string;
      phone: string;
    };
    desiredMoveIn: string;
    income: number;
  }) => {
    // TODO: Implement application creation logic
    console.log('Create new application:', applicationData);
    setIsAddApplicationDrawerOpen(false);
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-end items-center -mt-1 mb-2 space-x-2">
        <button
          onClick={() => setIsAddTaskDrawerOpen(true)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-sm">Add Task</span>
        </button>
        <button
          onClick={() => setIsAddApplicationDrawerOpen(true)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-sm">New Application</span>
        </button>
        <button
          onClick={() => onEdit(rental.id)}
          className="flex items-center px-3 py-1.5 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stakeholder Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholder Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <Users2 className="w-4 h-4" />
              <p>Owner</p>
            </div>
            <p className="text-[#2C3539] font-medium mt-1">{rental.owner}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
              <UserCog className="w-4 h-4" />
              <p>Property Manager</p>
            </div>
            <p className="text-[#2C3539] font-medium mt-1">{rental.manager}</p>
          </div>
        </div>
      </div>

      {/* Property Information Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <DoorOpen className="w-4 h-4" />
                <p>Units</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.unit}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <Building2 className="w-4 h-4" />
                <p>Property Type</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1 capitalize">{rental.type}</p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <MapPin className="w-4 h-4" />
                <p>Location</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">{rental.address}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              <p className="text-[#2C3539] font-medium mt-1">12</p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                <PercentCircle className="w-4 h-4" />
                <p>Occupancy Rate</p>
              </div>
              <p className="text-[#2C3539] font-medium mt-1">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
      {propertyImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Property Images</h2>
            <button className="text-sm text-[#2C3539] hover:text-[#3d474c] flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>Add Images</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {propertyImages.map((image, index) => (
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
      )}

      {/* Add Task Drawer */}
      <AddTaskDrawer
        isOpen={isAddTaskDrawerOpen}
        onClose={() => setIsAddTaskDrawerOpen(false)}
        onSubmit={handleAddTask}
        users={[
          { id: '1', name: 'John Doe', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
          { id: '2', name: 'Jane Smith', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
        ]}
        currentUser={{ id: '1', name: 'John Doe', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }}
      />

      {/* Add Application Drawer */}
      <AddApplicationDrawer
        isOpen={isAddApplicationDrawerOpen}
        onClose={() => setIsAddApplicationDrawerOpen(false)}
        onSubmit={handleAddApplication}
      />

      {/* Backdrop */}
      {(isAddTaskDrawerOpen || isAddApplicationDrawerOpen) && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => {
            setIsAddTaskDrawerOpen(false);
            setIsAddApplicationDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}