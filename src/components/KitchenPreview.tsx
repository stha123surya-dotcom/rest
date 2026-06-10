import React, { useState } from 'react';
import { usePos } from '../store';
import { Flame, CheckCircle2, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

export const KitchenPreview: React.FC = () => {
  const { tables, activeOrders, updateOrder } = usePos();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (itemKey: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(itemKey)) newSet.delete(itemKey);
    else newSet.add(itemKey);
    setCheckedItems(newSet);
  };

  const handleFoodOut = (tableOrders: any[]) => {
    tableOrders.forEach(o => {
      let updated = false;
      const updatedItems = o.items.map((i: any) => {
        const key = `${o.id}-${i.id}`;
        if (checkedItems.has(key)) {
          updated = true;
          return { ...i, served: true };
        }
        return i;
      });
      if (updated) {
        updateOrder(o.id, { items: updatedItems });
      }
    });

    const newSet = new Set(checkedItems);
    tableOrders.forEach(o => {
      o.items.forEach((i: any) => {
        newSet.delete(`${o.id}-${i.id}`);
      });
    });
    setCheckedItems(newSet);
  };

  return (
    <div className="flex-1 bg-[#121212] p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#FFBF00] uppercase tracking-wider flex items-center gap-2">
          <Utensils className="w-5 h-5" /> Kitchen Order Preview
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(() => {
          const sortedTables = tables.map(table => {
            const tableOrders = activeOrders.filter(o => o.tableId === table.id);
            const allItems = tableOrders.flatMap(o => o.items.map(i => ({ ...i, orderId: o.id, orderNumber: o.orderNumber })));
            const unservedItems = allItems.filter(i => !i.served);
            
            const hasItems = allItems.length > 0;
            const allOrdersServed = hasItems && unservedItems.length === 0;
            const hasUnservedFood = unservedItems.length > 0;

            const oldestOrderTime = hasUnservedFood 
              ? Math.min(...tableOrders.filter(o => o.items.some(i => !i.served)).map(o => o.createdAt || 0)) 
              : Infinity;
            
            const activeOrderNumbers = [...new Set(tableOrders.filter(o => o.items.some(i => !i.served)).map(o => o.orderNumber))].filter(Boolean);

            return {
              ...table,
              tableOrders,
              unservedItems,
              hasItems,
              allOrdersServed,
              hasUnservedFood,
              oldestOrderTime,
              activeOrderNumbers
            };
          }).sort((a, b) => {
            if (a.hasUnservedFood && b.hasUnservedFood) return a.oldestOrderTime - b.oldestOrderTime;
            if (a.hasUnservedFood) return -1;
            if (b.hasUnservedFood) return 1;
            
            if (a.allOrdersServed && !b.allOrdersServed) return -1;
            if (b.allOrdersServed && !a.allOrdersServed) return 1;

            if (a.status === 'occupied' && b.status !== 'occupied') return -1;
            if (b.status === 'occupied' && a.status !== 'occupied') return 1;

            return a.number - b.number;
          });

          return sortedTables.map(table => {
            const { tableOrders, unservedItems, hasItems, allOrdersServed, hasUnservedFood, activeOrderNumbers } = table;

            let statusColor = "bg-[#222] border-emerald-500/50 text-emerald-400"; // Available
            if (hasUnservedFood) {
              statusColor = "bg-[#1A1A1A] border-[#FFBF00] text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.2)]";
            } else if (allOrdersServed) {
              statusColor = "bg-[#1A1A1A] border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
            } else if (table.status === 'reserved') {
              statusColor = "bg-[#222] border-[#FFBF00]/30 border-dashed text-[#FFBF00]";
            } else if (table.status === 'occupied') {
               statusColor = "bg-[#1A1A1A] border-[#FFBF00] text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.2)]";
            }

            return (
              <motion.div 
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-lg border flex flex-col p-4 transition-colors min-h-[200px] ${statusColor}`}
              >
                <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
                  <div>
                    <div className="font-bold text-lg">T-{table.number.toString().padStart(2, '0')}</div>
                    {activeOrderNumbers.length > 0 && (
                      <div className="text-[#FFBF00] font-black text-xs tracking-wider">
                        ORD: #{activeOrderNumbers.join(', #')}
                      </div>
                    )}
                  </div>
                  {table.waiterName && <span className="text-xs opacity-70">{table.waiterName}</span>}
                </div>
                
                <div className="flex-1 overflow-y-auto w-full text-sm text-gray-300 space-y-2 scrollbar-hide py-1">
                  {hasUnservedFood ? (
                    unservedItems.map((item, idx) => {
                      const itemKey = `${item.orderId}-${item.id}`;
                    return (
                      <div 
                        key={itemKey} 
                        className="flex justify-between w-full items-start gap-2 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                        onClick={() => toggleCheck(itemKey)}
                      >
                        <input 
                          type="checkbox" 
                          checked={checkedItems.has(itemKey)} 
                          onChange={() => {}} // dummy to avoid react warning since click is on div
                          className="mt-1 flex-shrink-0 cursor-pointer accent-[#FFBF00]"
                        />
                        <span className="flex-1 leading-snug">- {item.name} {item.note && <span className="block text-[10px] text-gray-500 italic">{item.note}</span>}</span>
                        <span className="font-mono text-[#FFBF00] shrink-0 font-bold">x{item.quantity}</span>
                      </div>
                    )
                  })
                ) : hasItems ? (
                  <div className="h-full flex items-center justify-center text-blue-500/50 text-xs uppercase font-medium">All Served</div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 text-xs uppercase font-medium">No Orders Yet</div>
                )}
              </div>
              
              {hasUnservedFood && (
                <button 
                  onClick={() => handleFoodOut(tableOrders)}
                  disabled={!unservedItems.some(i => checkedItems.has(`${i.orderId}-${i.id}`))}
                  className="mt-4 w-full py-2.5 bg-[#FFBF00] text-[#121212] font-bold text-sm rounded hover:bg-[#FFD700] uppercase flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Flame className="w-4 h-4"/> Food Out
                </button>
              )}
              {allOrdersServed && (
                <div className="mt-4 w-full py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm rounded uppercase flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4"/> Served
                </div>
              )}
            </motion.div>
          );
          });
        })()}
      </div>
    </div>
  );
};
