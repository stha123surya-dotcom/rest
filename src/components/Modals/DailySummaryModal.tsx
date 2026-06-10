import React from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { X, TrendingUp, DollarSign, Activity, Users } from 'lucide-react';

interface DailySummaryModalProps {
  onClose: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ onClose }) => {
  const { pastOrders, settings } = usePos();

  const totalRevenue = pastOrders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = pastOrders.length;
  const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

  const revenueByMethod = { cash: 0, card: 0, upi: 0 };
  pastOrders.forEach(o => {
    o.payments.forEach(p => {
      if (p.method in revenueByMethod) {
        revenueByMethod[p.method] += p.amount;
      }
    });
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative p-6"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Daily Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Total Revenue</span>
            </div>
            <div className="text-3xl font-black text-zinc-100 font-mono">{settings.currencySymbol}{totalRevenue.toFixed(2)}</div>
          </div>
          
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Total Orders</span>
            </div>
            <div className="text-3xl font-black text-zinc-100 font-mono">{orderCount}</div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium uppercase tracking-wider">Avg Order Value</span>
            </div>
            <div className="text-3xl font-black text-zinc-100 font-mono">{settings.currencySymbol}{aov.toFixed(2)}</div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
          Revenue by Payment Method
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
            <span className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-bold">Cash</span>
            <span className="text-xl font-mono text-zinc-200">{settings.currencySymbol}{revenueByMethod.cash.toFixed(2)}</span>
          </div>
          <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
            <span className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-bold">Card</span>
            <span className="text-xl font-mono text-zinc-200">{settings.currencySymbol}{revenueByMethod.card.toFixed(2)}</span>
          </div>
          <div className="bg-[#18181b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
            <span className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-bold">UPI</span>
            <span className="text-xl font-mono text-zinc-200">{settings.currencySymbol}{revenueByMethod.upi.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
