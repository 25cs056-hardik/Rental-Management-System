-- RentRight Manager - Supabase Schema
-- Copy and paste this entire file into Supabase Dashboard → SQL Editor → New query → Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES (extends auth.users - link to your app users)
-- =============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
  company_name TEXT NOT NULL DEFAULT '',
  gstin TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TRIGGER: Create profile when a new auth user signs up
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ADDRESSES
-- =============================================================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PRODUCTS
-- =============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rental_price_hourly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rental_price_daily NUMERIC(12, 2) NOT NULL DEFAULT 0,
  rental_price_weekly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_with_customer INTEGER NOT NULL DEFAULT 0,
  is_rentable BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  attributes JSONB DEFAULT '{}',
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PRODUCT VARIANTS (optional - for products with size/color etc.)
-- =============================================================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attributes JSONB NOT NULL DEFAULT '{}',
  price_modifier NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- RENTAL ORDERS
-- =============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'confirmed', 'active', 'completed', 'cancelled')),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pickup_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  late_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ORDER LINES
-- =============================================================================
CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rental_period TEXT NOT NULL CHECK (rental_period IN ('hourly', 'daily', 'weekly', 'custom')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_per_period NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- QUOTATIONS
-- =============================================================================
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- QUOTATION LINES
-- =============================================================================
CREATE TABLE quotation_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rental_period TEXT NOT NULL CHECK (rental_period IN ('hourly', 'daily', 'weekly', 'custom')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_per_period NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INVOICES
-- =============================================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  late_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  amount_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer')),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- COMPANY SETTINGS (single row)
-- =============================================================================
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gstin TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  logo_url TEXT,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18,
  security_deposit_percent NUMERIC(5, 2) NOT NULL DEFAULT 25,
  late_fee_per_day NUMERIC(12, 2) NOT NULL DEFAULT 500,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- RENTAL SETTINGS (single row)
-- =============================================================================
CREATE TABLE rental_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allow_hourly BOOLEAN NOT NULL DEFAULT TRUE,
  allow_daily BOOLEAN NOT NULL DEFAULT TRUE,
  allow_weekly BOOLEAN NOT NULL DEFAULT TRUE,
  min_rental_hours INTEGER NOT NULL DEFAULT 2,
  max_rental_days INTEGER NOT NULL DEFAULT 90,
  advance_booking_days INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_lines_order ON order_lines(order_id);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- =============================================================================
-- UPDATED_AT TRIGGER (for orders)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - enable and add policies as needed
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_settings ENABLE ROW LEVEL SECURITY;

-- Example: users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Allow authenticated users to manage their own addresses
CREATE POLICY "Users can insert own address" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own address" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own address" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Allow vendors to manage their own products
CREATE POLICY "Vendors can insert own product" ON products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own product" ON products
  FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own product" ON products
  FOR DELETE USING (auth.uid() = vendor_id);

-- Allow customers to create and view their own orders/quotations
CREATE POLICY "Customers can insert own order" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own order" ON orders
  FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own order line" ON order_lines
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));
CREATE POLICY "Customers can update own order line" ON order_lines
  FOR UPDATE USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));

CREATE POLICY "Customers can insert own quotation" ON quotations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own quotation" ON quotations
  FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own quotation line" ON quotation_lines
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM quotations WHERE id = quotation_id AND customer_id = auth.uid()));
CREATE POLICY "Customers can update own quotation line" ON quotation_lines
  FOR UPDATE USING (EXISTS (SELECT 1 FROM quotations WHERE id = quotation_id AND customer_id = auth.uid()));

-- Allow admins to manage company and rental settings (assuming 'admin' role in profiles)
CREATE POLICY "Admins can manage company settings" ON company_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can manage rental settings" ON rental_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Allow read for anon/authenticated (adjust for your auth setup)
CREATE POLICY "Allow read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow read orders for own" ON orders
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = vendor_id);

-- Add more policies per your app's auth rules (admin, vendor, customer).
