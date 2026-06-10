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
  const { selectedTableId } = usePos();
  const [activeModal, setActiveModal] = useState<'none' | 'checkout' | 'kot' | 'settings' | 'history' | 'summary'>('none');
  const [receiptOrder, setReceiptOrder] = useState<PastOrder | null>(null);
  const [viewMode, setViewMode] = useState<'pos' | 'kitchen'>('pos');

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
            <div className={`absolute inset-0 lg:static flex-1 flex flex-col md:flex-row z-10 w-full ${!selectedTableId ? 'hidden lg:flex' : 'flex'}`}>
              {/* Menu overlay */}
              <Menu />

              {/* Order Panel */}
              <OrderPanel 
                onOpenCheckout={() => setActiveModal('checkout')}
                onOpenKOT={() => setActiveModal('kot')}
              />
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
