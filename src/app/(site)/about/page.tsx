import Image from "next/image";
import { getFullSiteData } from "@/lib/data-store";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MapPin, Phone, Mail, Clock, Crown, Sparkles, HeartHandshake } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Our Atelier",
  description: "Learn about Art By Shahbaz — premier bridal boutique in Clifton, Karachi offering bespoke bridal lehengas, reception wear, and luxury couture.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { settings, social } = await getFullSiteData();
  const phone = social.whatsapp || settings.phone1 || "923001234567";

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <p className="text-gold-500 text-xs tracking-[0.35em] uppercase font-semibold mb-3">✦ The Atelier</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">About Art By Shahbaz</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Crafting heirlooms of timeless beauty, intricate hand-embroidery, and bridal elegance in the heart of Clifton, Karachi.
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-6" />
      </section>

      {/* Main Story & Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-gold-200/50 bg-neutral-900">
          <Image
            src={
              settings.about_image_url ||
              "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=1200&auto=format&fit=crop"
            }
            alt="Art By Shahbaz Boutique"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            A Legacy of Couture Craftsmanship
          </h2>
          {settings.about_html ? (
            <div
              className="prose prose-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: settings.about_html }}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              At Art By Shahbaz, we believe every bride deserves an outfit as unique and breathtaking as her own love story. From pure silks and hand-dyed organzas to exquisite zardozi, tilla, and pearl work, each silhouette is painstakingly developed to perfection.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-bridal-cream/60 border border-gold-200/50 text-center">
              <Crown className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-1">Bespoke Fitting</h4>
              <p className="text-[11px] text-muted-foreground">Custom-tailored to your exact measurements</p>
            </div>
            <div className="p-4 rounded-xl bg-bridal-cream/60 border border-gold-200/50 text-center">
              <Sparkles className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-1">Pure Embellishments</h4>
              <p className="text-[11px] text-muted-foreground">Handcrafted dabka, kora, & pearls</p>
            </div>
            <div className="p-4 rounded-xl bg-bridal-cream/60 border border-gold-200/50 text-center">
              <HeartHandshake className="w-6 h-6 text-gold-500 mx-auto mb-2" />
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-1">Personal Care</h4>
              <p className="text-[11px] text-muted-foreground">1-on-1 designer consultations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique Details & Booking Banner */}
      <section className="bg-neutral-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-1 text-gold-400">Our Studio</h4>
              <p className="text-xs text-neutral-400">{settings.address || "Shop #38, Kehkashan Arcade, Clifton, Karachi"}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-1 text-gold-400">Visiting Hours</h4>
              <p className="text-xs text-neutral-400">{settings.hours_weekday || "Mon – Sat: 11:00 AM – 9:00 PM"}</p>
              <p className="text-xs text-neutral-400">{settings.hours_weekend || "Sunday: By Appointment"}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-1 text-gold-400">Appointments</h4>
              <p className="text-xs text-neutral-400">{settings.phone1 || "+92 300 1234567"}</p>
              <div className="mt-3">
                <WhatsAppButton productName="Studio Visit Appointment" phoneNumber={phone} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
