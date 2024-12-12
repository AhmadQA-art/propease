import React from 'react';
import { X, FileText, Calendar, DollarSign, Tag, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  date: string;
  account: string;
  transactionType: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  property?: string;
  linkedEntity?: string;
  files?: { name: string; url: string }[];
  notes?: string;
  receipt?: { id: string; url: string };
}

interface TransactionDetailsDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-50">
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

          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Transaction Type</label>
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-[#2C3539]" />
              <span className="text-[#2C3539]">{transaction.transactionType}</span>
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

          {/* Financial Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Debit</label>
              <div className="text-[#2C3539] font-medium">
                {transaction.debit ? `$${transaction.debit.toLocaleString()}` : 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Credit</label>
              <div className="text-[#2C3539] font-medium">
                {transaction.credit ? `$${transaction.credit.toLocaleString()}` : 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Balance</label>
              <div className={`font-medium ${
                transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${transaction.balance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Linked Entity */}
          {transaction.linkedEntity && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Linked Entity</label>
              <div className="text-[#2C3539]">{transaction.linkedEntity}</div>
            </div>
          )}

          {/* Property */}
          {transaction.property && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Property</label>
              <div className="text-[#2C3539]">{transaction.property}</div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Notes</label>
              <div className="text-[#2C3539]">{transaction.notes}</div>
            </div>
          )}

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
