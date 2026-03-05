export type TransactionType = 'income' | 'expense';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly';

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Outros',
] as const;

export type Category = typeof CATEGORIES[number];

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string
  category: Category;
  description: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrencePaused?: boolean;
  recurrenceGroupId?: string;
}

export interface Sale {
  id: string;
  product: string;
  quantity: number;
  totalValue: number;
  date: string; // ISO date string
}

export interface InvestmentSimulation {
  initialAmount: number;
  monthlyContribution: number;
  monthlyRate: number;
  months: number;
}

export interface InvestmentResult {
  finalValue: number;
  totalInvested: number;
  totalInterest: number;
  monthlyData: { month: number; value: number; invested: number }[];
}
