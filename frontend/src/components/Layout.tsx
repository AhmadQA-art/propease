import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './common/NotificationBell';
import UserProfile from './UserProfile';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 ml-64 mr-16">
        <div className="h-full bg-white">
          {/* Content area with no header */}
          <div className="p-6 h-full">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Right sidebar for notifications */}
      <div className="w-16 h-screen bg-white flex flex-col fixed right-0 border-l border-gray-100 shadow-sm z-10">
        {/* Notification bell at top */}
        <div className="px-4 py-4 flex justify-center items-center">
          <NotificationBell />
        </div>
        
        {/* You can add more tools/icons here in the future */}
        <div className="flex-1"></div>
        
        {/* User profile at bottom */}
        <div className="p-4 border-t border-gray-100 flex justify-center">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}