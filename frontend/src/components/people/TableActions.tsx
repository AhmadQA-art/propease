import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Edit, Trash2, UserMinus, UserPlus } from 'lucide-react';
import type { Person } from '../../types/people';

interface TableActionsProps {
  person: Person;
  onAction: (action: string, person: Person) => void;
}

const TableActions: React.FC<TableActionsProps> = ({ person, onAction }) => {
  const actions = [
    {
      label: 'Edit',
      icon: Edit,
      action: 'edit',
      show: true,
    },
    {
      label: person.status === 'active' ? 'Deactivate' : 'Activate',
      icon: person.status === 'active' ? UserMinus : UserPlus,
      action: person.status === 'active' ? 'deactivate' : 'activate',
      show: true,
    },
    {
      label: 'Delete',
      icon: Trash2,
      action: 'delete',
      show: true,
    },
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="text-gray-400 hover:text-gray-600">
          <span className="sr-only">Open actions menu</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-10 w-48 py-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          sideOffset={5}
        >
          <div className="py-1">
            {actions
              .filter((action) => action.show)
              .map((action) => (
                <button
                  key={action.action}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    onAction(action.action, person);
                  }}
                >
                  <action.icon className="w-4 h-4 mr-3" />
                  {action.label}
                </button>
              ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default TableActions; 