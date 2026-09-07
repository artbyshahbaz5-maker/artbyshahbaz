"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Crown, LayoutDashboard, Package, Images, Layers,
  Star, HelpCircle, Settings, LogOut, ExternalLink, Image, Menu, X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-neutral-950 lg:flex">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-neutral-900 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-gold-400" />
          <span className="text-white text-sm font-bold font-serif">Art By Shahbaz</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 -mr-2 text-neutral-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col",
          "transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Crown className="h-5 w-5 text-gold-400" />
            <div>
              <p className="text-white text-sm font-bold font-serif">Art By Shahbaz</p>
              <p className="text-[10px] text-gold-400/70 tracking-widest uppercase">Admin</p>
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold-500/10 text-gold-300 border border-gold-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Live Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-900/40 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
