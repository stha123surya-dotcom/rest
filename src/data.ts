import { MenuItem } from './types';

export const initialMenu: MenuItem[] = [
  { id: 'm1', category: 'Starters', name: 'Crispy Calamari', description: 'Served with garlic aioli', price: 12, type: 'non-veg', available: true },
  { id: 'm2', category: 'Starters', name: 'Bruschetta', description: 'Tomato, basil, balsamic on toasted sourdough', price: 9, type: 'veg', available: true },
  { id: 'm3', category: 'Starters', name: 'Spicy Chicken Wings', description: 'Tossed in buffalo sauce with ranch', price: 14, type: 'non-veg', available: true },
  { id: 'm4', category: 'Starters', name: 'Paneer Tikka', description: 'Cottage cheese marinated in spices and grilled', price: 11, type: 'veg', available: true },
  
  { id: 'm5', category: 'Mains', name: 'Grilled Salmon', description: 'With asparagus and lemon butter sauce', price: 28, type: 'non-veg', available: true },
  { id: 'm6', category: 'Mains', name: 'Ribeye Steak', description: '12oz steak with mashed potatoes', price: 35, type: 'non-veg', available: true },
  { id: 'm7', category: 'Mains', name: 'Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms', price: 22, type: 'veg', available: true },
  { id: 'm8', category: 'Mains', name: 'Butter Chicken', description: 'Rich tomato gravy with tender chicken', price: 20, type: 'non-veg', available: true },
  
  { id: 'm9', category: 'Desserts', name: 'Tiramisu', description: 'Classic Italian coffee flavored dessert', price: 8, type: 'veg', available: true },
  { id: 'm10', category: 'Desserts', name: 'Chocolate Lava Cake', description: 'Warm cake with molten chocolate center', price: 10, type: 'veg', available: true },
  
  { id: 'm11', category: 'Beverages', name: 'Mojito', description: 'Mint, lime, rum, soda', price: 12, type: 'veg', available: true },
  { id: 'm12', category: 'Beverages', name: 'Iced Lemon Tea', description: 'Refreshing house-brewed tea', price: 5, type: 'veg', available: true },
  { id: 'm13', category: 'Beverages', name: 'Mango Lassi', description: 'Sweet yogurt based mango drink', price: 6, type: 'veg', available: false },
];
