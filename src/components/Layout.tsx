import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Rentals from '../pages/Rentals';
import Properties from '../pages/Properties';
import Documents from '../pages/Documents';
import Finances from '../pages/Finances';
import Payments from '../pages/Payments';
import Team from '../pages/Team';
import Communications from '../pages/Communications';
import Maintenance from '../pages/Maintenance';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 ml-64 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-2rem)]">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/team" element={<Team />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/maintenance" element={<Maintenance />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}