import React, { useState } from 'react';
import { usePos } from '../../store';
import { motion } from 'motion/react';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';
import { Settings } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = usePos();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const handleChange = (field: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative p-6 max-h-[90vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">System Settings</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
          <div className="space-y-4">
            <h3 className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Restaurant Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Restaurant Name</label>
                <input 
                  type="text" 
                  value={localSettings.restaurantName} 
                  onChange={e => handleChange('restaurantName', e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tax ID / VAT No</label>
                <input 
                  type="text" 
                  value={localSettings.taxId} 
                  onChange={e => handleChange('taxId', e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Address</label>
                <input 
                  type="text" 
                  value={localSettings.address} 
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Financial</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={localSettings.taxRate} 
                  onChange={e => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Currency Symbol</label>
                <input 
                  type="text" 
                  value={localSettings.currencySymbol} 
                  onChange={e => handleChange('currencySymbol', e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#18181b] border border-zinc-800 rounded-lg">
              <div>
                <span className="text-zinc-300 block text-sm">Service Charge</span>
                <span className="text-xs text-zinc-500">Enable automatic service charge</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={localSettings.serviceChargeRate} 
                  onChange={e => handleChange('serviceChargeRate', parseFloat(e.target.value) || 0)}
                  disabled={!localSettings.serviceChargeEnabled}
                  className="w-16 bg-[#121214] border border-zinc-700 rounded px-2 py-1 text-zinc-200 focus:outline-none text-right disabled:opacity-50"
                  placeholder="%"
                />
                <button 
                  onClick={() => handleChange('serviceChargeEnabled', !localSettings.serviceChargeEnabled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${localSettings.serviceChargeEnabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-3 h-3 bg-zinc-950 rounded-full absolute top-1 transition-all ${localSettings.serviceChargeEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#18181b] border border-zinc-800 rounded-lg">
              <div>
                <span className="text-zinc-300 block text-sm">Enable Tipping</span>
                <span className="text-xs text-zinc-500">Allow tips at checkout</span>
              </div>
              <button 
                onClick={() => handleChange('tipEnabled', !localSettings.tipEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors ${localSettings.tipEnabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <div className={`w-3 h-3 bg-zinc-950 rounded-full absolute top-1 transition-all ${localSettings.tipEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-zinc-400 font-medium uppercase tracking-widest text-xs">System Operation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Cashier Name</label>
                <input 
                  type="text" 
                  value={localSettings.cashierName} 
                  onChange={e => handleChange('cashierName', e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Total Tables</label>
                <input 
                  type="number" 
                  value={localSettings.tableCount} 
                  onChange={e => handleChange('tableCount', parseInt(e.target.value) || 10)}
                  min="1"
                  max="50"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-zinc-800 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
