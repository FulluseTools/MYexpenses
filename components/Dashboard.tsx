import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, PieChartData, CategoryContext } from '../types';
import { CHART_COLORS, CURRENCY_SYMBOL } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, Loader2, Download } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  context: CategoryContext;
  onDownloadPdf: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, context, onDownloadPdf }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Filter transactions for current context
  const filteredTx = useMemo(() => 
    transactions.filter(t => t.context === context), 
  [transactions, context]);

  const stats = useMemo(() => {
    return filteredTx.reduce((acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else acc.totalExpense += t.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTx]);

  const balance = stats.totalIncome - stats.totalExpense;

  const chartData: PieChartData[] = useMemo(() => {
    const expenseMap = new Map<string, number>();
    filteredTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
      });

    return Array.from(expenseMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [filteredTx]);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    setAdvice('');
    const result = await getFinancialAdvice(filteredTx, context);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-sm text-slate-500 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{CURRENCY_SYMBOL}{stats.totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
          <p className="text-sm text-slate-500 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{CURRENCY_SYMBOL}{stats.totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
          <p className="text-sm text-slate-500 font-medium">Current Balance</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {CURRENCY_SYMBOL}{balance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">Expense Breakdown</h3>
            <button 
              onClick={onDownloadPdf}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200"
            >
              <Download size={14} /> PDF
            </button>
          </div>
          
          {chartData.length > 0 ? (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${CURRENCY_SYMBOL}${value.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <p>No expenses recorded yet.</p>
            </div>
          )}
        </div>

        {/* Gemini AI Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles size={20} />
            </div>
            <h3 className="font-semibold text-indigo-900">AI Financial Insights</h3>
          </div>
          
          <div className="flex-1 bg-white/60 rounded-xl p-4 border border-indigo-50 text-sm text-slate-700 overflow-y-auto max-h-[250px] mb-4">
            {loadingAdvice ? (
              <div className="flex items-center justify-center h-full gap-2 text-indigo-500">
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing your spending...</span>
              </div>
            ) : advice ? (
              <div className="prose prose-sm max-w-none prose-indigo">
                {advice.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center mt-8">
                Click the button below to get personalized savings tips and analysis from Gemini AI based on your {context} expenses.
              </p>
            )}
          </div>

          <button
            onClick={handleGetAdvice}
            disabled={loadingAdvice || filteredTx.length === 0}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
          >
            {loadingAdvice ? 'Processing...' : 'Generate Insights'}
          </button>
        </div>
      </div>
    </div>
  );
};
