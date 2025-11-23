import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, CategoryContext } from './types';
import { CURRENCY_SYMBOL } from './constants';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Home, School, Wallet, Trash2, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'rupeewise_data_v1';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<CategoryContext>('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...t, id: uuidv4() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to completely wipe all data? This cannot be undone.')) {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const downloadPDF = () => {
    // Check if jspdf exists globally (loaded via CDN)
    const { jspdf } = window;
    if (!jspdf) {
      alert("PDF library is loading. Please try again in a moment.");
      return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`RupeeWise - ${activeTab} Expenses`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // Summary
    const filtered = transactions.filter(t => t.context === activeTab);
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 35, 180, 25, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Total Income: ${CURRENCY_SYMBOL}${income}`, 20, 50);
    doc.text(`Total Expense: ${CURRENCY_SYMBOL}${expense}`, 80, 50);
    doc.text(`Balance: ${CURRENCY_SYMBOL}${balance}`, 140, 50);

    // Table
    const tableColumn = ["Date", "Item Name", "Type", "Category", "Payment", "Amount"];
    const tableRows: any[] = [];

    filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(ticket => {
      const ticketData = [
        ticket.date,
        ticket.description || '-',
        ticket.type.toUpperCase(),
        ticket.category,
        ticket.paymentMethod || '-',
        `${CURRENCY_SYMBOL}${ticket.amount.toLocaleString('en-IN')}`
      ];
      tableRows.push(ticketData);
    });

    // Use autoTable if available
    if ((doc as any).autoTable) {
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });
    } else {
       // Fallback text if autoTable plugin fails to load (unlikely with CDN)
       doc.text("Transaction details are available in the CSV export.", 14, 70);
    }

    doc.save(`${activeTab}_Expenses_Report.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              RupeeWise
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('Home'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'Home' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Home size={20} />
              Home Expenses
            </button>
            <button
              onClick={() => { setActiveTab('School'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'School' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <School size={20} />
              School Expenses
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={clearAllData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Clear Data
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">v1.0.0 • Local Storage</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile) */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Wallet size={20} className="text-indigo-600"/> RupeeWise
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{activeTab} Dashboard</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your {activeTab.toLowerCase()} finances efficiently.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Dashboard & List */}
              <div className="xl:col-span-2 space-y-8">
                <Dashboard 
                  transactions={transactions} 
                  context={activeTab} 
                  onDownloadPdf={downloadPDF}
                />
                <TransactionList 
                  transactions={transactions} 
                  context={activeTab} 
                  onDelete={deleteTransaction}
                />
              </div>

              {/* Right Column: Form */}
              <div className="xl:col-span-1">
                <div className="sticky top-6">
                  <TransactionForm 
                    currentContext={activeTab} 
                    onAddTransaction={addTransaction} 
                  />
                  
                  {/* Mini Info Card */}
                  <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
                    <p className="font-semibold mb-1">💡 Tip</p>
                    <p>Use the "AI Insights" button in the dashboard to analyze your spending patterns and save money.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;