import React from 'react';
import { usePos } from '../store';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export const FloorPlan: React.FC = () => {
  const { tables, activeOrders, selectedTableId, setSelectedTableId, setSelectedOrderId, updateTable, createOrder } = usePos();

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
    
    // Find active order for this table
    const tableOrders = activeOrders.filter(o => o.tableId === tableId);
    if (tableOrders.length > 0) {
      // Just pick the first active order for simplicity for now
      // Split billing might mean multiple orders per table, but typically we load the main one.
      setSelectedOrderId(tableOrders[0].id);
    } else {
      setSelectedOrderId(null);
    }
  };

  const handleTableRightClick = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.status === 'reserved') {
      updateTable(tableId, { status: 'available' });
    } else if (table.status === 'available') {
      updateTable(tableId, { status: 'reserved' });
    }
  };

  // Determine actual table status based on orders
  const getTableStatus = (tableId: string, currentStatus: string) => {
    const hasActiveOrder = activeOrders.some(o => o.tableId === tableId);
    if (hasActiveOrder) return 'occupied';
    return currentStatus;
  };

  return (
    <div className="w-full md:w-[240px] bg-[#161616] border-r border-[#2A2A2A] flex flex-col h-full shrink-0 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Floor Plan</h2>
        <span className="text-[10px] bg-[#2A2A2A] px-2 py-0.5 rounded text-gray-400">Main Hall</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-3">
        {tables.map(table => {
          const status = getTableStatus(table.id, table.status);
          const isSelected = selectedTableId === table.id;
          
          const tableOrders = activeOrders.filter(o => o.tableId === table.id);
          const hasItems = tableOrders.some(o => o.items.length > 0);
          const allOrdersServed = hasItems && tableOrders.every(o => o.items.every(i => i.served));
          
          let statusColor = "bg-[#222] border-emerald-500/50 text-emerald-400"; // available
          let statusText = "Available";
          if (status === 'occupied') {
            if (allOrdersServed) {
              statusColor = "bg-[#1A1A1A] border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
              statusText = "Served";
            } else {
              statusColor = "bg-[#1A1A1A] border-[#FFBF00] text-[#FFBF00] shadow-[0_0_10px_rgba(255,191,0,0.2)]";
              statusText = "Occupied";
            }
          } else if (status === 'reserved') {
            statusColor = "bg-[#222] border-[#FFBF00]/30 border-dashed text-[#FFBF00]";
            statusText = "Reserved";
          }

          return (
            <motion.div
              layout
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              onContextMenu={(e) => handleTableRightClick(e, table.id)}
              className={`
                relative h-20 rounded border ${status === 'occupied' ? 'border-2' : ''} flex flex-col items-center justify-center p-2
                cursor-pointer transition-colors
                ${statusColor}
                ${isSelected ? 'ring-2 ring-white/20 scale-[1.02] shadow-xl' : 'hover:bg-[#282828]'}
              `}
            >
              <span className="text-xs font-bold mb-1">T-{table.number.toString().padStart(2, '0')}</span>
              
              <div className="text-[10px] text-gray-500 text-center uppercase tracking-wider">
                {status === 'occupied' && table.waiterName ? (
                  <span className={allOrdersServed ? "text-blue-400" : "text-[#FFBF00]"}>{table.waiterName} • {table.capacity}</span>
                ) : status === 'reserved' ? (
                  <span className="text-gray-400">Reserved</span>
                ) : (
                  <span>Cap: {table.capacity}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
