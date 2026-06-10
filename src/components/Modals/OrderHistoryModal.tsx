import React, { useState } from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { X, ReceiptText, Filter } from 'lucide-react';
import { PastOrder } from '../../types';

interface OrderHistoryModalProps {
  onClose: () => void;
  onViewReceipt: (order: PastOrder) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ onClose, onViewReceipt }) => {
  const { pastOrders, settings } = usePos();
  const [filter, setFilter] = useState<'all'|'cash'|'card'|'upi'>('all');

  const filteredOrders = pastOrders.filter(o => {
    if (filter === 'all') return true;
    return o.payments.some(p => p.method === filter);
  });

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="bg-[#121214] border-l border-zinc-800 w-full max-w-lg h-full flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#0c0c0d]">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-amber-500" />
            Order History
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-800 flex gap-2">
          <Filter className="w-4 h-4 text-zinc-500 mt-1" />
          <div className="flex gap-2">
            {(['all', 'cash', 'card', 'upi'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full capitalize font-medium transition-colors border
                  ${filter === f ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">No orders found.</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-[#18181b] border border-zinc-800 p-4 rounded-xl flex justify-between items-center hover:border-amber-500/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 text-zinc-200 mb-1">
                    <span className="font-bold text-amber-400">T{order.tableNumber}</span>
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  <div className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono font-bold text-zinc-100">{settings.currencySymbol}{order.total.toFixed(2)}</span>
                  <button 
                    onClick={() => onViewReceipt(order)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-medium underline-offset-4 hover:underline"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
