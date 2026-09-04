import { getFullSiteData } from "@/lib/data-store";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Bridal Booking",
  description: "Get in touch with Art By Shahbaz in Clifton Karachi. Book your bridal appointment or inquire about custom couture on WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { settings, social } = await getFullSiteData();
  const phone = social.whatsapp || settings.phone1 || "923001234567";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-14">
        <p className="text-gold-500 text-xs tracking-[0.35em] uppercase font-semibold mb-2">✦ Reach Out</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Contact & Consultations</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          We look forward to welcoming you to our Clifton boutique or answering your bridal queries via WhatsApp.
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Our Boutique</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings.address || "Shop #38, Kehkashan Shopping Arcade, Main Clifton Road, Karachi, Pakistan"}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-600">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Phone & Inquiries</h3>
              <p className="text-sm text-muted-foreground">
                <a href={`tel:${settings.phone1 || "+923001234567"}`} className="hover:text-gold-600 transition-colors">
                  {settings.phone1 || "+92 300 1234567"}
                </a>
              </p>
              {settings.phone2 && (
                <p className="text-sm text-muted-foreground mt-1">
                  <a href={`tel:${settings.phone2}`} className="hover:text-gold-600 transition-colors">
                    {settings.phone2}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-3 bg-gold-500/10 rounded-xl text-gold-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Opening Hours</h3>
              <p className="text-sm text-muted-foreground">{settings.hours_weekday || "Monday – Saturday: 11:00 AM – 9:00 PM"}</p>
              <p className="text-sm text-muted-foreground">{settings.hours_weekend || "Sunday: By Appointment Only"}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Appointment Box */}
        <div className="bg-gradient-to-br from-bridal-maroon via-bridal-ruby to-neutral-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-gold-300 mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Instant Booking
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4 leading-snug">
              Chat Directly With Our Bridal Stylist
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              Skip traditional forms and get an instant response. Connect with us on WhatsApp to discuss your wedding dates, budget preferences, dress styles, and schedule an exclusive fitting appointment at our studio.
            </p>
          </div>

          <div className="space-y-4">
            <WhatsAppButton
              productName="Studio Fitting & Appointment Booking"
              phoneNumber={phone}
              size="lg"
              className="w-full justify-center shadow-lg"
            />
            <p className="text-[11px] text-white/60 text-center">
              Usually responds within minutes during business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
