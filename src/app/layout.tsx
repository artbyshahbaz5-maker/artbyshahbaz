import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartMount } from "@/components/cart/CartMount";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Art By Shahbaz | Luxury Bridal & Formal Wear – Clifton, Karachi",
    template: "%s | Art By Shahbaz",
  },
  description:
    "Discover luxury bridal lehengas, wedding dresses & formal wear at Art By Shahbaz. Shop #38, Kehkashan Shopping Arcade, Clifton, Karachi. Order on WhatsApp.",
  keywords: [
    "bridal dresses Clifton",
    "bridal lehenga Karachi",
    "wedding dresses Karachi",
    "formal wear Clifton",
    "Art By Shahbaz",
    "bridal shop Karachi",
  ],
  authors: [{ name: "Art By Shahbaz" }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://artbyshahbaz.com",
    siteName: "Art By Shahbaz",
    title: "Art By Shahbaz | Luxury Bridal & Formal Wear – Clifton, Karachi",
    description:
      "Designer bridal lehengas & formal wear in Clifton, Karachi. Custom fitting available.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art By Shahbaz | Luxury Bridal & Formal Wear",
    description:
      "Designer bridal lehengas & formal wear in Clifton, Karachi.",
  },
  metadataBase: new URL("https://artbyshahbaz.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartMount />
        </CartProvider>
      </body>
    </html>
  );
}
