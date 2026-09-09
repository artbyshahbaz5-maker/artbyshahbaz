"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Images, Layers,
  Star, HelpCircle, Settings, LogOut, Home, Image, Menu, X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Reflect the admin-managed logo in the sidebar. Cheap, admin-only fetch.
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setLogoUrl(d?.settings?.logo_url || null))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
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
          <Logo logoUrl={logoUrl} className="h-7 w-7 rounded" />
          <span className="text-white text-sm font-bold font-serif">Art By Shahbaz</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="View site"
            className="p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
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
            <Logo logoUrl={logoUrl} className="h-8 w-8 rounded" />
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
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            View site
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
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

      {/* Sign-out confirmation */}
      <Dialog open={confirmOpen} onOpenChange={(o) => !loggingOut && setConfirmOpen(o)}>
        <DialogContent className="max-w-sm bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Sign out?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              You will need to sign in again to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="adminSecondary"
              onClick={() => setConfirmOpen(false)}
              disabled={loggingOut}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold gap-2"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
