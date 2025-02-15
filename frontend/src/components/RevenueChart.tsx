import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 5000 },
  { name: 'Mar', revenue: 4800 },
  { name: 'Apr', revenue: 6000 },
  { name: 'May', revenue: 5500 },
  { name: 'Jun', revenue: 7000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2C3539]">Revenue Overview</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm rounded-md bg-[#2C3539] text-white">Monthly</button>
          <button className="px-3 py-1 text-sm rounded-md text-[#6B7280]">Yearly</button>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2C3539"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}