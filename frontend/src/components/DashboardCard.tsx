import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
}

export default function DashboardCard({ title, value, trend, icon }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#6B7280]">{title}</div>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-[#2C3539]">{value}</div>
        </div>
      </div>
    </div>
  );
}