import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceMetricCardProps {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  dueDate?: string;
}

export default function FinanceMetricCard({
  title,
  value,
  change,
  trend,
  icon,
  dueDate
}: FinanceMetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#6B7280]">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-[#2C3539]">
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-[#2C3539]">
          ${value.toLocaleString()}
        </div>
        
        {change !== undefined && trend && (
          <div className="flex items-center space-x-2">
            <span className={`flex items-center text-sm ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-[#6B7280]">vs last period</span>
          </div>
        )}
        
        {dueDate && (
          <div className="text-sm text-[#6B7280]">
            Due: {dueDate}
          </div>
        )}
      </div>
    </div>
  );
}