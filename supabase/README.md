# Supabase setup for RentRight Manager

## 1. Create tables in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Open `schema.sql` in this folder, copy all its contents, and paste into the SQL Editor.
4. Click **Run** to create all tables, indexes, and policies.

## 2. Fill in your `.env` (project root)

Get these from **Project Settings** → **API** in the Supabase dashboard:

- **VITE_SUPABASE_PROJECT_ID** — The project ref (the part before `.supabase.co` in your Project URL).
- **VITE_SUPABASE_URL** — Project URL (e.g. `https://xxxxx.supabase.co`).
- **VITE_SUPABASE_ANON_KEY** — anon public key.

Replace the placeholders in the root `.env` file with these values.

## Tables created

| Table              | Purpose                          |
|--------------------|-----------------------------------|
| `profiles`         | Users (links to Supabase Auth)   |
| `addresses`        | User addresses                   |
| `products`         | Rental products                  |
| `product_variants` | Product variants                 |
| `orders`           | Rental orders                    |
| `order_lines`      | Order line items                 |
| `quotations`       | Quotations                       |
| `quotation_lines`  | Quotation line items             |
| `invoices`         | Invoices                         |
| `company_settings` | Company config (single row)      |
| `rental_settings`  | Rental rules (single row)        |

**Note:** `profiles.id` references `auth.users(id)`. Create users via Supabase Auth (e.g. sign up) so you can insert rows into `profiles` and other tables that reference it.
