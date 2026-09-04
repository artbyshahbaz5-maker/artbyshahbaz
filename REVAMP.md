# 🔄 Art By Shahbaz — Full Next.js & Supabase Revamp Architecture Guide

---

## 📑 Table of Contents
1. [Current Architecture & Behind-The-Scenes (BTS) Breakdown](#1-current-architecture--behind-the-scenes-bts-breakdown)
2. [Target Architecture (Next.js + Tailwind CSS + shadcn/ui + Supabase)](#2-target-architecture)
3. [Customer Experience & WhatsApp Order Flow](#3-customer-experience--whatsapp-order-flow)
4. [Supabase Database Schema (PostgreSQL DDL)](#4-supabase-database-schema-postgresql-ddl)
5. [Supabase Storage Bucket & Image Upload Flow](#5-supabase-storage-bucket--image-upload-flow)
6. [Admin Authentication & Security Setup](#6-admin-authentication--security-setup)
7. [API Keys Required & How to Get Them](#7-api-keys-required--how-to-get-them)
8. [Step-by-Step Supabase Setup Guide](#8-step-by-step-supabase-setup-guide)
9. [Next.js Project Structure & Route Handlers](#9-nextjs-project-structure--route-handlers)
10. [Implementation Code Patterns](#10-implementation-code-patterns)
11. [Step-by-Step Migration & Launch Plan](#11-step-by-step-migration--launch-plan)

---

## 1. Current Architecture & Behind-The-Scenes (BTS) Breakdown

### How the Current Site Works
```
┌──────────────────────────────────────────────────────────────┐
│                    Current Architecture                      │
│                                                              │
│  Client (Browser)                                            │
│   ├── Loads single 2.2MB public/index.html (HTML + CSS + JS) │
│   ├── Calls GET /api/data on startup                         │
│   └── Converts uploaded images to Base64 in JavaScript       │
│                            │                                 │
│                            ▼                                 │
│  Backend (server.js - Raw Node.js http server)               │
│   ├── No framework, no npm dependencies                      │
│   ├── In-memory session store (new Map())                    │
│   └── 60MB JSON body limit                                   │
│                            │                                 │
│                            ▼                                 │
│  Storage (data/data.json - 1.5MB Flat JSON File)             │
│   ├── Plaintext credentials ("password": "admin123")         │
│   └── Massive Base64 image strings embedded in JSON          │
└──────────────────────────────────────────────────────────────┘
```

### Key Workflows in the Current System
1. **Public Site Rendering**:
   - The browser loads [public/index.html](file:///C:/Users/HP/Downloads/artbyshahbaz-nodejs/artbyshahbaz/public/index.html) (~2.2MB).
   - Embedded JavaScript issues `GET /api/data`.
   - [server.js](file:///C:/Users/HP/Downloads/artbyshahbaz-nodejs/artbyshahbaz/server.js) reads `data/data.json`, strips the `credentials` object, and returns all products, categories, gallery images, banners, reviews, and settings.
   - Client-side DOM manipulation renders the catalog.

2. **Customer Checkout**:
   - There is **no customer login, cart, or payment gateway**.
   - When a user clicks to buy/inquire about an outfit, the frontend generates a WhatsApp direct link (`https://wa.me/<phone>?text=...`) prefilled with product title, SKU/ID, and price.
   - Conversations and transactions happen directly via WhatsApp.

3. **Admin Authentication**:
   - The admin opens the hidden modal/login panel on the website.
   - Credentials are sent to `POST /api/admin/login`.
   - The server compares them against the plaintext `"email"` and `"password"` stored in `data.json`.
   - A random hex token is generated via `crypto.randomBytes(32)` and kept in an in-memory `sessions` Map.
   - *Flaw*: When the Node.js server restarts, all active sessions are instantly wiped.

4. **Image Upload Mechanism**:
   - When an admin selects an image file, the browser uses `FileReader.readAsDataURL(file)` to convert the binary image into a **Base64 string** (`data:image/jpeg;base64,...`).
   - This huge string is included in the JSON payload sent to `POST /api/admin/products`, `POST /api/admin/gallery`, or `PUT /api/admin/settings`.
   - The server writes this Base64 string directly into `data/data.json`.
   - *Flaw*: The `uploads/` directory on disk is completely unused, `data.json` balloons to over 1.5MB, and image load performance is poor with zero caching or CDN benefits.

---

## 2. Target Architecture

The revamped system replaces the single monolithic HTML and JSON file setup with a modern, high-performance web architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 14/15 App Router                        │
│                                                                        │
│   Frontend (React + Tailwind CSS + shadcn/ui)                          │
│   ├── Server Components (SEO-optimized, fast TTFB)                     │
│   ├── Client Components for dynamic filters, lightboxes & forms        │
│   ├── WhatsApp order buttons (Zero customer login required)            │
│   └── Dedicated /admin portal with responsive dashboard & data tables  │
│                                                                        │
│   Backend (Next.js Route Handlers / Server Actions)                    │
│   ├── /api/public/data        → Public cached catalog data             │
│   ├── /api/admin/upload       → Secure multipart upload to Supabase    │
│   └── /api/admin/* (CRUD)     → Authenticated CRUD for catalog/content │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐  ┌───────────────────────────────┐
│     Supabase PostgreSQL Database    │  │   Supabase Storage Bucket     │
│  - Relational tables with indexes   │  │   Bucket: artbyshahbaz-images │
│  - Row Level Security (RLS)         │  │   - CDN-cached images         │
│  - Supabase Auth for Admin users    │  │   - products/, gallery/, etc. │
└─────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 3. Customer Experience & WhatsApp Order Flow

- **Zero Customer Login**: Customers do not need to register, remember passwords, or navigate complex checkouts.
- **WhatsApp Direct Inquiries**:
  - Each product card and product detail view displays an **"Order on WhatsApp"** button.
  - Clicking constructs a formatted message:
    ```
    "Hello Art By Shahbaz! I would like to inquire about/order:
    - Product: Royal Velvet Bridal Lehenga
    - Code: PROD-102
    - Price: PKR 185,000
    Link: https://artbyshahbaz.com/products/royal-velvet-bridal-lehenga"
    ```
  - Directly opens WhatsApp Web or the WhatsApp mobile app targeting the business phone configured in the `settings` table.

---

## 4. Supabase Database Schema (PostgreSQL DDL)

Execute the following SQL statements in the Supabase SQL Editor to establish all necessary relational tables, foreign keys, timestamps, and Row Level Security (RLS) policies:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings (Single row configuration)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL DEFAULT 'Art By Shahbaz',
    description TEXT DEFAULT '',
    about_html TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    about_image_url TEXT DEFAULT '',
    phone1 VARCHAR(50) DEFAULT '',
    phone2 VARCHAR(50) DEFAULT '',
    hours_weekday VARCHAR(100) DEFAULT '',
    hours_sunday VARCHAR(100) DEFAULT '',
    address TEXT DEFAULT 'Shop #38, Kehkashan Shopping Arcade, Clifton, Karachi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Social Media Links
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instagram VARCHAR(255) DEFAULT '',
    tiktok VARCHAR(255) DEFAULT '',
    facebook VARCHAR(255) DEFAULT '',
    youtube VARCHAR(255) DEFAULT '',
    whatsapp VARCHAR(50) DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    price VARCHAR(100) DEFAULT '',
    image_url TEXT NOT NULL,
    gallery_urls TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) DEFAULT '',
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Bridal',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Banners / Hero Carousel
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) DEFAULT '',
    subtitle TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    button_text VARCHAR(100) DEFAULT 'Explore Collection',
    button_link VARCHAR(255) DEFAULT '/products',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Customer Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(150) NOT NULL,
    review_text TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    event_type VARCHAR(100) DEFAULT 'Bridal',
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_social_modtime BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 1. Read Policies: Anonymous & Public users can read all active content
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Read Social" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Public Read FAQs" ON public.faqs FOR SELECT USING (is_visible = true);

-- 2. Write Policies: Only Authenticated Admin can Insert, Update, Delete
CREATE POLICY "Admin Full Settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Social" ON public.social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Banners" ON public.banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full FAQs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 5. Supabase Storage Bucket & Image Upload Flow

### Bucket Configuration
- **Bucket Name**: `artbyshahbaz-images`
- **Public**: `true` (Allows high-speed global CDN delivery without token expiration issues)
- **File size limit**: 10 MB per file
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/avif`

### Folder Convention Inside Bucket
- `products/` — Product primary images and sub-galleries
- `gallery/` — Studio and customer bridal showcases
- `banners/` — Hero slider banners
- `branding/` — Logos, favicon, about section portraits

### Storage Security Policies (SQL)
```sql
-- Allow public viewing of all images in bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'artbyshahbaz-images' );

-- Allow authenticated admins to upload images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'artbyshahbaz-images' );

-- Allow authenticated admins to update/delete images
CREATE POLICY "Admin Update Delete Access"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'artbyshahbaz-images' );
```

---

## 6. Admin Authentication & Security Setup

1. **Authentication Provider**: Supabase Auth (Email + Password).
2. **Admin Creation**: Create the admin account securely through the Supabase Dashboard under `Authentication > Users`.
3. **Password Security**: Handled by Supabase using bcrypt/Argon2 hashing. No plaintext passwords stored.
4. **Session Persistence**: Stored via HTTP-only secure cookies managed by `@supabase/ssr` or `@supabase/auth-helpers-nextjs`. Sessions remain valid across server restarts and deployments.
5. **Route Protection**: Implemented via Next.js Middleware. Any unauthenticated requests to `/admin/*` (excluding `/admin/login`) are automatically redirected to `/admin/login`.

---

## 7. API Keys Required & How to Get Them

### The 3 Required Environment Variables
Create a file named `.env.local` in the root of your Next.js project:

```env
# 1. Project URL (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# 2. Anon / Public Key (Safe for frontend & browser queries)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Service Role Secret Key (STRICTLY SERVER-SIDE ONLY - Never prefix with NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Optional site domain
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Where to Find Each Key in Supabase:
1. Log in to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click the **Project Settings** (Gear icon in the bottom left).
4. Select the **API** tab.
5. Under **Project URL**, copy the `URL` value (`NEXT_PUBLIC_SUPABASE_URL`).
6. Under **Project API keys**:
   - Copy `anon` / `public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - Click `Reveal` next to `service_role` / `secret` key and copy it (`SUPABASE_SERVICE_ROLE_KEY`).

---

## 8. Step-by-Step Supabase Setup Guide

### Step 1: Create Supabase Account & Project
1. Go to [supabase.com](https://supabase.com/) and click **Start your project**.
2. Sign in with GitHub or your email.
3. Click **New Project** and select your Organization.
4. Set:
   - **Name**: `artbyshahbaz`
   - **Database Password**: Generate and save a strong password.
   - **Region**: Choose the region closest to your primary audience (e.g., `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)`).
5. Click **Create new project** and wait 1-2 minutes for provisioning.

### Step 2: Run Database Migrations
1. In the Supabase Dashboard, click **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Paste the entire SQL script from [Section 4](#4-supabase-database-schema-postgresql-ddl).
4. Click **Run**.
5. Verify that all 8 tables appear in the **Table Editor**.

### Step 3: Insert Initial Default Data
Run the following SQL snippet to seed default brand settings and social links:
```sql
INSERT INTO public.settings (title, description, about_html, phone1, hours_weekday, hours_sunday)
VALUES (
    'Bridal Dresses in Clifton Karachi | Art By Shahbaz',
    'Luxury bridal lehenga, wedding dresses, formal wear & party dresses in Clifton, Karachi.',
    '<p>Art By Shahbaz is your destination for luxury bridal lehengas, reception dresses, and custom fittings.</p>',
    '+92 300 1234567',
    'Mon - Sat: 12:00 PM - 9:00 PM',
    'Sunday: By Appointment'
);

INSERT INTO public.social_links (instagram, tiktok, facebook, youtube, whatsapp)
VALUES (
    'https://instagram.com/artbyshahbaz',
    'https://tiktok.com/@artbyshahbaz',
    'https://facebook.com/artbyshahbaz',
    'https://youtube.com/@artbyshahbaz',
    '+923001234567'
);
```

### Step 4: Create the Storage Bucket
1. Click **Storage** in the left navigation.
2. Click **New bucket**.
3. Bucket Name: `artbyshahbaz-images`.
4. Check **Public bucket** to `ON`.
5. Click **Save**.
6. Switch to the **Policies** tab and paste the Storage SQL from [Section 5](#5-supabase-storage-bucket--image-upload-flow).

### Step 5: Create the Admin User
1. Click **Authentication** in the left navigation.
2. Click **Users** > **Add User** > **Create User**.
3. Enter your desired admin email (e.g., `admin@artbyshahbaz.com`) and a strong password.
4. Toggle **Auto Confirm User** to `ON` so no email verification is required.
5. Click **Create User**.

---

## 9. Next.js Project Structure & Route Handlers

```
artbyshahbaz-next/
├── .env.local
├── next.config.mjs
├── tailwind.config.ts
├── package.json
├── middleware.ts                   # Route guard for /admin/*
└── src/
    ├── app/
    │   ├── layout.tsx              # Main root layout (Font, SEO metadata)
    │   ├── page.tsx                # Homepage (Hero banners, Featured, About, Reviews, FAQs)
    │   ├── products/
    │   │   ├── page.tsx            # Full catalog with category filtering
    │   │   └── [slug]/page.tsx     # Single product detail with WhatsApp button
    │   ├── gallery/
    │   │   └── page.tsx            # Visual bridal gallery & lightbox
    │   ├── about/
    │   │   └── page.tsx            # Brand story, salon location & hours
    │   ├── contact/
    │   │   └── page.tsx            # Contact info, map, WhatsApp CTA
    │   │
    │   ├── admin/                  # Protected Admin Area
    │   │   ├── login/page.tsx      # Admin login form
    │   │   ├── layout.tsx          # Admin layout (Sidebar, topbar, logout button)
    │   │   ├── page.tsx            # Dashboard metrics & quick links
    │   │   ├── products/page.tsx   # Product management (Data table, Add/Edit dialog)
    │   │   ├── categories/page.tsx # Category management
    │   │   ├── gallery/page.tsx    # Gallery management & uploader
    │   │   ├── banners/page.tsx    # Hero slider banner manager
    │   │   ├── reviews/page.tsx    # Testimonial manager
    │   │   ├── faqs/page.tsx       # FAQ manager
    │   │   └── settings/page.tsx   # Brand settings, phone, and social links
    │   │
    │   └── api/
    │       ├── public/
    │       │   └── data/route.ts   # Combined public catalog endpoint
    │       └── admin/
    │           ├── upload/route.ts # Direct Supabase bucket image uploader
    │           ├── products/
    │           │   ├── route.ts    # POST new product, GET all
    │           │   └── [id]/route.ts # PUT update, DELETE product
    │           ├── categories/route.ts
    │           ├── gallery/route.ts
    │           ├── banners/route.ts
    │           └── settings/route.ts
    │
    ├── components/
    │   ├── ui/                     # shadcn/ui primitives (Button, Dialog, Table, Input, etc.)
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── ProductCard.tsx
    │   ├── WhatsAppButton.tsx      # Pre-formatted WhatsApp order initiator
    │   ├── GalleryLightbox.tsx
    │   └── admin/
    │       ├── AdminSidebar.tsx
    │       ├── ImageUploader.tsx   # Drag-and-drop bucket uploader with progress
    │       └── ProductDialog.tsx
    │
    └── lib/
        ├── supabase/
        │   ├── client.ts           # Browser Supabase client (Anon key)
        │   ├── server.ts           # Server-side Supabase client (Cookie-aware)
        │   └── admin.ts            # Privileged client (Service role key for API routes)
        └── utils.ts                # cn() helper, slugify, currency formatters
```

---

## 10. Implementation Code Patterns

### A. Supabase Client Configurations (`lib/supabase/`)

#### 1. Browser Client (`lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### 2. Server Client with Service Role (`lib/supabase/admin.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

// Only use in API Route Handlers / Server Actions
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
```

---

### B. Image Upload Route Handler (`app/api/admin/upload/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('artbyshahbaz-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('artbyshahbaz-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### C. Admin Route Guard (`middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If navigating to admin panel without an authenticated user
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user && request.nextUrl.pathname !== '/admin/login') {
      const redirectUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (user && request.nextUrl.pathname === '/admin/login') {
      const redirectUrl = new URL('/admin', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

---

### D. WhatsApp Checkout Component (`components/WhatsAppButton.tsx`)
```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName: string;
  price?: string;
  productUrl?: string;
  phoneNumber: string; // e.g. "923001234567"
}

export function WhatsAppButton({
  productName,
  price,
  productUrl,
  phoneNumber,
}: WhatsAppButtonProps) {
  const handleOrder = () => {
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    const currentUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '');
    
    const message = `Hello Art By Shahbaz! ✨\nI am interested in ordering/inquiring about this dress:\n\n` +
      `👗 *Product:* ${productName}\n` +
      (price ? `💰 *Price:* ${price}\n` : '') +
      `🔗 *Link:* ${currentUrl}\n\n` +
      `Please let me know about availability and custom fitting appointments.`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleOrder}
      className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium gap-2 px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="w-5 h-5" />
      Order via WhatsApp
    </Button>
  );
}
```

---

## 11. Step-by-Step Migration & Launch Plan

```
[Phase 1: Project Initialization]
 ├── 1. npx create-next-app@latest (Next.js 14/15, TypeScript, Tailwind)
 ├── 2. npx shadcn@latest init (Setup Button, Card, Dialog, Table, Input, Dropdown)
 └── 3. npm install @supabase/ssr @supabase/supabase-js lucide-react

[Phase 2: Backend & Database Integration]
 ├── 1. Setup Supabase project and execute PostgreSQL DDL script
 ├── 2. Configure public storage bucket artbyshahbaz-images
 ├── 3. Create Admin user credentials in Supabase Auth
 └── 4. Populate .env.local with Supabase URL & keys

[Phase 3: Data Migration from data.json]
 ├── 1. Write one-time migration script (scripts/migrate.js) to:
 │      - Extract base64 images from data.json
 │      - Convert base64 buffers to files & upload to Supabase Storage
 │      - Insert clean product/gallery/banner rows into PostgreSQL with public URLs
 └── 2. Verify all records populated in Supabase Table Editor

[Phase 4: Admin Panel Implementation]
 ├── 1. Build /admin/login with Supabase Auth
 ├── 2. Configure Next.js Middleware route guard
 ├── 3. Implement /api/admin/upload route handler
 └── 4. Build CRUD interfaces for Products, Categories, Gallery, and Settings

[Phase 5: Customer Storefront Implementation]
 ├── 1. Build responsive Homepage (Hero carousel, Featured collections, Reviews, FAQs)
 ├── 2. Build /products catalog with category filters and search
 ├── 3. Build /products/[slug] with high-res image zoom and WhatsApp CTA
 └── 4. Build visual /gallery with filterable categories

[Phase 6: Deployment & Launch]
 ├── 1. Push code to GitHub repository
 ├── 2. Import project to Vercel
 ├── 3. Configure environment variables in Vercel Project Settings
 └── 4. Connect custom domain (artbyshahbaz.com) with SSL
```

---
*Created for Art By Shahbaz revamp roadmap.*
