-- ============================================================
-- SUPABASE CLOUD POSTGRESQL DATABASE SCHEMA SCRIPT
-- Paste and run this script in your Supabase Dashboard SQL Editor
-- ============================================================

-- 1. Create Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    owner_email TEXT NOT NULL,
    password TEXT NOT NULL,
    hotline TEXT,
    whatsapp_number TEXT,
    announcement_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    store_slug TEXT NOT NULL REFERENCES public.stores(slug) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    brand TEXT DEFAULT 'Generic',
    price_lkr NUMERIC NOT NULL,
    original_price_lkr NUMERIC,
    in_stock BOOLEAN DEFAULT TRUE,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    flash_discount TEXT,
    image TEXT,
    badge TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    store_slug TEXT NOT NULL REFERENCES public.stores(slug) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    items_json JSONB NOT NULL,
    total_lkr NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow Read & Write for REST API
CREATE POLICY "Allow public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public insert stores" ON public.stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stores" ON public.stores FOR UPDATE USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
