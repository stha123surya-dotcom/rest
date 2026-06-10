import React, { useState } from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { X, Save, Plus } from 'lucide-react';
import { ItemType } from '../../types';

interface AddMenuItemModalProps {
  onClose: () => void;
}

export const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ onClose }) => {
  const { addMenuItem } = usePos();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ItemType>('veg');

  const handleSave = () => {
    if (!name || !price || !category) return;
    
    addMenuItem({
      name,
      description,
      price: parseFloat(price) || 0,
      category,
      type,
      available: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Add Menu Item</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Item Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Price ($)</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Starters, Main"
                className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  checked={type === 'veg'} 
                  onChange={() => setType('veg')} 
                  className="accent-amber-500"
                />
                <span className="text-sm px-2 text-emerald-400 border border-emerald-500/50 rounded bg-emerald-500/10">Veg</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  checked={type === 'non-veg'} 
                  onChange={() => setType('non-veg')} 
                  className="accent-amber-500"
                />
                <span className="text-sm px-2 text-red-400 border border-red-500/50 rounded bg-red-500/10">Non-Veg</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-zinc-800 shrink-0">
          <button 
            onClick={handleSave}
            disabled={!name || !price || !category}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Menu Item</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
