import React from 'react';
import { Transaction, CategoryContext } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  context: CategoryContext;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, context, onDelete }) => {
  const filtered = transactions.filter(t => t.context === context).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filtered.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
        <p className="text-slate-400">No transactions found for {context}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mt-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{filtered.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Item Name</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  {t.description || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-slate-900">{t.category}</span>
                      {t.paymentMethod && <span className="text-xs text-slate-400">{t.paymentMethod}</span>}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'income' ? '+' : '-'} {CURRENCY_SYMBOL}{t.amount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all active:scale-95"
                    title="Delete Transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};