import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, ArrowRight } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense' | 'balance' | 'cash-flow';
  lastGenerated?: Date;
  format: 'pdf' | 'excel' | 'csv';
}

const availableReports: Report[] = [
  {
    id: 'R001',
    name: 'Income Statement',
    description: 'Comprehensive income and expense report for the selected period',
    type: 'income',
    lastGenerated: new Date(2024, 2, 15),
    format: 'pdf'
  },
  {
    id: 'R002',
    name: 'Balance Sheet',
    description: 'Current assets, liabilities, and equity snapshot',
    type: 'balance',
    lastGenerated: new Date(2024, 2, 15),
    format: 'excel'
  },
  {
    id: 'R003',
    name: 'Cash Flow Statement',
    description: 'Detailed cash inflows and outflows analysis',
    type: 'cash-flow',
    lastGenerated: new Date(2024, 2, 14),
    format: 'pdf'
  }
];

export default function FinancialReports() {
  const [selectedDateRange, setSelectedDateRange] = useState('monthly');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredReports = availableReports.filter(report =>
    selectedType === 'all' || report.type === selectedType
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <DateRangeSelector
          selected={selectedDateRange}
          onChange={setSelectedDateRange}
        />

        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Reports</option>
            <option value="income">Income Reports</option>
            <option value="expense">Expense Reports</option>
            <option value="balance">Balance Reports</option>
            <option value="cash-flow">Cash Flow Reports</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-[#2C3539] mr-3" />
                <h3 className="text-lg font-semibold text-[#2C3539]">{report.name}</h3>
              </div>
              <span className="text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full uppercase">
                {report.format}
              </span>
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
              <button className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}