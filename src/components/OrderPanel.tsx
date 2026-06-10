import React, { useState } from 'react';
import { usePos } from '../store';
import { Trash2, Plus, Minus, MessageSquare, Flame, Check, X, FileText, SplitSquareVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderPanelProps {
  onOpenCheckout: () => void;
  onOpenKOT: () => void;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({ onOpenCheckout, onOpenKOT }) => {
  const { settings, tables, activeOrders, selectedTableId, selectedOrderId, updateOrder, updateTable, setSelectedOrderId, createOrder } = usePos();
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const table = tables.find(t => t.id === selectedTableId);
  const order = activeOrders.find(o => o.id === selectedOrderId);
  const otherTableOrders = activeOrders.filter(o => o.tableId === selectedTableId && o.id !== selectedOrderId);

  if (!table) {
    return (
      <div className="w-full md:w-[320px] bg-[#1A1A1A] border-t md:border-t-0 md:border-l border-[#2A2A2A] flex flex-col justify-center items-center text-gray-500 h-[50vh] md:h-full shrink-0">
        Select a table
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full md:w-[320px] bg-[#1A1A1A] border-t md:border-t-0 md:border-l border-[#2A2A2A] flex flex-col p-6 h-[50vh] md:h-full shrink-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg font-bold text-[#FFBF00]">Table T-{table.number.toString().padStart(2, '0')}</h2>
            <div className="text-xs text-gray-500 uppercase tracking-widest">{table.status}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
          <FileText className="w-12 h-12 opacity-20" />
          <p>Order is empty</p>
        </div>
      </div>
    );
  }

  // Calculations
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
  
  const total = postDiscount + tax + serviceCharge + order.tip;

  const updateQuantity = (itemId: string, delta: number) => {
    const newItems = order.items.map(i => {
      if (i.id === itemId) {
        return { 
          ...i, 
          quantity: Math.max(0, i.quantity + delta),
          served: delta > 0 ? false : i.served
        };
      }
      return i;
    }).filter(i => i.quantity > 0);
    updateOrder(order.id, { items: newItems });
  };

  const removeLineItem = (itemId: string) => {
    updateOrder(order.id, { items: order.items.filter(i => i.id !== itemId) });
  };

  const saveNote = (itemId: string) => {
    updateOrder(order.id, {
      items: order.items.map(i => i.id === itemId ? { ...i, note: tempNote } : i)
    });
    setEditingNoteId(null);
  };

  const setDiscount = (amount: number, type: 'flat' | 'percentage') => {
    updateOrder(order.id, { discountAmount: amount, discountType: type });
  };

  return (
    <div className="w-full md:w-[320px] lg:w-[320px] bg-[#1A1A1A] border-t md:border-t-0 md:border-l border-[#2A2A2A] flex flex-col h-[50vh] md:h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2A] flex flex-col bg-[#1E1E1E]">
        <div className="flex justify-between items-start mb-2">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-lg font-bold text-[#FFBF00]">Table T-{table.number.toString().padStart(2, '0')}</h2>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Waiter:</span>
                <input 
                  type="text"
                  placeholder="Name..."
                  value={order.waiterName || table.waiterName || ''}
                  onChange={(e) => {
                    updateOrder(order.id, { waiterName: e.target.value });
                    updateTable(table.id, { waiterName: e.target.value });
                  }}
                  className="bg-transparent border-none text-gray-300 focus:outline-none p-0 w-24 placeholder:text-gray-700"
                />
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                order.status === 'draft' ? 'bg-[#2A2A2A] text-gray-400 border-[#3A3A3A]' :
                'bg-red-900/40 text-red-400 border-red-400/30'
              }`}>
                {order.status === 'draft' ? 'DRAFT' : 'RUNNING'}
              </span>
            </div>
          </div>
          {(otherTableOrders.length > 0 || order) && (
            <div className="flex bg-[#2A2A2A] rounded p-0.5 mt-2 overflow-x-auto max-w-full scrollbar-hide">
              {[...otherTableOrders, order].sort((a,b) => a.id.localeCompare(b.id)).map((o, idx) => (
                <button 
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`px-3 py-1 text-[10px] rounded-sm font-bold uppercase transition-colors whitespace-nowrap ${o.id === order.id ? 'bg-[#1A1A1A] text-[#FFBF00]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Tab {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => {
                  const newId = createOrder(table.id);
                  setSelectedOrderId(newId);
                }}
                className="px-2 py-1 text-[10px] rounded-sm transition-colors text-gray-500 hover:text-[#FFBF00] hover:bg-[#1A1A1A] flex items-center justify-center shrink-0"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
              <th className="p-3 text-left font-medium">Item</th>
              <th className="p-3 text-center font-medium">Qty</th>
              <th className="p-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            <AnimatePresence>
              {order.items.map((item) => (
                <motion.tr 
                  initial={{ opacity: 0, backgroundColor: 'transparent' }}
                  animate={{ opacity: 1, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0 }}
                  key={item.id} 
                  className="hover:bg-[#222] group"
                >
                  <td className="p-3 align-top">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-[#E0E0E0]">{item.name}</p>
                      <button onClick={() => updateQuantity(item.id, -item.quantity)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-1 p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {editingNoteId === item.id ? (
                      <div className="mt-1 flex gap-1">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={e => setTempNote(e.target.value)}
                          placeholder="Add note..."
                          autoFocus
                          className="bg-[#2A2A2A] border border-[#3A3A3A] rounded text-[9px] px-1.5 py-0.5 text-gray-200 outline-none w-24"
                          onKeyDown={e => e.key === 'Enter' && saveNote(item.id)}
                          onBlur={() => saveNote(item.id)}
                        />
                      </div>
                    ) : (
                      <div 
                        onClick={() => { setEditingNoteId(item.id); setTempNote(item.note || ''); }}
                        className="text-[9px] italic text-[#FFBF00] mt-0.5 cursor-text min-h-[14px] opacity-70 hover:opacity-100"
                      >
                        {item.note ? `"${item.note}"` : ''}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-4 h-4 bg-[#2A2A2A] rounded flex items-center justify-center hover:bg-[#333] text-gray-400">-</button>
                      <span className="w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-4 h-4 bg-[#2A2A2A] rounded flex items-center justify-center hover:bg-[#333] text-gray-400">+</button>
                    </div>
                  </td>
                  <td className="p-3 align-top text-right font-mono text-gray-300">
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-[#1E1E1E] border-t border-[#2A2A2A] space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Subtotal</span>
          <span className="font-mono">{subtotal.toFixed(2)}</span>
        </div>

        {/* Tax Quick Adjust */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <span>Tax</span>
            <span className="text-[10px]">(</span>
            <input 
              type="number" 
              value={order.taxOverride !== undefined ? order.taxOverride : settings.taxRate} 
              onChange={e => updateOrder(order.id, { taxOverride: parseFloat(e.target.value) || 0 })}
              className="w-6 bg-transparent text-center font-mono text-[#E0E0E0] outline-none"
              placeholder="0"
            />
            <span className="text-[10px]">%)</span>
          </div>
          <span className="font-mono text-gray-400">{tax.toFixed(2)}</span>
        </div>

        {/* Discount Quick Toggle */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Discount</span>
          <div className="flex gap-1 items-center">
            <button 
              onClick={() => setDiscount(order.discountAmount, 'percentage')} 
              className={`px-2 py-0.5 text-[9px] rounded border transition-colors ${order.discountType === 'percentage' ? 'bg-[#FFBF00] text-[#121212] font-bold border-[#FFBF00]' : 'bg-[#2A2A2A] text-gray-400 border-[#3A3A3A]'}`}
            >
              %
            </button>
            <button 
              onClick={() => setDiscount(order.discountAmount, 'flat')} 
              className={`px-2 py-0.5 text-[9px] rounded border transition-colors ${order.discountType === 'flat' ? 'bg-[#FFBF00] text-[#121212] font-bold border-[#FFBF00]' : 'bg-[#2A2A2A] text-gray-400 border-[#3A3A3A]'}`}
            >
              Flat
            </button>
            <input 
              type="number" 
              value={order.discountAmount || ''} 
              onChange={e => setDiscount(parseFloat(e.target.value) || 0, order.discountType)}
              className="w-12 bg-transparent border-b border-[#2A2A2A] text-right font-mono text-xs outline-none focus:border-[#FFBF00]"
              placeholder="0"
            />
          </div>
        </div>

        {settings.serviceChargeEnabled && (
          <div className="flex justify-between text-xs text-gray-400">
            <span>Service Charge ({settings.serviceChargeRate}%)</span>
            <span className="font-mono">{serviceCharge.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold text-[#FFBF00] pt-2 border-t border-[#2A2A2A]">
          <span>Total</span>
          <span className="font-mono">${total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button 
            onClick={onOpenKOT}
            disabled={order.items.length === 0}
            className="py-3 bg-[#2A2A2A] rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#333] transition-all disabled:opacity-50 text-gray-300"
          >
            KOT Preview
          </button>
          <button 
            onClick={onOpenCheckout}
            disabled={order.items.length === 0 || order.items.some(i => !i.served)}
            title={order.items.some(i => !i.served) ? "Food must be served from Kitchen first" : ""}
            className="py-3 bg-[#FFBF00] text-[#121212] rounded text-[10px] font-black uppercase tracking-wider hover:bg-[#FFD700] transition-all shadow-[0_0_15px_rgba(255,191,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {order.items.length > 0 && order.items.some(i => !i.served) ? 'Wait Kitchen' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};
