import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './common/NotificationBell';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-full bg-white">
          {/* Header with notification bell */}
          <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-center">
            <div>
              {/* Left side of header - can add page title or breadcrumbs here */}
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              {/* Other header items can go here */}
            </div>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}