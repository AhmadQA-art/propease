import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-full bg-white">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}