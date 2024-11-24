import React from 'react';
import DashboardCard from '../components/DashboardCard';
import RevenueChart from '../components/RevenueChart';
import { Building2, Users, DollarSign, Wrench } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C3539]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Welcome back! Here's an overview of your properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Properties"
          value="24"
          trend={5.2}
          icon={<Building2 className="w-6 h-6 text-[#2C3539]" />}
        />
        <DashboardCard
          title="Total Residents"
          value="142"
          trend={3.1}
          icon={<Users className="w-6 h-6 text-[#2C3539]" />}
        />
        <DashboardCard
          title="Monthly Revenue"
          value="$52,350"
          trend={7.8}
          icon={<DollarSign className="w-6 h-6 text-[#2C3539]" />}
        />
        <DashboardCard
          title="Active Maintenance"
          value="8"
          trend={-2.5}
          icon={<Wrench className="w-6 h-6 text-[#2C3539]" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#2C3539] mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#2C3539]">New Maintenance Request</p>
                  <p className="text-xs text-[#6B7280]">Unit 304, Building A</p>
                </div>
                <span className="text-xs text-[#6B7280]">2h ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}