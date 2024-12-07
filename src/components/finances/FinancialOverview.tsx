import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, FileText, Calendar, Download } from 'lucide-react';
import FinanceMetricCard from './FinanceMetricCard';
import TimeRangeSelector from './TimeRangeSelector';

const mockData = [
  { month: 'Jan', income: 45000, expenses: 32000 },
  { month: 'Feb', income: 48000, expenses: 34000 },
  { month: 'Mar', income: 52000, expenses: 36000 },
  { month: 'Apr', income: 51000, expenses: 35000 },
  { month: 'May', income: 54000, expenses: 38000 },
  { month: 'Jun', income: 58000, expenses: 39000 },
];

const timeRanges = ['3M', '6M', '1Y'];

export default function FinancialOverview() {
  const [selectedRange, setSelectedRange] = useState('6M');
  
  const totalIncome = 58000;
  const totalExpenses = 39000;
  const netRevenue = totalIncome - totalExpenses;
  const upcomingPayables = 12500;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <TimeRangeSelector
          ranges={timeRanges}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
        
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
          <button className="flex items-center px-4 py-2 text-sm border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceMetricCard
          title="Total Income"
          value={totalIncome}
          change={8.5}
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <FinanceMetricCard
          title="Total Expenses"
          value={totalExpenses}
          change={-2.3}
          trend="down"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <FinanceMetricCard
          title="Net Revenue"
          value={netRevenue}
          change={12.8}
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <FinanceMetricCard
          title="Upcoming Payables"
          value={upcomingPayables}
          dueDate="Next 30 days"
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#2C3539] mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#2C3539] mb-6">Revenue Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}