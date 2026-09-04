import Link from "next/link";
import { Crown, MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

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
                Couture Bridal
              </span>
            </div>
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed mb-5">
            Crafting bespoke bridal lehengas, wedding dresses & formal wear for
            the discerning bride in Clifton, Karachi.
          </p>
          {/* Socials */}
          <div className="flex gap-3">
            <a
              href="https://instagram.com/artbyshahbaz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full bg-white/5 hover:bg-gold-500/20 hover:text-gold-300 transition-colors"
            >
              <svg className="h-4 w-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://facebook.com/artbyshahbaz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full bg-white/5 hover:bg-gold-500/20 hover:text-gold-300 transition-colors"
            >
              <svg className="h-4 w-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com/@artbyshahbaz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="p-2 rounded-full bg-white/5 hover:bg-gold-500/20 hover:text-gold-300 transition-colors"
            >
              <svg className="h-4 w-4 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
              </svg>
            </a>
          </div>
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
            {[
              "Bridal Lehenga",
              "Walima Maxi",
              "Mehndi Outfits",
              "Formal Wear",
              "Party Dresses",
              "Custom Orders",
            ].map((cat) => (
              <li key={cat}>
                <Link
                  href={`/products?category=${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-neutral-400 hover:text-gold-400 transition-colors"
                >
                  {cat}
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
              <span>Shop #38, Kehkashan Shopping Arcade, Main Clifton Road, Karachi</span>
            </li>
            <li className="flex gap-3 text-sm text-neutral-400">
              <Phone className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <a href="tel:+923001234567" className="hover:text-gold-400 transition-colors">
                +92 300 1234567
              </a>
            </li>
            <li className="flex gap-3 text-sm text-neutral-400">
              <Clock className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p>Mon – Sat: 11:00 AM – 9:00 PM</p>
                <p>Sunday: By Appointment</p>
              </div>
            </li>
          </ul>

          <a
            href="https://wa.me/923001234567"
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
