import Link from "next/link";
import { Crown, MapPin, Phone, Clock } from "lucide-react";
import { getFullSiteData } from "@/lib/data-store";

// Brand icons — lucide-react no longer ships these, so keep them as small
// inline SVGs. `stroke="currentColor"` (a real SVG attribute, not the invalid
// `stroke-currentColor` class the old markup used) is what makes them pick up
// the link colour instead of rendering as flat black.
const ICONS: Record<string, JSX.Element> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" fill="currentColor" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16 8.245a6.5 6.5 0 0 0 3.5 1.02V6.59a3.83 3.83 0 0 1-2.02-1.02A3.83 3.83 0 0 1 16.4 3h-2.78v11.36a2.32 2.32 0 1 1-1.64-2.22V9.3a5.1 5.1 0 1 0 4.02 4.98z" />
    </svg>
  ),
};

export async function Footer() {
  const year = new Date().getFullYear();
  const { settings, social, categories } = await getFullSiteData();

  const waNumber = (social.whatsapp || settings.whatsapp_number || "923001234567").replace(/[^0-9]/g, "");
  const phone = settings.phone1 || "+92 300 1234567";
  const address =
    settings.address || "Shop #38, Kehkashan Shopping Arcade, Main Clifton Road, Karachi";

  const socialLinks = [
    { key: "instagram", href: social.instagram, label: "Instagram" },
    { key: "facebook", href: social.facebook, label: "Facebook" },
    { key: "youtube", href: social.youtube, label: "YouTube" },
    { key: "tiktok", href: social.tiktok, label: "TikTok" },
  ].filter((s) => s.href && s.href.trim() !== "");

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-gold-800/30">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <Crown className="h-6 w-6 text-gold-400" />
            <div>
              <span className="font-serif text-lg font-bold text-white">Art By Shahbaz</span>
              <span className="block text-[10px] text-gold-400/70 tracking-[0.25em] uppercase -mt-0.5">
                {settings.tagline || "Couture Bridal"}
              </span>
            </div>
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed mb-5">
            Crafting bespoke bridal lehengas, wedding dresses & formal wear for
            the discerning bride in Clifton, Karachi.
          </p>
          {/* Socials */}
          {socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map(({ key, href, label }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-full bg-white/5 text-neutral-200 hover:bg-gold-500/20 hover:text-gold-300 transition-colors"
                >
                  {ICONS[key]}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
            Explore
          </h3>
          <ul className="space-y-2.5">
            {[
              { label: "All Collections", href: "/products" },
              { label: "Bridal Gallery", href: "/gallery" },
              { label: "About Atelier", href: "/about" },
              { label: "Contact & Booking", href: "/contact" },
              { label: "Admin Portal", href: "/admin/login" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-neutral-400 hover:text-gold-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Collections */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
            Collections
          </h3>
          <ul className="space-y-2.5">
            {(categories.length > 0
              ? categories.map((c) => ({ label: c.name, slug: c.slug }))
              : [
                  "Bridal Lehenga",
                  "Walima Maxi",
                  "Mehndi Outfits",
                  "Formal Wear",
                ].map((label) => ({ label, slug: label.toLowerCase().replace(/\s+/g, "-") }))
            ).map(({ label, slug }) => (
              <li key={slug}>
                <Link
                  href={`/products?category=${slug}`}
                  className="text-sm text-neutral-400 hover:text-gold-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
            Visit Us
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-neutral-400">
              <MapPin className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            <li className="flex gap-3 text-sm text-neutral-400">
              <Phone className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-gold-400 transition-colors">
                {phone}
              </a>
            </li>
            <li className="flex gap-3 text-sm text-neutral-400">
              <Clock className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p>{settings.hours_weekday || "Mon – Sat: 11:00 AM – 9:00 PM"}</p>
                <p>{settings.hours_weekend || "Sunday: By Appointment"}</p>
              </div>
            </li>
          </ul>

          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>© {year} Art By Shahbaz. All rights reserved.</p>
          <p>Clifton, Karachi, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
