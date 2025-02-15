import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
}

export default function DashboardCard({ title, value, trend, icon }: DashboardCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#6B7280]">{title}</div>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-[#2C3539]">{value}</div>
          <div className="flex items-center mt-2">
            <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[#9CA3AF] ml-2">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}