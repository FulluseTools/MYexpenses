export type TransactionType = 'income' | 'expense';
export type CategoryContext = 'Home' | 'School';
export type PaymentMethod = 'Cash' | 'Bank' | 'Other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  context: CategoryContext;
  category: string;
  paymentMethod?: PaymentMethod; // Only relevant for Income usually, but good to track for all
  description?: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Declaration for global jsPDF libraries loaded via CDN
declare global {
  interface Window {
    jspdf: any;
  }
}
