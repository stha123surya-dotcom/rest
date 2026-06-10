import React, { useState, useEffect } from 'react';
import { usePos } from '../store';
import { Settings, Clock, Coffee, Shield, History, BarChart3, ChefHat, LayoutGrid } from 'lucide-react';

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenSummary: () => void;
  onToggleKitchen: () => void;
  viewMode: 'pos' | 'kitchen';
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onOpenHistory, onOpenSummary, onToggleKitchen, viewMode }) => {
  const { settings } = usePos();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="h-14 bg-[#1A1A1A] border-b border-[#2A2A2A] text-[#E0E0E0] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="w-8 h-8 bg-[#FFBF00] rounded flex items-center justify-center text-[#121212] shrink-0">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base md:text-lg text-[#FFBF00] tracking-tight uppercase leading-tight truncate max-w-[120px] md:max-w-[200px]">{settings.restaurantName}</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase hidden">POS V1.0</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide py-1">
        <div className="hidden lg:flex flex-col items-end">
          <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-0.5">
            {formatDate(time)}
          </div>
          <div className="flex items-center gap-2 text-[#FFBF00] font-mono text-sm leading-none">
            {formatTime(time)}
          </div>
        </div>

        <div className="hidden lg:block w-px h-8 bg-[#2A2A2A]"></div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right flex flex-col">
              <span className="text-sm font-semibold leading-tight">{settings.cashierName}</span>
              <span className="text-[10px] text-[#FFBF00] uppercase">Cashier • Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-xs shrink-0">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex bg-[#2A2A2A]/50 rounded-lg p-1 border border-[#3A3A3A] shrink-0">
            <button 
              onClick={onToggleKitchen} 
              className={`p-2 rounded-md transition-colors ${viewMode === 'kitchen' ? 'bg-[#FFBF00] text-[#121212]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'}`} 
              title={viewMode === 'kitchen' ? 'Back to POS' : 'Kitchen View'}
            >
              {viewMode === 'kitchen' ? <LayoutGrid className="w-5 h-5 flex-shrink-0" /> : <ChefHat className="w-5 h-5 flex-shrink-0" />}
            </button>
            <div className="w-px h-6 bg-[#3A3A3A] mx-1 self-center"></div>
            <button onClick={onOpenHistory} className="p-2 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-zinc-100" title="Order History">
              <History className="w-5 h-5" />
            </button>
            <button onClick={onOpenSummary} className="p-2 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-zinc-100" title="Daily Summary">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button onClick={onOpenSettings} className="p-2 hover:bg-zinc-700 rounded-md transition-colors text-zinc-400 hover:text-zinc-100" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
