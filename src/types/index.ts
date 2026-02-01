// User & Authentication Types
export type UserRole = 'admin' | 'vendor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  gstin?: string;
  phone?: string;
  address?: Address;
  createdAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// Product Types
export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  priceModifier: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  costPrice: number;
  salesPrice: number;
  rentalPrices: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  quantityOnHand: number;
  quantityWithCustomer: number;
  isRentable: boolean;
  isPublished: boolean;
  attributes: Record<string, string>;
  variants: ProductVariant[];
  vendorId: string;
  createdAt: Date;
}

// Order & Quotation Types
export type OrderStatus = 'draft' | 'sent' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface RentalOrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rentalPeriod: RentalPeriod;
  startDate: Date;
  endDate: Date;
  pricePerPeriod: number;
  totalPrice: number;
}

export interface RentalOrder {
  id: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  lines: RentalOrderLine[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  securityDeposit: number;
  pickupDate?: Date;
  returnDate?: Date;
  actualReturnDate?: Date;
  lateFee: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  lines: RentalOrderLine[];
  status: QuotationStatus;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: Date;
  notes: string;
  createdAt: Date;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer';

export interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  items: RentalOrderLine[];
  subtotal: number;
  tax: number;
  securityDeposit: number;
  lateFee: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  rentalPeriod: RentalPeriod;
  startDate: Date;
  endDate: Date;
  pricePerPeriod: number;
}

// Dashboard Types
export interface DashboardMetrics {
  totalRevenue: number;
  activeRentals: number;
  totalProducts: number;
  totalCustomers: number;
  pendingReturns: number;
  overdueReturns: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Settings Types
export interface CompanySettings {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  taxRate: number;
  securityDepositPercent: number;
  lateFeePerDay: number;
}

export interface RentalSettings {
  id: string;
  allowHourly: boolean;
  allowDaily: boolean;
  allowWeekly: boolean;
  minRentalHours: number;
  maxRentalDays: number;
  advanceBookingDays: number;
}
