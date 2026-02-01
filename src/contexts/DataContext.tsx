import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Product, RentalOrder, Quotation, Invoice,
  ProductAttribute, CompanySettings, RentalSettings,
  UserRole, User, RentalOrderLine, OrderStatus, QuotationStatus, InvoiceStatus, PaymentMethod, ProductVariant
} from '@/types';
import {
  mockProducts, mockOrders, mockQuotations, mockInvoices,
  mockAttributes, defaultCompanySettings, defaultRentalSettings,
  generateId
} from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'vendorId' | 'quantityWithCustomer'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders
  orders: RentalOrder[];
  addOrder: (order: Omit<RentalOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RentalOrder | null>;
  updateOrder: (id: string, updates: Partial<RentalOrder>) => Promise<void>;

  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => Promise<Quotation | null>;
  updateQuotation: (id: string, updates: Partial<Quotation>) => Promise<void>;
  convertQuotationToOrder: (quotationId: string) => Promise<RentalOrder | null>;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;

  // Settings
  attributes: ProductAttribute[];
  updateAttributes: (attrs: ProductAttribute[]) => Promise<void>;
  companySettings: CompanySettings | null;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  rentalSettings: RentalSettings | null;
  updateRentalSettings: (settings: Partial<RentalSettings>) => Promise<void>;
  isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface ProductRow {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  cost_price: number;
  sales_price: number;
  rental_price_hourly: number;
  rental_price_daily: number;
  rental_price_weekly: number;
  rental_price_monthly: number;
  rental_price_yearly: number;
  quantity_on_hand: number;
  quantity_with_customer: number;
  is_rentable: boolean;
  is_published: boolean;
  attributes: Record<string, string>;
  vendor_id: string;
  created_at: string;
}

interface OrderRow {
  id: string;
  customer_id: string;
  customer_name: string;
  vendor_id: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  security_deposit: number;
  pickup_date: string | null;
  return_date: string | null;
  actual_return_date: string | null;
  late_fee: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface QuotationRow {
  id: string;
  customer_id: string;
  customer_name: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  valid_until: string;
  notes: string;
  created_at: string;
  quotation_lines: QuotationLineRow[]; // Added for fetching lines
}

interface QuotationLineRow {
  id: string;
  quotation_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  rental_period: string; // Should match RentalPeriod type
  start_date: string;
  end_date: string;
  price_per_period: number;
  total_price: number;
  created_at: string;
}

interface InvoiceRow {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  items: RentalOrderLine[];
  subtotal: number;
  tax: number;
  security_deposit: number;
  late_fee: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  status: string;
  payment_method: string | null;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

interface CompanySettingsRow {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  tax_rate: number;
  security_deposit_percent: number;
  late_fee_per_day: number;
  updated_at: string;
}

interface RentalSettingsRow {
  id: string;
  allow_hourly: boolean;
  allow_daily: boolean;
  allow_weekly: boolean;
  min_rental_hours: number;
  max_rental_days: number;
  advance_booking_days: number;
  updated_at: string;
}

function mapProductRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    images: row.images,
    costPrice: row.cost_price,
    salesPrice: row.sales_price,
    rentalPrices: {
      hourly: row.rental_price_hourly,
      daily: row.rental_price_daily,
      weekly: row.rental_price_weekly,
      monthly: row.rental_price_monthly,
      yearly: row.rental_price_yearly,
    },
    quantityOnHand: row.quantity_on_hand,
    quantityWithCustomer: row.quantity_with_customer,
    isRentable: row.is_rentable,
    isPublished: row.is_published,
    attributes: row.attributes,
    vendorId: row.vendor_id,
    createdAt: new Date(row.created_at),
    variants: [],
  };
}

function mapOrderRowToOrder(row: OrderRow): RentalOrder {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    vendorId: row.vendor_id,
    status: row.status as OrderStatus,
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    securityDeposit: row.security_deposit,
    pickupDate: row.pickup_date ? new Date(row.pickup_date) : undefined,
    returnDate: row.return_date ? new Date(row.return_date) : undefined,
    actualReturnDate: row.actual_return_date ? new Date(row.actual_return_date) : undefined,
    lateFee: row.late_fee,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lines: [],
  };
}

function mapQuotationRowToQuotation(row: QuotationRow): Quotation {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    status: row.status as QuotationStatus,
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    validUntil: new Date(row.valid_until),
    notes: row.notes,
    createdAt: new Date(row.created_at),
    lines: [],
  };
}

function mapInvoiceRowToInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    orderId: row.order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    items: row.items,
    subtotal: row.subtotal,
    tax: row.tax,
    securityDeposit: row.security_deposit,
    lateFee: row.late_fee,
    total: row.total,
    amountPaid: row.amount_paid,
    amountDue: row.amount_due,
    status: row.status as InvoiceStatus,
    paymentMethod: row.payment_method as PaymentMethod,
    dueDate: new Date(row.due_date),
    paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}

function mapCompanySettingsRowToCompanySettings(row: CompanySettingsRow): CompanySettings {
  return {
    name: row.name,
    gstin: row.gstin,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logo: row.logo_url ?? undefined,
    taxRate: row.tax_rate,
    securityDepositPercent: row.security_deposit_percent,
    lateFeePerDay: row.late_fee_per_day,
    id: row.id,
  };
}

function mapRentalSettingsRowToRentalSettings(row: RentalSettingsRow): RentalSettings {
  return {
    id: row.id,
    allowHourly: row.allow_hourly,
    allowDaily: row.allow_daily,
    allowWeekly: row.allow_weekly,
    minRentalHours: row.min_rental_hours,
    maxRentalDays: row.max_rental_days,
    advanceBookingDays: row.advance_booking_days,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(mockAttributes);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [rentalSettings, setRentalSettings] = useState<RentalSettings | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const useSupabase = isSupabaseConfigured();
  const { user, isAuthenticated } = useAuth(); // Get authenticated user

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      if (!useSupabase || !supabase) {
        // Fallback to mock data if Supabase not configured
        setProducts(mockProducts);
        setOrders(mockOrders);
        setQuotations(mockQuotations);
        setInvoices(mockInvoices);
        setAttributes(mockAttributes);
        setCompanySettings(defaultCompanySettings);
        setRentalSettings(defaultRentalSettings);
        setIsLoadingData(false);
        return;
      }

      try {
        // Fetch Products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        if (productsError) throw productsError;
        setProducts(productsData.map(mapProductRowToProduct));

        // Fetch Orders (only for current user/vendor)
        let ordersData: OrderRow[] = [];
        if (isAuthenticated && user?.id) {
          const { data: userOrders, error: userOrdersError } = await supabase
            .from('orders')
            .select('*')
            .or(`customer_id.eq.${user.id},vendor_id.eq.${user.id}`);
          if (userOrdersError) throw userOrdersError;
          ordersData = userOrders;
        } else if (!isAuthenticated) {
          ordersData = []; // No orders for unauthenticated users
        } else {
          // Admin/unassigned orders - fetch all (or limit to admin access)
          const { data: allOrders, error: allOrdersError } = await supabase
            .from('orders')
            .select('*');
          if (allOrdersError) throw allOrdersError;
          ordersData = allOrders;
        }
        setOrders(ordersData.map(mapOrderRowToOrder));

        // Fetch Quotations (only for current user)
        let quotationsData: QuotationRow[] = [];
        if (isAuthenticated && user?.id) {
          const { data: userQuotations, error: userQuotationsError } = await supabase
            .from('quotations')
            .select('*')
            .eq('customer_id', user.id);
          if (userQuotationsError) throw userQuotationsError;
          quotationsData = userQuotations;
        } else if (!isAuthenticated) {
          quotationsData = []; // No quotations for unauthenticated users
        } else {
          // Admin/unassigned quotations
          const { data: allQuotations, error: allQuotationsError } = await supabase
            .from('quotations')
            .select('*');
          if (allQuotationsError) throw allQuotationsError;
          quotationsData = allQuotations;
        }
        setQuotations(quotationsData.map(mapQuotationRowToQuotation));

        // Fetch Invoices (only for current user/vendor)
        let invoicesData: InvoiceRow[] = [];
        if (isAuthenticated && user?.id) {
          const { data: userInvoices, error: userInvoicesError } = await supabase
            .from('invoices')
            .select('*')
            .or(`customer_id.eq.${user.id},vendor_id.eq.${user.id}`);
          if (userInvoicesError) throw userInvoicesError;
          invoicesData = userInvoices;
        } else if (!isAuthenticated) {
          invoicesData = []; // No invoices for unauthenticated users
        } else {
          // Admin/unassigned invoices
          const { data: allInvoices, error: allInvoicesError } = await supabase
            .from('invoices')
            .select('*');
          if (allInvoicesError) throw allInvoicesError;
          invoicesData = allInvoices;
        }
        setInvoices(invoicesData.map(mapInvoiceRowToInvoice));

        // Fetch Attributes (simple array)
        const { data: attributesData, error: attributesError } = await supabase
          .from('product_attributes') // Assuming a product_attributes table if attributes are dynamic
          .select('*');
        if (attributesError) throw attributesError;
        setAttributes(attributesData as ProductAttribute[]); // Adjust if mapping needed

        // Fetch Company Settings (single row)
        const { data: companySettingsData, error: companySettingsError } = await supabase
          .from('company_settings')
          .select('*')
          .single();
        if (companySettingsError) throw companySettingsError;
        setCompanySettings(mapCompanySettingsRowToCompanySettings(companySettingsData as CompanySettingsRow));

        // Fetch Rental Settings (single row)
        const { data: rentalSettingsData, error: rentalSettingsError } = await supabase
          .from('rental_settings')
          .select('*')
          .single();
        if (rentalSettingsError) throw rentalSettingsError;
        setRentalSettings(mapRentalSettingsRowToRentalSettings(rentalSettingsData as RentalSettingsRow));

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        // Fallback to mock data on error
        setProducts(mockProducts);
        setOrders(mockOrders);
        setQuotations(mockQuotations);
        setInvoices(mockInvoices);
        setAttributes(mockAttributes);
        setCompanySettings(defaultCompanySettings);
        setRentalSettings(defaultRentalSettings);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [useSupabase, isAuthenticated, user?.id]); // Re-run when auth state changes

  // Product operations
  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'vendorId' | 'quantityWithCustomer'>): Promise<Product | null> => {
    if (!useSupabase || !supabase || !isAuthenticated || !user) {
      const newProduct: Product = {
        ...product,
        id: generateId('prod'),
        createdAt: new Date(),
        vendorId: user?.id || 'mock-vendor',
        quantityWithCustomer: 0,
      };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    }
    const newProductData = {
      name: product.name,
      description: product.description,
      category: product.category,
      images: product.images,
      cost_price: product.costPrice,
      sales_price: product.salesPrice,
      rental_price_hourly: product.rentalPrices.hourly,
      rental_price_daily: product.rentalPrices.daily,
      rental_price_weekly: product.rentalPrices.weekly,
      rental_price_monthly: product.rentalPrices.monthly,
      rental_price_yearly: product.rentalPrices.yearly,
      quantity_on_hand: product.quantityOnHand,
      is_rentable: product.isRentable,
      is_published: product.isPublished,
      attributes: product.attributes,
      vendor_id: user.id,
    };
    const { data: newProductRow, error } = await supabase.from('products').insert(newProductData).select('*').single();
    if (error) {
      console.error('Error adding product:', error);
      return null;
    }
    const newProduct = mapProductRowToProduct(newProductRow as ProductRow);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, [useSupabase, isAuthenticated, user]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return;
    }
    const updateData: Partial<ProductRow> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.costPrice !== undefined) updateData.cost_price = updates.costPrice;
    if (updates.salesPrice !== undefined) updateData.sales_price = updates.salesPrice;
    if (updates.rentalPrices?.hourly !== undefined) updateData.rental_price_hourly = updates.rentalPrices.hourly;
    if (updates.rentalPrices?.daily !== undefined) updateData.rental_price_daily = updates.rentalPrices.daily;
    if (updates.rentalPrices?.weekly !== undefined) updateData.rental_price_weekly = updates.rentalPrices.weekly;
    if (updates.rentalPrices?.monthly !== undefined) updateData.rental_price_monthly = updates.rentalPrices.monthly;
    if (updates.rentalPrices?.yearly !== undefined) updateData.rental_price_yearly = updates.rentalPrices.yearly;
    if (updates.quantityOnHand !== undefined) updateData.quantity_on_hand = updates.quantityOnHand;
    if (updates.isRentable !== undefined) updateData.is_rentable = updates.isRentable;
    if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished;
    if (updates.attributes !== undefined) updateData.attributes = updates.attributes;
    if (updates.quantityWithCustomer !== undefined) updateData.quantity_with_customer = updates.quantityWithCustomer;

    const { error } = await supabase.from('products').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating product:', error);
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [useSupabase]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    if (!useSupabase || !supabase) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  }, [useSupabase]);

  // Order operations
  const addOrder = useCallback(async (order: Omit<RentalOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentalOrder | null> => {
    if (!useSupabase || !supabase || !user) {
      const newOrder: RentalOrder = {
        ...order,
        id: generateId('order'),
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId: user?.id || 'mock-customer',
      };
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    }
    const newOrderData = {
      customer_id: user.id,
      customer_name: user.name,
      vendor_id: order.vendorId,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      security_deposit: order.securityDeposit,
      pickup_date: order.pickupDate?.toISOString() || null,
      return_date: order.returnDate?.toISOString() || null,
      actual_return_date: order.actualReturnDate?.toISOString() || null,
      late_fee: order.lateFee,
      notes: order.notes,
    };
    const { data: newOrderRow, error } = await supabase.from('orders').insert(newOrderData).select('*').single();
    if (error) {
      console.error('Error adding order:', error);
      return null;
    }
    // Add order lines
    const orderLines = order.lines.map(line => ({
      order_id: newOrderRow.id,
      product_id: line.productId,
      product_name: line.productName,
      quantity: line.quantity,
      rental_period: line.rentalPeriod,
      start_date: line.startDate.toISOString(),
      end_date: line.endDate.toISOString(),
      price_per_period: line.pricePerPeriod,
      total_price: line.totalPrice,
    }));
    const { error: linesError } = await supabase.from('order_lines').insert(orderLines);
    if (linesError) {
      console.error('Error adding order lines:', linesError);
      // Consider rolling back the order if lines fail
    }
    const newOrder = mapOrderRowToOrder(newOrderRow as OrderRow);
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, [useSupabase, user]);

  const updateOrder = useCallback(async (id: string, updates: Partial<RentalOrder>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o));
      return;
    }
    const updateData: Partial<OrderRow> = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.pickupDate !== undefined) updateData.pickup_date = updates.pickupDate?.toISOString() || null;
    if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate?.toISOString() || null;
    if (updates.actualReturnDate !== undefined) updateData.actual_return_date = updates.actualReturnDate?.toISOString() || null;
    if (updates.lateFee !== undefined) updateData.late_fee = updates.lateFee;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating order:', error);
      return;
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o));
  }, [useSupabase]);

  // Quotation operations
  const addQuotation = useCallback(async (quotation: Omit<Quotation, 'id' | 'createdAt'>): Promise<Quotation | null> => {
    if (!useSupabase || !supabase || !user) {
      const newQuotation: Quotation = {
        ...quotation,
        id: generateId('quote'),
        createdAt: new Date(),
        customerId: user?.id || 'mock-customer',
      };
      setQuotations(prev => [...prev, newQuotation]);
      return newQuotation;
    }
    const newQuotationData = {
      customer_id: user.id,
      customer_name: user.name,
      status: quotation.status,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      valid_until: quotation.validUntil.toISOString(),
      notes: quotation.notes,
    };
    const { data: newQuotationRow, error } = await supabase.from('quotations').insert(newQuotationData).select('*').single();
    if (error) {
      console.error('Error adding quotation:', error);
      return null;
    }
    // Add quotation lines
    const quotationLines = quotation.lines.map(line => ({
      quotation_id: newQuotationRow.id,
      product_id: line.productId,
      product_name: line.productName,
      quantity: line.quantity,
      rental_period: line.rentalPeriod,
      start_date: line.startDate.toISOString(),
      end_date: line.endDate.toISOString(),
      price_per_period: line.pricePerPeriod,
      total_price: line.totalPrice,
    }));
    const { error: linesError } = await supabase.from('quotation_lines').insert(quotationLines);
    if (linesError) {
      console.error('Error adding quotation lines:', linesError);
    }
    const newQuotation = mapQuotationRowToQuotation(newQuotationRow as QuotationRow);
    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  }, [useSupabase, user]);

  const updateQuotation = useCallback(async (id: string, updates: Partial<Quotation>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
      return;
    }
    const updateData: Partial<QuotationRow> = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.validUntil !== undefined) updateData.valid_until = updates.validUntil.toISOString();
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase.from('quotations').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating quotation:', error);
      return;
    }
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, [useSupabase]);

  const convertQuotationToOrder = useCallback(async (quotationId: string): Promise<RentalOrder | null> => {
    if (!useSupabase || !supabase || !user) {
      const quotation = quotations.find(q => q.id === quotationId);
      if (!quotation) return null;
      const securityDeposit = quotation.total * (defaultCompanySettings.securityDepositPercent / 100);
      const newOrder = mockOrders.find(o => o.id === generateId('order')); // Mock conversion
      setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'accepted' } : q));
      if (newOrder) {
        setOrders(prev => [...prev, newOrder]);
      }
      return newOrder || null;
    }

    const { data: quotationRow, error: fetchError } = await supabase
      .from('quotations')
      .select('*, quotation_lines(*)')
      .eq('id', quotationId)
      .single();
    if (fetchError || !quotationRow) {
      console.error('Error fetching quotation for conversion:', fetchError);
      return null;
    }

    const quotation = mapQuotationRowToQuotation(quotationRow as QuotationRow);
    // Re-map lines for order creation (adjust types if needed)
    const orderLines = quotationRow.quotation_lines.map((line: QuotationLineRow) => ({
      productId: line.product_id,
      productName: line.product_name,
      quantity: line.quantity,
      rentalPeriod: line.rental_period,
      startDate: new Date(line.start_date),
      endDate: new Date(line.end_date),
      pricePerPeriod: line.price_per_period,
      totalPrice: line.total_price,
    }));

    const securityDeposit = quotation.total * (companySettings?.securityDepositPercent || defaultCompanySettings.securityDepositPercent / 100);

    const newOrderData = {
      customer_id: quotation.customerId,
      customer_name: quotation.customerName,
      vendor_id: quotationRow.vendor_id, // Assuming vendor_id is available in quotationRow or lines
      status: 'confirmed',
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      security_deposit: securityDeposit,
      late_fee: 0,
      notes: quotation.notes,
    };
    const { data: newOrderRow, error: orderError } = await supabase.from('orders').insert(newOrderData).select('*').single();
    if (orderError) {
      console.error('Error converting quotation to order:', orderError);
      return null;
    }
    const newOrder = mapOrderRowToOrder(newOrderRow as OrderRow);
    setOrders(prev => [...prev, newOrder]);

    // Update quotation status
    await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quotationId);
    setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'accepted' } : q));

    // Insert order lines
    const linesToInsert = orderLines.map((line: RentalOrderLine) => ({
      order_id: newOrder.id,
      product_id: line.productId,
      product_name: line.productName,
      quantity: line.quantity,
      rental_period: line.rentalPeriod,
      start_date: line.startDate.toISOString(),
      end_date: line.endDate.toISOString(),
      price_per_period: line.pricePerPeriod,
      total_price: line.totalPrice,
    }));
    const { error: orderLinesError } = await supabase.from('order_lines').insert(linesToInsert);
    if (orderLinesError) {
      console.error('Error inserting order lines during conversion:', orderLinesError);
    }
    return newOrder;
  }, [useSupabase, user, quotations, companySettings]);

  // Invoice operations
  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice | null> => {
    if (!useSupabase || !supabase || !user) {
      const newInvoice: Invoice = {
        ...invoice,
        id: generateId('inv'),
        createdAt: new Date(),
        customerId: user?.id || 'mock-customer',
      };
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    }
    const newInvoiceData = {
      order_id: invoice.orderId,
      customer_id: user.id,
      customer_name: user.name,
      items: invoice.items, // Ensure items are JSONB compatible
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      security_deposit: invoice.securityDeposit,
      late_fee: invoice.lateFee,
      total: invoice.total,
      amount_paid: invoice.amountPaid,
      amount_due: invoice.amountDue,
      status: invoice.status,
      payment_method: invoice.paymentMethod,
      due_date: invoice.dueDate.toISOString(),
      paid_at: invoice.paidAt?.toISOString() || null,
    };
    const { data: newInvoiceRow, error } = await supabase.from('invoices').insert(newInvoiceData).select('*').single();
    if (error) {
      console.error('Error adding invoice:', error);
      return null;
    }
    const newInvoice = mapInvoiceRowToInvoice(newInvoiceRow as InvoiceRow);
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [useSupabase, user]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      return;
    }
    const updateData: Partial<InvoiceRow> = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.amountPaid !== undefined) updateData.amount_paid = updates.amountPaid;
    if (updates.amountDue !== undefined) updateData.amount_due = updates.amountDue;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.paidAt !== undefined) updateData.paid_at = updates.paidAt?.toISOString() || null;

    const { error } = await supabase.from('invoices').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating invoice:', error);
      return;
    }
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [useSupabase]);

  // Settings operations
  const updateAttributes = useCallback(async (attrs: ProductAttribute[]): Promise<void> => {
    if (!useSupabase || !supabase) {
      setAttributes(attrs);
      return;
    }
    // Assuming a way to update attributes in Supabase, e.g., a settings table or direct update
    // For now, only mock update is implemented for attributes unless a specific table is defined.
    // If product_attributes is a table, each attribute would be an upsert/update operation.
    // For simplicity, we'll keep this mocked if there isn't a clear table for dynamic attributes.
    setAttributes(attrs);
  }, [useSupabase]);

  const updateCompanySettings = useCallback(async (settings: Partial<CompanySettings>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setCompanySettings(prev => ({ ...prev, ...settings }));
      return;
    }
    const { error } = await supabase.from('company_settings').update({
      name: settings.name,
      gstin: settings.gstin,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      logo_url: settings.logo ?? null,
      tax_rate: settings.taxRate,
      security_deposit_percent: settings.securityDepositPercent,
      late_fee_per_day: settings.lateFeePerDay,
      updated_at: new Date().toISOString(),
    }).eq('id', companySettings?.id || 'mock-id'); // Assuming a single row with a known ID or upsert logic
    if (error) {
      console.error('Error updating company settings:', error);
      return;
    }
    setCompanySettings(prev => prev ? { ...prev, ...settings } : defaultCompanySettings);
  }, [useSupabase, companySettings]);

  const updateRentalSettings = useCallback(async (settings: Partial<RentalSettings>): Promise<void> => {
    if (!useSupabase || !supabase) {
      setRentalSettings(prev => ({ ...prev, ...settings }));
      return;
    }
    const { error } = await supabase.from('rental_settings').update({
      allow_hourly: settings.allowHourly,
      allow_daily: settings.allowDaily,
      allow_weekly: settings.allowWeekly,
      min_rental_hours: settings.minRentalHours,
      max_rental_days: settings.maxRentalDays,
      advance_booking_days: settings.advanceBookingDays,
      updated_at: new Date().toISOString(),
    }).eq('id', rentalSettings?.id || 'mock-id'); // Assuming a single row with a known ID or upsert logic
    if (error) {
      console.error('Error updating rental settings:', error);
      return;
    }
    setRentalSettings(prev => prev ? { ...prev, ...settings } : defaultRentalSettings);
  }, [useSupabase, rentalSettings]);

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
    isLoadingData,
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
