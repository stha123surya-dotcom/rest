import React, { useState, useMemo } from 'react';
import { usePos } from '../store';
import { MenuItem } from '../types';
import { Leaf, Drumstick, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddMenuItemModal } from './Modals/AddMenuItemModal';

export const Menu: React.FC = () => {
  const { menu, activeOrders, selectedTableId, selectedOrderId, updateOrder, createOrder, setSelectedOrderId, setSelectedTableId, settings } = usePos();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(menu.map(m => m.category));
    return ['All', ...Array.from(cats)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  const handleItemClick = (item: MenuItem) => {
    if (!item.available || !selectedTableId) return;

    let targetOrderId = selectedOrderId;
    
    // If no order is selected but a table is, create a new draft order
    if (!targetOrderId) {
      targetOrderId = createOrder(selectedTableId);
      setSelectedOrderId(targetOrderId);
    }
    
    const order = activeOrders.find(o => o.id === targetOrderId);
    if (!order) return;

    // Check if item already exists in order
    const existingItemIndex = order.items.findIndex(i => i.menuItemId === item.id && !i.note && !i.served);
    let newItems = [...order.items];

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push({
        id: `li_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type: item.type,
        served: false
      });
    }

    updateOrder(targetOrderId, { items: newItems });
  };

  if (!selectedTableId) {
    return (
      <div className="flex-1 bg-[#121212] flex items-center justify-center">
        <div className="text-gray-500 flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-zinc-600">?</span>
          </div>
          <p>Select a table to open menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121212] flex flex-col overflow-hidden">
      <div className="p-4 bg-[#1A1A1A] border-b border-[#2A2A2A] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg hidden lg:block">Menu</h2>
          <button 
            onClick={() => setSelectedTableId(null)}
            className="lg:hidden flex items-center gap-2 text-zinc-400 hover:text-zinc-100 bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]"
          >
            <span className="font-bold text-xs uppercase tracking-wider">Back to Floor Plan</span>
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded text-xs font-bold uppercase transition-colors
                  ${activeCategory === cat 
                    ? 'bg-[#FFBF00] text-[#121212]' 
                    : 'bg-[#2A2A2A] text-gray-400 hover:bg-[#333]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 w-full md:w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#222] border border-[#333] rounded px-4 py-2 pl-9 text-xs text-[#E0E0E0] outline-none focus:border-[#FFBF00] transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowAddMenuModal(true)}
              className="bg-[#333] hover:bg-[#444] text-white p-2 border border-[#444] rounded flex items-center justify-center transition-colors shrink-0"
              title="Add Menu Item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map(item => (
            <motion.div
              layout
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`
                bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 relative overflow-hidden
                transition-colors flex flex-col justify-between h-full min-h-[140px]
                ${item.available 
                  ? 'hover:border-[#FFBF00] cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-3 h-3 border ${item.type === 'veg' ? 'border-emerald-500' : 'border-red-500'} p-[1px] flex items-center justify-center`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className="text-[#FFBF00] font-mono text-xs">{settings.currencySymbol}{item.price.toFixed(2)}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100">{item.name}</h3>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{item.available ? item.description : 'Unavailable'}</p>
              </div>

              {item.available && (
                <div className="mt-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="w-full py-1.5 bg-[#FFBF00]/10 hover:bg-[#FFBF00] border border-[#FFBF00]/20 hover:border-[#FFBF00] text-[#FFBF00] hover:text-[#121212] font-black text-[10px] uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to Order</span>
                  </button>
                </div>
              )}
              
              {!item.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {showAddMenuModal && <AddMenuItemModal onClose={() => setShowAddMenuModal(false)} />}
      </AnimatePresence>
    </div>
  );
};
