import {
  User, Product, RentalOrder, Quotation, Invoice,
  ProductAttribute, CompanySettings, RentalSettings,
  DashboardMetrics, ChartDataPoint
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@rental.com',
    role: 'admin',
    companyName: 'Rental Corp',
    gstin: '29ABCDE1234F1Z5',
    phone: '+91 9876543210',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'vendor-1',
    name: 'Vendor One',
    email: 'vendor@rental.com',
    role: 'vendor',
    companyName: 'Equipment Rentals Ltd',
    gstin: '27XYZAB5678G2H3',
    phone: '+91 9876543211',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'customer-1',
    name: 'John Customer',
    email: 'customer@email.com',
    role: 'customer',
    companyName: 'ABC Enterprises',
    gstin: '33PQRST9012I4J6',
    phone: '+91 9876543212',
    address: {
      id: 'addr-1',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
    createdAt: new Date('2024-03-01'),
  },
];

// Mock Product Attributes
export const mockAttributes: ProductAttribute[] = [
  { id: 'attr-1', name: 'Brand', values: ['Sony', 'Canon', 'Nikon', 'Panasonic', 'JBL'] },
  { id: 'attr-2', name: 'Color', values: ['Black', 'White', 'Silver', 'Red', 'Blue'] },
  { id: 'attr-3', name: 'Size', values: ['Small', 'Medium', 'Large', 'XL'] },
  { id: 'attr-4', name: 'Condition', values: ['New', 'Like New', 'Good', 'Fair'] },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Professional DSLR Camera',
    description: 'High-end DSLR camera perfect for professional photography and videography.',
    category: 'Cameras',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 85000,
    salesPrice: 120000,
    rentalPrices: { hourly: 500, daily: 2500, weekly: 12000, monthly: 60000, yearly: 600000 },
    quantityOnHand: 5,
    quantityWithCustomer: 2,
    isRentable: true,
    isPublished: true,
    attributes: { Brand: 'Canon', Color: 'Black', Condition: 'New' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'prod-2',
    name: 'Professional Video Camera',
    description: '4K video camera with advanced stabilization for professional video production.',
    category: 'Cameras',
    images: ['https://images.unsplash.com/photo-1588483977959-58b122f6d0f6?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 150000,
    salesPrice: 200000,
    rentalPrices: { hourly: 800, daily: 4000, weekly: 20000, monthly: 96000, yearly: 960000 },
    quantityOnHand: 3,
    quantityWithCustomer: 1,
    isRentable: true,
    isPublished: true,
    attributes: { Brand: 'Sony', Color: 'Black', Condition: 'New' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'prod-3',
    name: 'Portable PA System',
    description: 'Complete portable PA system with speakers, mixer, and microphones.',
    category: 'Audio',
    images: ['https://images.unsplash.com/photo-1520529986492-9a4f487cb71a?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 45000,
    salesPrice: 65000,
    rentalPrices: { hourly: 300, daily: 1500, weekly: 7500, monthly: 36000, yearly: 360000 },
    quantityOnHand: 8,
    quantityWithCustomer: 3,
    isRentable: true,
    isPublished: true,
    attributes: { Brand: 'JBL', Color: 'Black', Condition: 'Like New' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'prod-4',
    name: 'LED Lighting Kit',
    description: 'Professional LED lighting kit for photography and video production.',
    category: 'Lighting',
    images: ['https://images.unsplash.com/photo-1554593442-99933583c267?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 25000,
    salesPrice: 35000,
    rentalPrices: { hourly: 200, daily: 1000, weekly: 5000, monthly: 24000, yearly: 240000 },
    quantityOnHand: 10,
    quantityWithCustomer: 4,
    isRentable: true,
    isPublished: true,
    attributes: { Brand: 'Nikon', Color: 'Black', Condition: 'Good' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'prod-5',
    name: 'Projector HD',
    description: 'Full HD projector for presentations and home theater.',
    category: 'Display',
    images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 55000,
    salesPrice: 75000,
    rentalPrices: { hourly: 400, daily: 2000, weekly: 10000, monthly: 48000, yearly: 480000 },
    quantityOnHand: 6,
    quantityWithCustomer: 1,
    isRentable: true,
    isPublished: true,
    attributes: { Brand: 'Panasonic', Color: 'White', Condition: 'New' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'prod-6',
    name: 'Drone Professional',
    description: 'Professional drone with 4K camera and 30 min flight time.',
    category: 'Drones',
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1000&auto=format&fit=crop'],
    costPrice: 120000,
    salesPrice: 160000,
    rentalPrices: { hourly: 1000, daily: 5000, weekly: 25000, monthly: 120000, yearly: 1200000 },
    quantityOnHand: 4,
    quantityWithCustomer: 2,
    isRentable: true,
    isPublished: false,
    attributes: { Brand: 'Sony', Color: 'Silver', Condition: 'New' },
    variants: [],
    vendorId: 'vendor-1',
    createdAt: new Date('2024-03-01'),
  },
];

// Mock Orders
export const mockOrders: RentalOrder[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    customerName: 'John Customer',
    vendorId: 'vendor-1',
    lines: [
      {
        id: 'line-1',
        productId: 'prod-1',
        productName: 'Professional DSLR Camera',
        quantity: 1,
        rentalPeriod: 'daily',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05'),
        pricePerPeriod: 2500,
        totalPrice: 10000,
      },
    ],
    status: 'active',
    subtotal: 10000,
    tax: 1800,
    total: 11800,
    securityDeposit: 5000,
    pickupDate: new Date('2024-06-01'),
    returnDate: new Date('2024-06-05'),
    lateFee: 0,
    notes: 'Handle with care',
    createdAt: new Date('2024-05-28'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: 'order-2',
    customerId: 'customer-1',
    customerName: 'John Customer',
    vendorId: 'vendor-1',
    lines: [
      {
        id: 'line-2',
        productId: 'prod-3',
        productName: 'Portable PA System',
        quantity: 2,
        rentalPeriod: 'weekly',
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-24'),
        pricePerPeriod: 7500,
        totalPrice: 30000,
      },
    ],
    status: 'confirmed',
    subtotal: 30000,
    tax: 5400,
    total: 35400,
    securityDeposit: 10000,
    pickupDate: new Date('2024-06-10'),
    returnDate: new Date('2024-06-24'),
    lateFee: 0,
    notes: '',
    createdAt: new Date('2024-06-05'),
    updatedAt: new Date('2024-06-05'),
  },
  {
    id: 'order-3',
    customerId: 'customer-1',
    customerName: 'John Customer',
    vendorId: 'vendor-1',
    lines: [
      {
        id: 'line-3',
        productId: 'prod-5',
        productName: 'Projector HD',
        quantity: 1,
        rentalPeriod: 'daily',
        startDate: new Date('2024-05-20'),
        endDate: new Date('2024-05-22'),
        pricePerPeriod: 2000,
        totalPrice: 4000,
      },
    ],
    status: 'completed',
    subtotal: 4000,
    tax: 720,
    total: 4720,
    securityDeposit: 2000,
    pickupDate: new Date('2024-05-20'),
    returnDate: new Date('2024-05-22'),
    actualReturnDate: new Date('2024-05-23'),
    lateFee: 500,
    notes: 'Returned 1 day late',
    createdAt: new Date('2024-05-18'),
    updatedAt: new Date('2024-05-23'),
  },
];

// Mock Quotations
export const mockQuotations: Quotation[] = [
  {
    id: 'quote-1',
    customerId: 'customer-1',
    customerName: 'John Customer',
    lines: [
      {
        id: 'qline-1',
        productId: 'prod-2',
        productName: 'Professional Video Camera',
        quantity: 1,
        rentalPeriod: 'weekly',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-08'),
        pricePerPeriod: 20000,
        totalPrice: 20000,
      },
    ],
    status: 'sent',
    subtotal: 20000,
    tax: 3600,
    total: 23600,
    validUntil: new Date('2024-06-30'),
    notes: 'For corporate event',
    createdAt: new Date('2024-06-15'),
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    orderId: 'order-3',
    customerId: 'customer-1',
    customerName: 'John Customer',
    items: mockOrders[2].lines,
    subtotal: 4000,
    tax: 720,
    securityDeposit: 2000,
    lateFee: 500,
    total: 5220,
    amountPaid: 5220,
    amountDue: 0,
    status: 'paid',
    paymentMethod: 'upi',
    dueDate: new Date('2024-05-25'),
    paidAt: new Date('2024-05-24'),
    createdAt: new Date('2024-05-23'),
  },
  {
    id: 'inv-2',
    orderId: 'order-1',
    customerId: 'customer-1',
    customerName: 'John Customer',
    items: mockOrders[0].lines,
    subtotal: 10000,
    tax: 1800,
    securityDeposit: 5000,
    lateFee: 0,
    total: 16800,
    amountPaid: 5000,
    amountDue: 11800,
    status: 'partial',
    paymentMethod: 'card',
    dueDate: new Date('2024-06-10'),
    createdAt: new Date('2024-06-01'),
  },
];

// Company Settings
export const defaultCompanySettings: CompanySettings = {
  id: 'settings-1',
  name: 'Rental Management Corp',
  gstin: '29ABCDE1234F1Z5',
  address: '123 Business Park, Tech City, State 400001',
  phone: '+91 9876543210',
  email: 'contact@rentalcorp.com',
  taxRate: 18,
  securityDepositPercent: 25,
  lateFeePerDay: 500,
};

// Rental Settings
export const defaultRentalSettings: RentalSettings = {
  id: 'rental-settings-1',
  allowHourly: true,
  allowDaily: true,
  allowWeekly: true,
  minRentalHours: 2,
  maxRentalDays: 90,
  advanceBookingDays: 60,
};

// Dashboard Mock Data
export const getDashboardMetrics = (): DashboardMetrics => ({
  totalRevenue: 285000,
  activeRentals: 12,
  totalProducts: mockProducts.length,
  totalCustomers: 45,
  pendingReturns: 3,
  overdueReturns: 1,
});

export const getRevenueChartData = (): ChartDataPoint[] => [
  { name: 'Jan', value: 35000 },
  { name: 'Feb', value: 42000 },
  { name: 'Mar', value: 38000 },
  { name: 'Apr', value: 55000 },
  { name: 'May', value: 48000 },
  { name: 'Jun', value: 67000 },
];

export const getTopProductsData = (): ChartDataPoint[] => [
  { name: 'DSLR Camera', value: 45 },
  { name: 'PA System', value: 38 },
  { name: 'Projector', value: 32 },
  { name: 'Video Camera', value: 28 },
  { name: 'LED Kit', value: 22 },
];

export const getOrderStatusData = (): ChartDataPoint[] => [
  { name: 'Active', value: 12, fill: 'hsl(var(--success))' },
  { name: 'Confirmed', value: 8, fill: 'hsl(var(--primary))' },
  { name: 'Completed', value: 45, fill: 'hsl(var(--muted))' },
  { name: 'Cancelled', value: 3, fill: 'hsl(var(--destructive))' },
];

// Categories
export const productCategories = [
  'Cameras',
  'Audio',
  'Lighting',
  'Display',
  'Drones',
  'Accessories',
];

// Helper Functions
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const calculateRentalPrice = (
  product: Product,
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  quantity: number,
  daysOrHours: number,
  options?: { isHours?: boolean; months?: number; years?: number }
): number => {
  const prices = product.rentalPrices;
  let total = 0;
  if (period === 'hourly' && options?.isHours) {
    total = prices.hourly * daysOrHours * quantity;
  } else if (period === 'daily') {
    total = prices.daily * daysOrHours * quantity;
  } else if (period === 'weekly') {
    total = prices.weekly * Math.ceil(daysOrHours / 7) * quantity;
  } else if (period === 'monthly' && options?.months != null) {
    total = prices.monthly * options.months * quantity;
  } else if (period === 'yearly' && options?.years != null) {
    total = prices.yearly * options.years * quantity;
  } else {
    total = prices.daily * daysOrHours * quantity;
  }
  return total;
};

// GSTIN Validation
export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

// Email Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
