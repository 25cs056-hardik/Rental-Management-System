# Supabase setup for RentRight Manager

## 1. Create tables in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Open `schema.sql` in this folder, copy all its contents, and paste into the SQL Editor.
4. Click **Run** to create all tables, indexes, and policies.

## 2. Fill in your `.env` (project root)

Get these from **Project Settings** → **API** in the Supabase dashboard:

- **VITE_SUPABASE_URL** — Project URL (e.g. `https://xxxxx.supabase.co`).
- **VITE_SUPABASE_PUBLISHABLE_KEY** — publishable API key (anon public; not the service_role key).

Copy `.env.example` to `.env` and replace the placeholders with your values. Restart the dev server after changing `.env`. See **SUPABASE_SETUP.md** in the project root for step-by-step instructions and why auth data might not appear.

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

**Note:** `profiles.id` references `auth.users(id)`. The schema includes a trigger `on_auth_user_created` that automatically creates a row in `profiles` when someone signs up via Supabase Auth, so sign-up and sign-in work with the same account.

**Important:** In Supabase Dashboard → **Authentication** → **Providers** → **Email**, you can turn off **Confirm email** if you want users to sign in immediately after sign-up without confirming their email. Otherwise, users must confirm their email before they can sign in.
