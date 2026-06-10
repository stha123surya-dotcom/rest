import React, { useState } from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { X, DollarSign, CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import { PaymentSplit } from '../../types';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { settings, activeOrders, selectedOrderId, selectedTableId, addPastOrder, removeOrder, updateTable, tables } = usePos();
  
  const order = activeOrders.find(o => o.id === selectedOrderId);
  const table = tables.find(t => t.id === selectedTableId);
  
  const [payments, setPayments] = useState<PaymentSplit[]>([]);
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState<'cash'|'card'|'upi'>('cash');
  const [amountInput, setAmountInput] = useState('');
  
  if (!order || !table) return null;

  // Re-calculate totals exactly
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = order.discountAmount;
  if (order.discountType === 'percentage') {
    discountAmount = subtotal * (order.discountAmount / 100);
  }
  const postDiscount = subtotal - discountAmount;
  const taxRate = order.taxOverride !== undefined ? order.taxOverride : settings.taxRate;
  const tax = postDiscount * (taxRate / 100);
  const serviceChargeRate = settings.serviceChargeEnabled ? settings.serviceChargeRate : 0;
  const serviceCharge = postDiscount * (serviceChargeRate / 100);
  const grandTotal = postDiscount + tax + serviceCharge + tip;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, grandTotal - totalPaid);
  const cashChange = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const handleAddPayment = () => {
    const amt = parseFloat(amountInput);
    if (!isNaN(amt) && amt > 0) {
      setPayments(prev => [...prev, { method, amount: amt }]);
      setAmountInput('');
    }
  };

  const handleFullPayment = (m: 'cash'|'card'|'upi') => {
    setPayments([{ method: m, amount: grandTotal }]);
  };

  const handleComplete = () => {
    if (totalPaid >= grandTotal) {
      // Complete order
      const pastOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        tableNumber: table.number,
        waiterName: order.waiterName || table.waiterName,
        items: [...order.items],
        subtotal,
        tax,
        taxRate,
        discount: discountAmount,
        serviceCharge,
        tip,
        total: grandTotal,
        payments: [...payments],
        timestamp: Date.now(),
        cashChange
      };

      addPastOrder(pastOrder);
      removeOrder(order.id);
      
      // Free table if no other active orders exist for this table
      const remainingOrders = activeOrders.filter(o => o.tableId === table.id && o.id !== order.id);
      if (remainingOrders.length === 0) {
        updateTable(table.id, { status: 'available', waiterName: '' });
      }

      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl max-h-[90vh]"
      >
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/2 p-6 bg-[#0c0c0d] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto max-h-[40vh] md:max-h-full">
          <h2 className="text-xl font-bold text-zinc-200 mb-4 md:mb-6 flex justify-between shrink-0">
            <span>Checkout</span>
            <span className="text-amber-500">T{table.number}</span>
          </h2>

          <div className="flex-1 space-y-3 md:space-y-4 shrink-0">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono">{settings.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span className="font-mono">-{settings.currencySymbol}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Tax ({taxRate}%)</span>
              <span className="font-mono">{settings.currencySymbol}{tax.toFixed(2)}</span>
            </div>
            {settings.serviceChargeEnabled && (
              <div className="flex justify-between text-zinc-400">
                <span>Service Charge</span>
                <span className="font-mono">{settings.currencySymbol}{serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {settings.tipEnabled && (
              <div className="flex justify-between text-zinc-400 items-center">
                <span>Tip</span>
                <input 
                  type="number" 
                  value={tip || ''}
                  onChange={e => setTip(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-right font-mono text-amber-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-end mb-2">
              <span className="text-zinc-400">Total Due</span>
              <span className="text-3xl font-black text-amber-500 font-mono tracking-tighter">{settings.currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-zinc-500 text-sm">Remaining</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{settings.currencySymbol}{remaining.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment */}
        <div className="w-full md:w-1/2 p-6 flex flex-col relative shrink-0 overflow-y-auto max-h-[50vh] md:max-h-full">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-zinc-400 font-medium mb-4">Quick Pay</h3>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={() => handleFullPayment('cash')} className="py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex flex-col items-center gap-1 transition-colors group">
              <DollarSign className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-zinc-400">Cash</span>
            </button>
            <button onClick={() => handleFullPayment('card')} className="py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex flex-col items-center gap-1 transition-colors group">
              <CreditCard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-zinc-400">Card</span>
            </button>
            <button onClick={() => handleFullPayment('upi')} className="py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex flex-col items-center gap-1 transition-colors group">
              <Smartphone className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-zinc-400">UPI</span>
            </button>
          </div>

          <h3 className="text-zinc-400 font-medium mb-4">Split Payment</h3>
          <div className="flex gap-2 mb-4">
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
            <input 
              type="number" 
              value={amountInput}
              onChange={e => setAmountInput(e.target.value)}
              placeholder="Amount"
              className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 outline-none font-mono focus:border-amber-500"
            />
            <button onClick={handleAddPayment} className="bg-zinc-800 text-zinc-300 px-4 rounded-lg hover:bg-zinc-700">Add</button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                <span className="text-sm text-zinc-400 capitalize">{p.method}</span>
                <span className="font-mono text-zinc-300">{settings.currencySymbol}{p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {cashChange > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex justify-between items-center mb-4">
              <span className="text-emerald-400 font-medium">Change Due</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{settings.currencySymbol}{cashChange.toFixed(2)}</span>
            </div>
          )}

          <button 
            onClick={handleComplete}
            disabled={totalPaid < grandTotal}
            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 shadow-lg
              bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>CONFIRM PAYMENT</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
