import type { Bill, Category } from '@/lib/types';
import { Home, Zap, Car, ShoppingCart, Repeat, Landmark } from 'lucide-react';

export const categories: Category[] = [
  { name: 'Housing', icon: Home },
  { name: 'Utilities', icon: Zap },
  { name: 'Transportation', icon: Car },
  { name: 'Groceries', icon: ShoppingCart },
  { name: 'Subscription', icon: Repeat },
  { name: 'Other', icon: Landmark },
];

export const bills: Bill[] = [
  { id: '1', name: 'Rent', amount: 12000, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), category: 'Housing', isPaid: true, frequency: 'monthly' },
  { id: '2', name: 'Netflix', amount: 199, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(), category: 'Subscription', isPaid: true, frequency: 'monthly' },
  { id: '3', name: 'Electricity', amount: 850.50, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), category: 'Utilities', isPaid: false, frequency: 'monthly' },
  { id: '4', name: 'Car Payment', amount: 3500, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(), category: 'Transportation', isPaid: false, frequency: 'monthly' },
  { id: '5', name: 'Groceries Estimate', amount: 4000, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), category: 'Groceries', isPaid: true, frequency: 'monthly' },
  { id: '6', name: 'Internet', amount: 650, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(), category: 'Utilities', isPaid: false, frequency: 'monthly' },
  { id: '7', name: 'Annual Car Insurance', amount: 8000, dueDate: new Date(new Date().getFullYear(), 5, 10).toISOString(), category: 'Transportation', isPaid: false, frequency: 'yearly' },
];
