/** @type {import('next').NextConfig} */

// Supabase Storage host (e.g. xxxx.supabase.co) taake sirf apni hi images allow hon
let supabaseHost = null;
try {
  supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
} catch {}

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel ki Image Optimization (transformations) poori band.
    // Images ab seedhi original URL se serve hongi, koi transformation count nahi hoga.
    unoptimized: true,
    // Optimizer endpoint par koi bahar ka domain use na kar sake
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [],
  },
};

export default nextConfig;
