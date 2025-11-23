import React, { useState } from 'react';
import { CategoryContext, TransactionType, PaymentMethod, Transaction } from '../types';
import { HOME_EXPENSE_CATEGORIES, SCHOOL_EXPENSE_CATEGORIES, INCOME_SUBMENUS } from '../constants';
import { PlusCircle, Wallet, School, Home } from 'lucide-react';

interface TransactionFormProps {
  currentContext: CategoryContext;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ currentContext, onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = currentContext === 'Home' ? HOME_EXPENSE_CATEGORIES : SCHOOL_EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || (type === 'expense' && !category)) return;

    onAddTransaction({
      date,
      amount: parseFloat(amount),
      type,
      context: currentContext,
      category: type === 'income' ? 'Income' : category,
      paymentMethod: type === 'income' ? paymentMethod : undefined,
      description: description
    });

    // Reset form partially
    setAmount('');
    setDescription('');
    if(type === 'expense') setCategory('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6 text-slate-700">
        {currentContext === 'Home' ? <Home size={20} /> : <School size={20} />}
        <h2 className="text-lg font-semibold">Add {currentContext} Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Expense
          </button>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Dynamic Fields based on Type */}
        {type === 'income' ? (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Source</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {INCOME_SUBMENUS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Item Name Input */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Monthly Grocery, School Bus Fee"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-colors ${
            type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          <PlusCircle size={18} />
          Save {type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
};