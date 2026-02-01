import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product, RentalPeriod, Quotation, RentalOrderLine } from '@/types';
import { generateId, defaultCompanySettings } from '@/data/mockData';

interface CartContextType {
  items: CartItem[];
  quotation: Quotation | null;
  addItem: (product: Product, quantity: number, period: RentalPeriod, startDate: Date, endDate: Date) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  createQuotation: (customerId: string, customerName: string) => Quotation;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  const calculatePrice = (product: Product, period: RentalPeriod, startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const diffMonths = diffTime / (30.44 * 24 * 60 * 60 * 1000);
    const diffYears = diffTime / (365.25 * 24 * 60 * 60 * 1000);
    const prices = product.rentalPrices;

    switch (period) {
      case 'hourly':
        return prices.hourly * Math.max(1, Math.ceil(diffHours));
      case 'daily':
        return prices.daily * diffDays;
      case 'weekly':
        return prices.weekly * Math.ceil(diffDays / 7);
      case 'monthly':
        return prices.monthly * Math.max(1, diffMonths);
      case 'yearly':
        return prices.yearly * Math.max(1, diffYears);
      default:
        return prices.daily * diffDays;
    }
  };

  const addItem = useCallback((
    product: Product, 
    quantity: number, 
    period: RentalPeriod, 
    startDate: Date, 
    endDate: Date
  ) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      const pricePerPeriod = calculatePrice(product, period, startDate, endDate);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity,
          rentalPeriod: period,
          startDate,
          endDate,
          pricePerPeriod,
        };
        return updated;
      }
      
      return [...prev, {
        product,
        quantity,
        rentalPeriod: period,
        startDate,
        endDate,
        pricePerPeriod,
      }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateItem = useCallback((productId: string, updates: Partial<CartItem>) => {
    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const updated = { ...item, ...updates };
        if (updates.startDate || updates.endDate || updates.rentalPeriod) {
          updated.pricePerPeriod = calculatePrice(
            item.product,
            updated.rentalPeriod,
            updated.startDate,
            updated.endDate
          );
        }
        return updated;
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setQuotation(null);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.pricePerPeriod * item.quantity), 0);
  }, [items]);

  const getTax = useCallback(() => {
    return getSubtotal() * (defaultCompanySettings.taxRate / 100);
  }, [getSubtotal]);

  const getTotal = useCallback(() => {
    return getSubtotal() + getTax();
  }, [getSubtotal, getTax]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const createQuotation = useCallback((customerId: string, customerName: string): Quotation => {
    const lines: RentalOrderLine[] = items.map(item => ({
      id: generateId('line'),
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      rentalPeriod: item.rentalPeriod,
      startDate: item.startDate,
      endDate: item.endDate,
      pricePerPeriod: item.pricePerPeriod,
      totalPrice: item.pricePerPeriod * item.quantity,
    }));

    const subtotal = getSubtotal();
    const tax = getTax();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const newQuotation: Quotation = {
      id: generateId('quote'),
      customerId,
      customerName,
      lines,
      status: 'draft',
      subtotal,
      tax,
      total: subtotal + tax,
      validUntil,
      notes: '',
      createdAt: new Date(),
    };

    setQuotation(newQuotation);
    return newQuotation;
  }, [items, getSubtotal, getTax]);

  const value: CartContextType = {
    items,
    quotation,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    createQuotation,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
