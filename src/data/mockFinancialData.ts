export interface Account {
  number: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';
  description: string;
  balance?: number;
}

export const mockAccounts: Account[] = [
  {
    number: '1000',
    name: 'Operating Bank Account',
    category: 'Asset',
    description: 'Primary bank account for operations.',
    balance: 250000
  },
  {
    number: '1001',
    name: 'Security Deposits Held',
    category: 'Asset',
    description: 'Funds held as tenant security deposits.',
    balance: 75000
  },
  {
    number: '1002',
    name: 'Accounts Receivable',
    category: 'Asset',
    description: 'Rent and other payments due from tenants.',
    balance: 15000
  },
  {
    number: '2000',
    name: 'Accounts Payable',
    category: 'Liability',
    description: 'Amounts owed to vendors or contractors.',
    balance: -35000
  },
  {
    number: '2001',
    name: 'Security Deposit Liability',
    category: 'Liability',
    description: 'Liability for tenant security deposits.',
    balance: -75000
  },
  {
    number: '3000',
    name: 'Rental Income',
    category: 'Income',
    description: 'Income from tenant rents collected.',
    balance: 180000
  },
  {
    number: '3001',
    name: 'Management Fee Income',
    category: 'Income',
    description: 'Revenue from property management services.',
    balance: 25000
  },
  {
    number: '4000',
    name: 'Maintenance Expenses',
    category: 'Expense',
    description: 'Costs of property repairs and upkeep.',
    balance: -45000
  },
  {
    number: '4001',
    name: 'Utilities',
    category: 'Expense',
    description: 'Utility costs (electricity, water, gas).',
    balance: -12000
  },
  {
    number: '4002',
    name: 'Office Supplies',
    category: 'Expense',
    description: 'Costs for office equipment and supplies.',
    balance: -3500
  },
  {
    number: '5000',
    name: 'Retained Earnings',
    category: 'Equity',
    description: 'Accumulated profits not distributed to owners.',
    balance: 150000
  }
];
