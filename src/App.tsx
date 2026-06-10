import React, { useState } from 'react';
import { usePos } from './store';
import { TopBar } from './components/TopBar';
import { FloorPlan } from './components/FloorPlan';
import { Menu } from './components/Menu';
import { OrderPanel } from './components/OrderPanel';
import { KitchenPreview } from './components/KitchenPreview';
import { CheckoutModal } from './components/Modals/CheckoutModal';
import { KOTModal } from './components/Modals/KOTModal';
import { ReceiptModal } from './components/Modals/ReceiptModal';
import { OrderHistoryModal } from './components/Modals/OrderHistoryModal';
import { DailySummaryModal } from './components/Modals/DailySummaryModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { PastOrder } from './types';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { selectedTableId, setSelectedTableId } = usePos();
  const [activeModal, setActiveModal] = useState<'none' | 'checkout' | 'kot' | 'settings' | 'history' | 'summary'>('none');
  const [receiptOrder, setReceiptOrder] = useState<PastOrder | null>(null);
  const [viewMode, setViewMode] = useState<'pos' | 'kitchen'>('pos');
  const [mobileTab, setMobileTab] = useState<'menu' | 'billing'>('menu');

  return (
    <div className="w-full h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans overflow-hidden">
      <TopBar 
        onOpenSettings={() => setActiveModal('settings')}
        onOpenHistory={() => setActiveModal('history')}
        onOpenSummary={() => setActiveModal('summary')}
        onToggleKitchen={() => setViewMode(prev => prev === 'pos' ? 'kitchen' : 'pos')}
        viewMode={viewMode}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {viewMode === 'pos' ? (
          <>
            {/* Main Workspace */}
            <div className={`flex flex-col h-full shrink-0 ${selectedTableId ? 'hidden lg:flex' : 'flex-1 lg:flex-none'}`}>
              <FloorPlan />
            </div>
            
            {/* Overlay Container for Mobile/Desktop menu split */}
            <div className={`absolute inset-0 lg:static flex-1 flex flex-col z-10 w-full overflow-hidden ${!selectedTableId ? 'hidden lg:flex' : 'flex'}`}>
              
              {/* Unified Mobile Toggles (visible only on lg layout breakpoint) */}
              <div className="lg:hidden bg-[#1E1E1E] border-b border-[#2A2A2A] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedTableId(null)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 bg-[#161616] px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold uppercase tracking-wider"
                >
                  ← Floor
                </button>
                
                <div className="flex bg-[#161616] p-1 rounded-lg border border-zinc-800 flex-1 max-w-[240px]">
                  <button
                    onClick={() => setMobileTab('menu')}
                    className={`flex-1 text-center py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${mobileTab === 'menu' ? 'bg-[#FFBF00] text-[#121212] shadow-sm' : 'text-zinc-400'}`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => setMobileTab('billing')}
                    className={`flex-1 text-center py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${mobileTab === 'billing' ? 'bg-[#FFBF00] text-[#121212] shadow-sm' : 'text-zinc-400'}`}
                  >
                    Billing
                  </button>
                </div>
                
                <div className="w-[68px]"></div> {/* balance back button width */}
              </div>

              {/* Responsive Container */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full">
                {/* Menu Side */}
                <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'}`}>
                  <Menu />
                </div>

                {/* Order/Billing Panel Side */}
                <div className={`w-full lg:w-[320px] shrink-0 h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-[#2A2A2A] ${mobileTab === 'billing' ? 'flex' : 'hidden lg:flex'}`}>
                  <OrderPanel 
                    onOpenCheckout={() => setActiveModal('checkout')}
                    onOpenKOT={() => setActiveModal('kot')}
                  />
                </div>
              </div>

            </div>
          </>
        ) : (
          <KitchenPreview />
        )}
      </div>

      <AnimatePresence>
        {activeModal === 'checkout' && (
          <CheckoutModal onClose={() => setActiveModal('none')} onSuccess={() => setActiveModal('none')} />
        )}
        {activeModal === 'kot' && (
          <KOTModal onClose={() => setActiveModal('none')} />
        )}
        {activeModal === 'settings' && (
          <SettingsModal onClose={() => setActiveModal('none')} />
        )}
        {activeModal === 'history' && (
          <OrderHistoryModal 
            onClose={() => setActiveModal('none')} 
            onViewReceipt={(order) => setReceiptOrder(order)}
          />
        )}
        {activeModal === 'summary' && (
          <DailySummaryModal onClose={() => setActiveModal('none')} />
        )}
        {receiptOrder && (
          <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
