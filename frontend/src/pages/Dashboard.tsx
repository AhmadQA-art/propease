import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Building2, Users, Home, Wrench } from 'lucide-react';
import { getDashboardData, DashboardData } from '../services/dashboard.service';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProperties: 0,
    totalUnits: 0,
    activeLeases: 0,
    activeMaintenance: 0,
    propertyTrend: 0,
    unitTrend: 0,
    leaseTrend: 0,
    maintenanceTrend: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardData();
        console.log('Dashboard received data:', data);
        
        // Ensure activeMaintenance is a number
        if (typeof data.activeMaintenance !== 'number') {
          console.warn('Maintenance count is not a number:', data.activeMaintenance);
          data.activeMaintenance = parseInt(data.activeMaintenance) || 0;
        }
        
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    // Ensure num is actually a number
    if (typeof num !== 'number') {
      console.warn('Attempting to format non-number:', num);
      num = parseInt(num) || 0;
    }
    return num.toLocaleString('en-US');
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C3539]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Welcome back! Here's an overview of your properties</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Properties"
            value={formatNumber(dashboardData.totalProperties)}
            trend={dashboardData.propertyTrend}
            icon={<Building2 className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Total Units"
            value={formatNumber(dashboardData.totalUnits)}
            trend={dashboardData.unitTrend}
            icon={<Home className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Active Leases"
            value={formatNumber(dashboardData.activeLeases)}
            trend={dashboardData.leaseTrend}
            icon={<Users className="w-6 h-6 text-[#2C3539]" />}
          />
          <DashboardCard
            title="Active Maintenance"
            value={formatNumber(dashboardData.activeMaintenance)}
            trend={dashboardData.maintenanceTrend}
            icon={<Wrench className="w-6 h-6 text-[#2C3539]" />}
          />
        </div>
      )}
    </>
  );
}