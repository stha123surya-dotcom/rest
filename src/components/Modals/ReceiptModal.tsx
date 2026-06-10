import React from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { Printer, X } from 'lucide-react';
import { PastOrder } from '../../types';

interface ReceiptModalProps {
  order: PastOrder;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = usePos();
  const date = new Date(order.timestamp);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121214] border border-zinc-800 rounded-xl max-w-sm w-full p-6 relative print:border-none print:shadow-none print:text-black print:max-w-full print:p-0 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 print:hidden sticky float-right">
          <X className="w-5 h-5" />
        </button>

        <div id="receipt-print-area" className="font-mono text-sm print:w-[300px] print:text-xs">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-zinc-100 print:text-black leading-tight">{settings.restaurantName}</h2>
            <p className="text-zinc-400 print:text-gray-700 whitespace-pre-wrap mt-1">{settings.address}</p>
            <p className="text-zinc-400 print:text-gray-700 mt-1">Tax ID: {settings.taxId}</p>
          </div>

          <div className="flex justify-between border-b border-dashed border-zinc-800 print:border-black pb-2 mb-4 text-zinc-300 print:text-black">
            <div>
              <p>Table: {order.tableNumber}</p>
              <p>Waiter: {order.waiterName || 'None'}</p>
            </div>
            <div className="text-right">
              <p>{date.toLocaleDateString()}</p>
              <p>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <table className="w-full text-left mb-4">
            <thead>
              <tr className="border-b border-dashed border-zinc-800 print:border-black text-zinc-500 print:text-black">
                <th className="pb-1 font-normal w-8">Qty</th>
                <th className="pb-1 font-normal">Item</th>
                <th className="pb-1 font-normal text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="text-zinc-200 print:text-black">
                  <td className="py-1 align-top">{item.quantity}</td>
                  <td className="py-1 align-top pr-2">{item.name}</td>
                  <td className="py-1 align-top text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-zinc-800 print:border-black pt-2 space-y-1 text-zinc-400 print:text-gray-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax ({order.taxRate}%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span>${order.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {order.tip > 0 && (
              <div className="flex justify-between">
                <span>Tip</span>
                <span>${order.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-dashed border-zinc-800 print:border-black text-zinc-100 print:text-black font-bold text-base">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-zinc-800 print:border-black text-zinc-300 print:text-black">
            <p className="font-bold mb-1">Payments:</p>
            {order.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="capitalize">{p.method}</span>
                <span>${p.amount.toFixed(2)}</span>
              </div>
            ))}
            {order.cashChange !== undefined && order.cashChange > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span>Change Given</span>
                <span>${order.cashChange.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-zinc-500 print:text-gray-600 text-sm">
            <p>Thank you for visiting!</p>
            <p>Order #{order.orderNumber}</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors print:hidden sticky bottom-0"
        >
          <Printer className="w-5 h-5" />
          <span>Print Receipt</span>
        </button>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            #receipt-print-area, #receipt-print-area * { visibility: visible; }
            #receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; margin: 0; }
            @page { margin: 0; size: auto; }
          }
        `}} />
      </motion.div>
    </div>
  );
};
