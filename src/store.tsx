import React, { createContext, useContext, useState, useEffect } from 'react';
import { Table, MenuItem, Order, PastOrder, Settings, defaultSettings, OrderItem, DiscountType, PaymentSplit } from './types';
import { initialMenu } from './data';

interface PosContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  tables: Table[];
  updateTable: (id: string, updates: Partial<Table>) => void;
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  activeOrders: Order[];
  createOrder: (tableId: string) => string;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  pastOrders: PastOrder[];
  addPastOrder: (order: PastOrder) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const loadData = <T,>(key: string, defaultData: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch {
    return defaultData;
  }
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => loadData('pos_settings', defaultSettings));
  
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = loadData<Table[] | null>('pos_tables', null);
    if (saved && saved.length === settings.tableCount) return saved;
    // Generate fresh tables based on settings count
    return Array.from({ length: settings.tableCount }).map((_, i) => ({
      id: `t${i + 1}`,
      number: i + 1,
      capacity: (i % 3 === 0) ? 6 : (i % 2 === 0 ? 2 : 4),
      status: 'available',
    }));
  });

  const [menu, setMenu] = useState<MenuItem[]>(() => loadData('pos_menu', initialMenu));
  const [activeOrders, setActiveOrders] = useState<Order[]>(() => loadData('pos_active_orders', []));
  const [pastOrders, setPastOrders] = useState<PastOrder[]>(() => loadData('pos_past_orders', []));
  const [orderCounter, setOrderCounter] = useState<{ date: string, count: number }>(() => loadData('pos_order_counter', { date: new Date().toDateString(), count: 0 }));

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => { saveData('pos_settings', settings); }, [settings]);
  useEffect(() => { saveData('pos_tables', tables); }, [tables]);
  useEffect(() => { saveData('pos_menu', menu); }, [menu]);
  useEffect(() => { saveData('pos_active_orders', activeOrders); }, [activeOrders]);
  useEffect(() => { saveData('pos_past_orders', pastOrders); }, [pastOrders]);
  useEffect(() => { saveData('pos_order_counter', orderCounter); }, [orderCounter]);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    // If table count changes, recalculate tables
    if (newSettings.tableCount !== tables.length) {
      setTables(prev => {
        const newTables = Array.from({ length: newSettings.tableCount }).map((_, i) => {
          const number = i + 1;
          const existing = prev.find(t => t.number === number);
          if (existing) return existing;
          return {
            id: `t${number}`,
            number,
            capacity: (i % 3 === 0) ? 6 : (i % 2 === 0 ? 2 : 4),
            status: 'available',
          };
        });
        return newTables as Table[];
      });
    }
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMenu(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenu(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const createOrder = (tableId: string) => {
    const today = new Date().toDateString();
    let currentCount = orderCounter.count;
    if (orderCounter.date !== today) {
      currentCount = 0;
    }
    currentCount += 1;
    
    setOrderCounter({ date: today, count: currentCount });
    
    const newOrderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: Order = {
      id: newOrderId,
      orderNumber: currentCount.toString().padStart(3, '0'),
      createdAt: Date.now(),
      tableId,
      items: [],
      status: 'draft',
      discountAmount: 0,
      discountType: 'percentage',
      tip: 0,
    };
    setActiveOrders(prev => [...prev, newOrder]);
    return newOrderId;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setActiveOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const removeOrder = (id: string) => {
    setActiveOrders(prev => prev.filter(o => o.id !== id));
  };

  const addPastOrder = (order: PastOrder) => {
    setPastOrders(prev => [order, ...prev]);
  };

  return (
    <PosContext.Provider value={{
      settings, updateSettings,
      tables, updateTable,
      menu, addMenuItem, updateMenuItem,
      activeOrders, createOrder, updateOrder, removeOrder,
      pastOrders, addPastOrder,
      selectedTableId, setSelectedTableId,
      selectedOrderId, setSelectedOrderId
    }}>
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) throw new Error("usePos must be used within PosProvider");
  return context;
};
