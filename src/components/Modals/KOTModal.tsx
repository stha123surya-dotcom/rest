import React from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { Printer, X } from 'lucide-react';

interface KOTModalProps {
  onClose: () => void;
}

export const KOTModal: React.FC<KOTModalProps> = ({ onClose }) => {
  const { activeOrders, selectedOrderId, tables, selectedTableId, updateOrder } = usePos();
  
  const order = activeOrders.find(o => o.id === selectedOrderId);
  const table = tables.find(t => t.id === selectedTableId);
  const printTime = new Date();

  if (!order || !table) return null;

  const handlePrint = () => {
    // In a real app, this would send to a thermal printer API
    window.print();
    updateOrder(order.id, { status: 'kot_printed' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121214] border border-zinc-800 rounded-xl max-w-sm w-full p-6 relative print:border-none print:shadow-none print:text-black print:max-w-full"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 print:hidden">
          <X className="w-5 h-5" />
        </button>

        <div id="kot-print-area" className="font-mono print:w-[300px]">
          <div className="text-center mb-6 border-b border-zinc-800 print:border-black border-dashed pb-4">
            <h2 className="text-2xl font-bold text-zinc-100 print:text-black">KOT</h2>
            <div className="text-xs text-zinc-500 print:text-black mt-1">Order #{order.orderNumber}</div>
            <div className="text-xl font-bold mt-2 text-zinc-300 print:text-black">TABLE {table.number}</div>
            <div className="text-sm text-zinc-500 mt-1 print:text-black">{printTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | Waiter: {order.waiterName || table.waiterName || 'None'}</div>
          </div>

          <table className="w-full text-left mb-6">
            <thead>
              <tr className="border-b border-zinc-800 border-dashed text-zinc-500 print:text-black print:border-black">
                <th className="pb-2 font-normal">Qty</th>
                <th className="pb-2 font-normal">Item</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <React.Fragment key={item.id}>
                  <tr className="text-zinc-200 print:text-black">
                    <td className="py-2 font-bold w-12 align-top">{item.quantity} x</td>
                    <td className="py-2 align-top">
                      <div className="font-bold">{item.name}</div>
                      {item.note && <div className="text-sm italic text-zinc-400 print:text-gray-600 ml-2">- {item.note}</div>}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="border-t border-zinc-800 border-dashed pt-4 text-center print:border-black">
            <p className="text-zinc-500 print:text-black text-sm">End of KOT</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center gap-2 text-zinc-200 transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Print KOT</span>
        </button>
        
        {/* Style for print target */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            #kot-print-area, #kot-print-area * { visibility: visible; }
            #kot-print-area { position: absolute; left: 0; top: 0; margin: 0; padding: 0; }
            @page { margin: 0; size: auto; }
          }
        `}} />
      </motion.div>
    </div>
  );
};
