-- ==============================================================================
-- Supabase Schema & Database Setup for Art By Shahbaz (Bridal & Formal Wear)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price TEXT,
    image_url TEXT NOT NULL,
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    whatsapp_msg TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'Bridal',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Explore Collection',
    button_link TEXT DEFAULT '/products',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    event_type TEXT DEFAULT 'Bridal',
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Site Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'Art By Shahbaz | Luxury Bridal & Formal Wear',
    tagline TEXT DEFAULT 'Boutique Bridal Couture',
    description TEXT DEFAULT 'Designer bridal lehengas, reception gowns, and luxury formals.',
    about_html TEXT,
    logo_url TEXT,
    about_image_url TEXT,
    phone1 TEXT DEFAULT '+92 300 1234567',
    phone2 TEXT,
    email TEXT DEFAULT 'info@artbyshahbaz.com',
    whatsapp_number TEXT DEFAULT '923001234567',
    hours_weekday TEXT DEFAULT 'Mon – Sat: 11:00 AM – 9:00 PM',
    hours_weekend TEXT DEFAULT 'Sunday: By Appointment',
    address TEXT DEFAULT 'Shop #38, Kehkashan Shopping Arcade, Main Clifton Road, Karachi',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instagram TEXT DEFAULT 'https://instagram.com/artbyshahbaz',
    tiktok TEXT DEFAULT '',
    facebook TEXT DEFAULT 'https://facebook.com/artbyshahbaz',
    youtube TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '923001234567',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- Storage Bucket Setup (Storage bucket must be named: artbyshahbaz-images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artbyshahbaz-images', 'artbyshahbaz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Policy (Allow Anyone to Read Images)
CREATE POLICY "Public Image Access" ON storage.objects
FOR SELECT USING (bucket_id = 'artbyshahbaz-images');

-- Admin Upload Policy (Allow Service Role / Authenticated users to write)
CREATE POLICY "Admin Upload Image" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'artbyshahbaz-images');

CREATE POLICY "Admin Delete Image" ON storage.objects
FOR DELETE USING (bucket_id = 'artbyshahbaz-images');
