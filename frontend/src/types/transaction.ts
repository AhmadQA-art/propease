export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  transactionType: 'recurring' | 'one-time';
} 