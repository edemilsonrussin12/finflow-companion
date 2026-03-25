export type TransactionType = 'income' | 'expense' | 'investment';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly';

// Legacy categories kept for backward compatibility during migration
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

export type DiscountType = 'fixed' | 'percentage';
export type CardType = 'debit' | 'credit';
export type PaymentMethod = 'pix' | 'cash' | 'debit' | 'credit' | 'transfer' | 'boleto';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string
  category: string; // category ID from new system
  subCategory?: string | null; // subcategory ID
  description: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrencePaused?: boolean;
  recurrenceGroupId?: string;
  // Payment detail fields
  discountType?: DiscountType | null;
  discountValue?: number;
  discountReason?: string | null;
  paymentMethod?: PaymentMethod | null;
  cardType?: CardType | null;
  installments?: number | null;
  cardFee?: number;
  paymentInterest?: number;
  netAmount?: number | null;
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
