# How to Update Supabase API Keys & Why Auth Data Might Not Show

## 1. Update your Supabase keys in this project

### Step 1: Get your keys from Supabase

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project (or create one).
2. Click the **gear icon** (Project Settings) in the left sidebar.
3. Go to **API**.
4. Copy these (all on the same API page):
   - **Project URL** → e.g. `https://abcdefgh.supabase.co` → use for `VITE_SUPABASE_URL`
   - **Project ID** → the ref part only, e.g. `abcdefgh` (from the URL) → use for `VITE_SUPABASE_PROJECT_ID` *(optional if you set URL)*
   - **Publishable API key (anon public)** → under "Project API keys", the **anon public** key → use for `VITE_SUPABASE_PUBLISHABLE_KEY`  
     *(Do **not** use the `service_role` key in the frontend.)*

### Step 2: Put them in `.env`

1. In the **root** of this project (same folder as `package.json`), create or edit a file named **`.env`** (no filename before the dot).
2. Copy from `.env.example` and fill in your values:

```env
# Project ID (ref from URL, e.g. "abcdefgh")
VITE_SUPABASE_PROJECT_ID="your-project-id"

# Project URL (or we build it from Project ID)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Publishable API key from Dashboard → API
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-api-key"
```

3. You can set **either** `VITE_SUPABASE_URL` **or** `VITE_SUPABASE_PROJECT_ID` (or both). The app builds the URL as `https://PROJECT_ID.supabase.co` if URL is missing.

### Step 3: Restart the app

- Stop the dev server (Ctrl+C) and run **`npm run dev`** again.  
- Vite only reads `.env` when the server starts, so changes to `.env` do not apply until you restart.

---

## 2. Why auth data might not be stored / visible in Supabase

Even after connecting the app with the correct URL and publishable API key, auth can seem “not stored” for these reasons:

### 1. App is not actually using Supabase (still on fallback)

- The app only uses Supabase when **both** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env`.
- If either is missing, wrong, or has extra spaces/quotes, the app falls back to **localStorage** (no data in Supabase).
- **Fix:** Double-check `.env` in the project root, restart `npm run dev`, and try sign-up again. In the browser console you should **not** see: *"Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY"*.

### 2. Schema and trigger not run in your project

- **Auth users** are stored in Supabase’s built-in **Authentication** (e.g. **Authentication → Users** in the dashboard).
- **Profiles** (name, email, role, etc.) are stored in a **table** `public.profiles`. That table and a **trigger** that creates a profile when a user signs up must exist in **this** Supabase project.
- If you never ran the project’s SQL in **this** project, the `profiles` table and the trigger don’t exist, so:
  - Sign-up can still create a row in **Authentication → Users**,
  - but no row is created in **profiles**, and the app may not find a “user” after login.
- **Fix:** In Supabase Dashboard → **SQL Editor** → New query, paste the **entire** contents of `supabase/schema.sql` from this repo and click **Run**. That creates tables and the trigger so every new sign-up also gets a row in `profiles`.

### 3. You’re looking in the wrong place

- **Auth data** (email, sign-up time, etc.) → **Authentication** tab → **Users**.
- **App profile data** (name, role, company_name, etc.) → **Table Editor** → **`profiles`**.
- **Fix:** Check both **Authentication → Users** and **Table Editor → profiles** after signing up.

### 4. Email confirmation is on

- If **Authentication → Providers → Email → Confirm email** is enabled, Supabase **does** store the user (in Authentication and, if the trigger ran, in `profiles`), but the user has no session until they confirm their email.
- So “auth is stored” but they can’t sign in until they click the confirmation link.
- **Fix:** Either confirm the email from the link Supabase sends, or turn off **Confirm email** in **Authentication → Providers → Email** for easier testing.

### 5. Wrong Supabase project

- You might have updated `.env` with keys from **Project A** but are looking at **Project B** in the dashboard.
- **Fix:** Make sure the **Project URL** in your `.env** matches the project you’re viewing (check the URL in the browser when you’re in the dashboard).

### 6. Trigger or RLS blocking inserts

- The trigger that creates a row in `profiles` runs **after** a row is inserted into `auth.users`. If the trigger was not created or failed, `profiles` stays empty.
- **Fix:** Run `supabase/schema.sql` in the SQL Editor as in (2). If you already ran it, run again the part that creates `handle_new_user` and the trigger `on_auth_user_created` so they exist in the current project.

---

## 3. Quick checklist

- [ ] `.env` exists in the **project root** (next to `package.json`).
- [ ] `.env` has **exactly** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (no typos).
- [ ] Values are from **Project Settings → API** (Project URL + anon public key).
- [ ] Dev server was **restarted** after changing `.env`.
- [ ] In the **same** Supabase project, **SQL Editor** was used to run **all** of `supabase/schema.sql`.
- [ ] Check **Authentication → Users** and **Table Editor → profiles** after a new sign-up.

After this, updating your Supabase project URL and API keys in `.env` and running the schema will store auth (and profile) data in your Supabase project.
