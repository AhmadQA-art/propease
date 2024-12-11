import React, { useState } from 'react';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense' | 'balance' | 'cash-flow';
  lastGenerated?: Date;
}

const availableReports: Report[] = [
  {
    id: 'R001',
    name: 'Income Statement',
    description: 'Comprehensive income and expense report for the selected period',
    type: 'income',
    lastGenerated: new Date(2024, 2, 15)
  },
  {
    id: 'R002',
    name: 'Balance Sheet',
    description: 'Current assets, liabilities, and equity snapshot',
    type: 'balance',
    lastGenerated: new Date(2024, 2, 15)
  },
  {
    id: 'R003',
    name: 'Cash Flow Statement',
    description: 'Detailed cash inflows and outflows analysis',
    type: 'cash-flow',
    lastGenerated: new Date(2024, 2, 14)
  },
  {
    id: 'R004',
    name: 'Expense Report',
    description: 'Detailed breakdown of all expenses and cost categories',
    type: 'expense',
    lastGenerated: new Date(2024, 2, 15)
  }
];

export default function FinancialReports() {
  const [selectedDateRange, setSelectedDateRange] = useState('monthly');

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <DateRangeSelector
          selected={selectedDateRange}
          onChange={setSelectedDateRange}
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-[#2C3539] mr-3" />
                <h3 className="text-lg font-semibold text-[#2C3539]">{report.name}</h3>
              </div>
            </div>

            <p className="text-sm text-[#6B7280] mb-6">{report.description}</p>

            {report.lastGenerated && (
              <div className="flex items-center text-sm text-[#6B7280] mb-6">
                <Calendar className="w-4 h-4 mr-2" />
                Last generated: {report.lastGenerated.toLocaleDateString()}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button className="text-sm font-medium text-[#2C3539] hover:text-[#3d474c] flex items-center">
                Generate Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}