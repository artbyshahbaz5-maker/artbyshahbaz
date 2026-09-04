export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  price?: string;
  image_url: string;
  gallery_urls?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  whatsapp_msg?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryItem {
  id: string;
  title?: string;
  image_url: string;
  category?: string;
  sort_order?: number;
  created_at?: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface Review {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  event_type?: string;
  is_visible?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_visible?: boolean;
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  title: string;
  tagline?: string;
  description: string;
  about_html?: string;
  logo_url?: string;
  about_image_url?: string;
  phone1: string;
  phone2?: string;
  email?: string;
  whatsapp_number?: string;
  hours_weekday: string;
  hours_weekend?: string;
  hours_sunday?: string;
  address?: string;
  updated_at?: string;
  // alias used by settings page
  [key: string]: string | boolean | undefined;
}

export interface SocialLinks {
  id?: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  updated_at?: string;
  [key: string]: string | undefined;
}

export interface SiteData {
  settings: SiteSettings;
  social: SocialLinks;
  categories: Category[];
  products: Product[];
  gallery: GalleryItem[];
  banners: Banner[];
  reviews: Review[];
  faqs: FAQ[];
}
