import React from 'react';
import clsx from 'clsx';

interface TabHeaderProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabHeader({ tabs, activeTab, onTabChange }: TabHeaderProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-6">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab}>
            <button
              onClick={() => onTabChange(tab)}
              className={clsx(
                'py-4 px-2 text-sm font-medium relative',
                activeTab === tab
                  ? 'text-[#2C3539] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2C3539]'
                  : 'text-[#6B7280] hover:text-[#2C3539]'
              )}
            >
              {tab}
            </button>
            {index < tabs.length - 1 && (
              <div className="self-center w-px h-4 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}