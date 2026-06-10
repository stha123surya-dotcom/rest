export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  waiterName?: string;
}

export type ItemType = 'veg' | 'non-veg';

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  type: ItemType;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  type: ItemType;
  served?: boolean;
}

export type DiscountType = 'flat' | 'percentage';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: number;
  tableId: string;
  waiterName?: string;
  items: OrderItem[];
  status: 'draft' | 'kot_printed' | 'billed';
  discountAmount: number;
  discountType: DiscountType;
  taxOverride?: number; // Override default tax percentage for this order
  tip: number;
}

export interface PaymentSplit {
  method: 'cash' | 'card' | 'upi';
  amount: number;
}

export interface PastOrder {
  id: string;
  orderNumber: string;
  tableNumber: number;
  waiterName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  serviceCharge: number;
  tip: number;
  total: number;
  payments: PaymentSplit[];
  timestamp: number;
  cashChange?: number;
}

export interface Settings {
  restaurantName: string;
  address: string;
  taxId: string;
  taxRate: number;
  serviceChargeRate: number;
  currencySymbol: string;
  cashierName: string;
  tipEnabled: boolean;
  serviceChargeEnabled: boolean;
  tableCount: number;
}

export const defaultSettings: Settings = {
  restaurantName: 'Amber Grill',
  address: '123 Culinary Lane, Food City',
  taxId: 'TAX-123456789',
  taxRate: 5,
  serviceChargeRate: 10,
  currencySymbol: '$',
  cashierName: 'Admin',
  tipEnabled: true,
  serviceChargeEnabled: true,
  tableCount: 15,
};
