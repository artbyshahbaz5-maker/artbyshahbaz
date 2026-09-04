"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartButton } from "@/components/cart/CartButton";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-gold-200/40">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-bridal-maroon via-bridal-ruby to-bridal-maroon text-white text-center py-2 text-xs tracking-widest uppercase font-medium">
        ✨ Custom Bridal Fittings Available — Visit Shop #38, Kehkashan Arcade, Clifton &nbsp;|&nbsp;
        <a href="tel:+923001234567" className="underline underline-offset-2 hover:text-gold-200 transition-colors">
          Call Now
        </a>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Crown className="h-6 w-6 text-gold-500 group-hover:text-gold-400 transition-colors" />
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-foreground group-hover:text-gold-600 transition-colors">
                Art By Shahbaz
              </span>
              <span className="block text-[10px] text-muted-foreground tracking-[0.25em] uppercase -mt-0.5">
                Couture Bridal
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-gold-600 transition-colors tracking-wide relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <CartButton />
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              WhatsApp Us
            </a>
          </div>

          {/* Mobile: cart + menu toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <CartButton />
            <button
              className="p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-gold-200/30">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-gold-600 hover:bg-gold-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
