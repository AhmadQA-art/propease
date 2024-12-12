import React from 'react';
import { X, FileText, Calendar, DollarSign, Tag, Printer, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  files?: { name: string; url: string }[];
  notes?: string;
  receipt?: { id: string; url: string };
}

interface TransactionDetailsDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TransactionDetailsDrawer({ 
  transaction, 
  isOpen, 
  onClose 
}: TransactionDetailsDrawerProps) {
  if (!isOpen || !transaction) return null;

  const handlePrintReceipt = () => {
    if (transaction.receipt) {
      window.open(transaction.receipt.url, '_blank');
    }
  };

  return (
    <div 
    className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
    >
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Transaction Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Transaction Date */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Transaction Date</label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#2C3539]" />
              <span className="text-[#2C3539] font-medium">
                {format(new Date(transaction.date), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Transaction Type and Amount */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Amount</label>
            <div className="flex items-center space-x-2">
              {transaction.type === 'income' ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-[#2C3539] font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                ${transaction.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Description</label>
            <div className="text-[#2C3539]">{transaction.description}</div>
            {transaction.reference && (
              <div className="text-xs text-[#6B7280]">Ref: {transaction.reference}</div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Category</label>
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-[#2C3539]" />
              <span className="text-[#2C3539]">{transaction.category}</span>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Account</label>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-[#2C3539]" />
              <span className="text-[#2C3539]">{transaction.account}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>

          {/* Files */}
          {transaction.files && transaction.files.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Attached Files</label>
              <div className="space-y-2">
                {transaction.files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#2C3539]" />
                      <span className="text-sm text-[#2C3539]">{file.name}</span>
                    </div>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipt */}
          {transaction.receipt && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Receipt</label>
              <button 
                onClick={handlePrintReceipt}
                className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Printer className="w-4 h-4 text-[#2C3539]" />
                <span className="text-sm text-[#2C3539]">Print Receipt</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
