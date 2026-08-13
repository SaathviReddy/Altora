import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Tag, ArrowUpRight } from 'lucide-react';
import { api, Transaction } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';

export const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<{ investment: number; revenue: number; expenses: number; profit: number } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'revenue' | 'expense' | 'investment'>('revenue');
  const [category, setCategory] = useState('Consulting');
  const [description, setDescription] = useState('');

  const loadFinanceData = async () => {
    try {
      const txs = await api.finance.getTransactions();
      setTransactions(txs);

      const sum = await api.finance.getSummary();
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    try {
      await api.finance.addTransaction(Number(amount), type, category, description);
      setAmount('');
      setDescription('');
      setModalOpen(false);
      loadFinanceData(); // reload
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Skeleton message="Reviewing your business context..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold">LEDGER JOURNAL</span>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-charcoal">Finance Hub</h1>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus size={14} className="mr-2" /> Log Transaction
        </Button>
      </div>

      {/* Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Total Revenue</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            ${summary?.revenue.toLocaleString() || '0'}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-green-700 font-semibold">
            <TrendingUp size={12} className="mr-1" /> Satisfactory operational sales
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Operating Costs</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            ${summary?.expenses.toLocaleString() || '0'}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
            <TrendingDown size={12} className="mr-1" /> Muted infrastructure burn
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Net Profit Margin</span>
          <p className={`text-2xl font-serif font-semibold mt-1 ${summary && summary.profit >= 0 ? 'text-charcoal' : 'text-red-700'}`}>
            ${summary?.profit.toLocaleString() || '0'}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-gold font-bold">
            <ArrowUpRight size={12} className="mr-0.5" /> Margin: {summary && summary.revenue > 0 ? Math.round((summary.profit / summary.revenue) * 100) : 0}%
          </div>
        </Card>

        <Card className="p-6 border border-charcoal/5 bg-ivory">
          <span className="text-[10px] uppercase tracking-wider text-brown font-semibold">Founder Investment</span>
          <p className="text-2xl font-serif font-semibold text-charcoal mt-1">
            ${summary?.investment.toLocaleString() || '0'}
          </p>
          <div className="mt-4 flex items-center text-[10px] text-brown font-semibold">
            <DollarSign size={12} className="mr-0.5" /> Startup Equity reserves
          </div>
        </Card>
      </div>

      {/* Custom Minimalist Business Chart Mockup */}
      <Card className="p-6 border border-charcoal/5 bg-ivory space-y-4">
        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
          Monthly Revenue trend (Simulated Ledger)
        </h4>
        
        {/* Simple elegant SVG Trend Line */}
        <div className="relative w-full h-32 flex items-end justify-between px-4 pt-4 border-b border-charcoal/10">
          <div className="absolute inset-0 flex flex-col justify-between text-[8px] text-brown/60 py-2">
            <span>$30K</span>
            <span>$20K</span>
            <span>$10K</span>
            <span>$0</span>
          </div>
          
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
            <path
              d="M 5,30 Q 30,22 55,24 T 95,8"
              fill="none"
              stroke="#C9A961"
              strokeWidth="1.5"
            />
            <circle cx="5" cy="30" r="1" fill="#1A1A1A" />
            <circle cx="55" cy="24" r="1" fill="#1A1A1A" />
            <circle cx="95" cy="8" r="1.5" fill="#C9A961" />
          </svg>
          
          {/* Months labels */}
          <div className="w-full flex justify-between text-[9px] uppercase tracking-wider text-brown pt-2 mt-32">
            <span>May 2026</span>
            <span>Jun 2026</span>
            <span>Jul 2026</span>
            <span>Aug 2026</span>
          </div>
        </div>
      </Card>

      {/* Transaction Spreadsheet */}
      <Card className="p-6 border border-charcoal/10 bg-ivory space-y-4">
        <h4 className="text-xs uppercase tracking-widest text-brown font-semibold border-b border-charcoal/5 pb-2">
          Capital Ledger Log
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal font-sans">
            <thead>
              <tr className="border-b border-charcoal/10 font-serif font-semibold text-brown">
                <th className="pb-3">Transaction Date</th>
                <th className="pb-3 px-4">Ledger Type</th>
                <th className="pb-3 px-4">Allocation Category</th>
                <th className="pb-3">Journal Entry Details</th>
                <th className="pb-3 text-right">Amount ($ USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-cream/10">
                  <td className="py-3.5 text-brown font-mono">{tx.date}</td>
                  <td className="py-3.5 px-4 uppercase tracking-wider text-[9px] font-bold">
                    <span className={`px-2 py-0.5 rounded ${tx.type === 'revenue' ? 'bg-green-50 text-green-800 border border-green-200' : tx.type === 'expense' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <Tag size={10} className="text-gold" />
                      <span>{tx.category}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-brown font-light">{tx.description}</td>
                  <td className={`py-3.5 text-right font-mono font-semibold ${tx.type === 'revenue' ? 'text-green-700' : tx.type === 'expense' ? 'text-red-700' : 'text-blue-700'}`}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Transaction"
      >
        <form onSubmit={handleAddTransaction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transaction Amount ($)"
              type="number"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-brown">Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-ivory border border-charcoal/20 focus:border-gold rounded px-4 py-2.5 text-sm text-charcoal outline-none font-sans"
              >
                <option value="revenue">Revenue (Sales/Receivable)</option>
                <option value="expense">Expense (Operating Costs/Outflow)</option>
                <option value="investment">Investment (Capital/Equity Addition)</option>
              </select>
            </div>
          </div>

          <Input
            label="Ledger Category"
            placeholder="e.g. Consulting, Equity, Software, Marketing"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <Input
            label="Transaction Description"
            placeholder="e.g. Strategy retaining fee payment - Verdant Craft"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2">
            Commit Journal Entry
          </Button>
        </form>
      </Modal>

    </div>
  );
};
