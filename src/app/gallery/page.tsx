import Image from "next/image";
import { getFullSiteData } from "@/lib/data-store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Gallery",
  description: "Explore our stunning gallery of bridal lehengas, wedding dresses and formal wear from Art By Shahbaz.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { gallery } = await getFullSiteData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <p className="text-gold-500 text-xs tracking-[0.35em] uppercase font-medium mb-2">✦ Visual Portfolio</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Bridal Gallery</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          A curated showcase of our finest bridal and formal creations.
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-5" />
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Gallery coming soon.</div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative break-inside-avoid rounded-xl overflow-hidden shadow-sm group">
              <Image
                src={item.image_url}
                alt={item.title || "Bridal Collection"}
                width={400}
                height={600}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {item.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
