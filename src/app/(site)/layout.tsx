import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartMount } from "@/components/cart/CartMount";
import { getLogoUrl } from "@/lib/data-store";

// Storefront shell: navbar, footer and cart. The admin panel and API routes
// live outside this group and never render any of it.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoUrl = await getLogoUrl();

  return (
    <CartProvider>
      <Navbar logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartMount />
    </CartProvider>
  );
}
