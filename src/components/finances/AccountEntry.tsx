import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'income' | 'expense' | 'equity';
  balance: number;
  children?: Account[];
}

interface AccountEntryProps {
  account: Account;
  isExpanded: boolean;
  onToggle: () => void;
  level: number;
}

export default function AccountEntry({
  account,
  isExpanded,
  onToggle,
  level
}: AccountEntryProps) {
  const hasChildren = account.children && account.children.length > 0;

  return (
    <div>
      <div
        className={clsx(
          'flex items-center justify-between p-3 rounded-lg transition-colors',
          hasChildren ? 'cursor-pointer hover:bg-gray-50' : 'pl-9'
        )}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex items-center">
          {hasChildren && (
            <div className="mr-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              )}
            </div>
          )}
          <span className="text-[#2C3539] font-medium">{account.name}</span>
        </div>
        <span className="text-[#6B7280]">${account.balance.toLocaleString()}</span>
      </div>

      {isExpanded && account.children && (
        <div className="mt-1">
          {account.children.map((child) => (
            <AccountEntry
              key={child.id}
              account={child}
              isExpanded={false}
              onToggle={() => {}}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}