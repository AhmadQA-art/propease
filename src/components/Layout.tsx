import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Residents from '../pages/Residents';
import Properties from '../pages/Properties';
import Documents from '../pages/Documents';
import Finances from '../pages/Finances';
import Payments from '../pages/Payments';
import Team from '../pages/Team';
import Communications from '../pages/Communications';
import Maintenance from '../pages/Maintenance';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
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
  );
}