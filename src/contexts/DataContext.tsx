import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Product, RentalOrder, Quotation, Invoice, 
  ProductAttribute, CompanySettings, RentalSettings 
} from '@/types';
import { 
  mockProducts, mockOrders, mockQuotations, mockInvoices,
  mockAttributes, defaultCompanySettings, defaultRentalSettings,
  generateId
} from '@/data/mockData';

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: RentalOrder[];
  addOrder: (order: Omit<RentalOrder, 'id' | 'createdAt' | 'updatedAt'>) => RentalOrder;
  updateOrder: (id: string, updates: Partial<RentalOrder>) => void;
  
  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  convertQuotationToOrder: (quotationId: string) => RentalOrder | null;
  
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  
  // Settings
  attributes: ProductAttribute[];
  updateAttributes: (attrs: ProductAttribute[]) => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  rentalSettings: RentalSettings;
  updateRentalSettings: (settings: Partial<RentalSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<RentalOrder[]>(mockOrders);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(mockAttributes);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [rentalSettings, setRentalSettings] = useState<RentalSettings>(defaultRentalSettings);

  // Product operations
  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...product,
      id: generateId('prod'),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Order operations
  const addOrder = useCallback((order: Omit<RentalOrder, 'id' | 'createdAt' | 'updatedAt'>): RentalOrder => {
    const newOrder: RentalOrder = {
      ...order,
      id: generateId('order'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<RentalOrder>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o));
  }, []);

  // Quotation operations
  const addQuotation = useCallback((quotation: Quotation) => {
    setQuotations(prev => [...prev, quotation]);
  }, []);

  const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const convertQuotationToOrder = useCallback((quotationId: string): RentalOrder | null => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) return null;

    const securityDeposit = quotation.total * (companySettings.securityDepositPercent / 100);
    
    const newOrder = addOrder({
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      vendorId: 'vendor-1',
      lines: quotation.lines,
      status: 'confirmed',
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      securityDeposit,
      lateFee: 0,
      notes: quotation.notes,
    });

    updateQuotation(quotationId, { status: 'accepted' });
    return newOrder;
  }, [quotations, companySettings.securityDepositPercent, addOrder, updateQuotation]);

  // Invoice operations
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId('inv'),
      createdAt: new Date(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  // Settings operations
  const updateAttributes = useCallback((attrs: ProductAttribute[]) => {
    setAttributes(attrs);
  }, []);

  const updateCompanySettings = useCallback((settings: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settings }));
  }, []);

  const updateRentalSettings = useCallback((settings: Partial<RentalSettings>) => {
    setRentalSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const value: DataContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    addOrder,
    updateOrder,
    quotations,
    addQuotation,
    updateQuotation,
    convertQuotationToOrder,
    invoices,
    addInvoice,
    updateInvoice,
    attributes,
    updateAttributes,
    companySettings,
    updateCompanySettings,
    rentalSettings,
    updateRentalSettings,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
