const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function seedData() {
  console.log('Seeding initial data from legacy JSON...');
  const jsonPath = path.join(__dirname, '..', 'old', 'data', 'data.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('No data.json found.');
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const legacy = JSON.parse(raw);

  // 1. Seed Categories
  console.log('Seeding categories...');
  const catMap = {};
  if (legacy.categories && legacy.categories.length > 0) {
    for (const c of legacy.categories) {
      const name = c.name || c.title || 'Collection';
      const slug = c.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data, error } = await supabase.from('categories').upsert({ name, slug }, { onConflict: 'slug' }).select().single();
      if (data) catMap[c.id || name] = data.id;
    }
  }

  // 2. Seed Products
  console.log('Seeding products...');
  if (legacy.products && legacy.products.length > 0) {
    for (const p of legacy.products) {
      const name = p.name || p.title || 'Bridal Outfit';
      const slug = (p.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Math.random().toString(36).substring(2, 6);
      await supabase.from('products').insert({
        name,
        slug,
        description: p.description || '',
        price: p.price || 'Price on Request',
        image_url: p.image || p.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
        category_id: catMap[p.category_id || p.category] || null,
        is_featured: p.is_featured ?? true,
        is_active: p.is_active ?? true,
      });
    }
  }

  // 3. Seed Reviews
  console.log('Seeding reviews...');
  if (legacy.reviews && legacy.reviews.length > 0) {
    for (const r of legacy.reviews) {
      await supabase.from('reviews').insert({
        client_name: r.name || r.client_name || 'Client',
        review_text: r.text || r.review_text || 'Excellent service and exquisite bridal couture.',
        rating: r.rating || 5,
        event_type: r.event_type || 'Bridal',
        is_visible: true,
      });
    }
  }

  // 4. Seed FAQs
  console.log('Seeding FAQs...');
  if (legacy.faqs && legacy.faqs.length > 0) {
    for (const f of legacy.faqs) {
      await supabase.from('faqs').insert({
        question: f.question || '',
        answer: f.answer || '',
        is_visible: true,
      });
    }
  }

  // 5. Seed Settings
  console.log('Seeding Settings & Social...');
  if (legacy.settings) {
    await supabase.from('settings').insert({
      title: legacy.settings.title || 'Art By Shahbaz | Luxury Bridal & Formal Wear',
      description: legacy.settings.description || 'Designer bridal lehengas in Clifton Karachi',
      about_html: legacy.settings.about || '',
      phone1: '+92 300 1234567',
      address: 'Shop #38, Kehkashan Shopping Arcade, Main Clifton Road, Karachi',
    });
  }

  if (legacy.social) {
    await supabase.from('social_links').insert({
      instagram: legacy.social.instagram || 'https://instagram.com/artbyshahbaz',
      whatsapp: legacy.social.whatsapp || '923001234567',
      facebook: legacy.social.facebook || 'https://facebook.com/artbyshahbaz',
    });
  }

  console.log('🎉 Seeding completed successfully!');
}

seedData();
