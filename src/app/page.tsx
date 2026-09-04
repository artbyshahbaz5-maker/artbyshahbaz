import Image from "next/image";
import Link from "next/link";
import { getFullSiteData } from "@/lib/data-store";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MapPin, Phone, Clock, ChevronRight } from "lucide-react";

// Always render fresh so new products / categories / FAQs added in the admin
// panel appear immediately instead of being frozen at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getFullSiteData();
  const { settings, social, products, banners, reviews, faqs, categories } = data;

  const activeProducts = products.filter((p) => p.is_active ?? true);
  const featuredOnly = activeProducts.filter((p) => p.is_featured);
  // Fall back to the most recent active products if nothing is flagged "Featured".
  const featured = (featuredOnly.length > 0 ? featuredOnly : activeProducts).slice(0, 6);
  const phone = social.whatsapp || settings.phone1 || "923001234567";
  const heroBanner = banners[0];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-bridal-dark">
        {heroBanner?.image_url ? (
          <Image
            src={heroBanner.image_url}
            alt={heroBanner.title || "Art By Shahbaz Bridal Collection"}
            fill
            priority
            className="object-cover opacity-50"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bridal-maroon/80 via-neutral-950 to-bridal-emerald/40" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-gold-300 text-sm font-medium tracking-[0.4em] uppercase mb-4 animate-fade-in">
            Clifton, Karachi
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {heroBanner?.title || settings.title || "Art By Shahbaz"}
          </h1>
          <p className="text-neutral-200 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            {heroBanner?.subtitle ||
              "Bespoke bridal lehengas, luxury reception dresses & formal couture. Crafted for your most unforgettable moments."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg text-sm tracking-wide"
            >
              Explore Collections <ChevronRight className="h-4 w-4" />
            </Link>
            <WhatsAppButton
              productName="Bridal Collection Enquiry"
              phoneNumber={phone}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES STRIP ── */}
      {categories.length > 0 && (
        <section className="bg-bridal-cream border-b border-gold-200/40 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="text-xs font-medium tracking-widest uppercase px-5 py-2.5 border border-gold-300 text-gold-700 rounded-full hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-xs tracking-[0.35em] uppercase font-medium mb-2">
              ✦ Curated for You
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Featured Collections
            </h2>
            <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} whatsappPhone={phone} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-gold-400 text-gold-600 hover:bg-gold-50 px-7 py-3 rounded-full text-sm font-medium transition-all"
            >
              View All Collections <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ── ABOUT STRIP ── */}
      <section className="bg-neutral-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {settings.about_image_url && (
            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={settings.about_image_url}
                alt="Art By Shahbaz Atelier"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-3">Our Atelier</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              Crafting Dreams,<br />One Stitch at a Time
            </h2>
            {settings.about_html ? (
              <div
                className="prose prose-invert prose-sm max-w-none text-neutral-300"
                dangerouslySetInnerHTML={{ __html: settings.about_html }}
              />
            ) : (
              <p className="text-neutral-300 leading-relaxed">
                {settings.description}
              </p>
            )}
            <div className="mt-8 space-y-3">
              {settings.address && (
                <div className="flex gap-3 text-sm text-neutral-400">
                  <MapPin className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone1 && (
                <div className="flex gap-3 text-sm text-neutral-400">
                  <Phone className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <a href={`tel:${settings.phone1}`} className="hover:text-gold-300 transition-colors">
                    {settings.phone1}
                  </a>
                </div>
              )}
              {settings.hours_weekday && (
                <div className="flex gap-3 text-sm text-neutral-400">
                  <Clock className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <span>{settings.hours_weekday}</span>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
              >
                Learn more about us <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {reviews.length > 0 && (
        <section className="bg-bridal-cream py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
            <div className="lg:pt-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Real brides,<br />real words
              </h2>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
                A few notes from the brides we&rsquo;ve dressed for their big day.
              </p>
            </div>

            <div>
              <figure>
                <span
                  aria-hidden
                  className="block font-serif text-6xl leading-[0.4] text-gold-400/70 select-none"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-4 font-serif text-xl sm:text-2xl italic leading-relaxed text-foreground/90">
                  {reviews[0].review_text}
                </blockquote>
                <figcaption className="mt-5">
                  <span className="block text-sm font-semibold text-foreground">
                    {reviews[0].client_name}
                  </span>
                  {reviews[0].event_type && (
                    <span className="mt-0.5 block text-xs text-gold-600">
                      {reviews[0].event_type}
                    </span>
                  )}
                </figcaption>
              </figure>

              {reviews.length > 1 && (
                <div className="mt-12 grid gap-x-10 gap-y-10 border-t border-gold-300/50 pt-10 sm:grid-cols-2">
                  {reviews.slice(1, 5).map((review) => (
                    <div key={review.id}>
                      <p className="text-sm leading-relaxed text-foreground/75">
                        {review.review_text}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {review.client_name}
                      </p>
                      {review.event_type && (
                        <p className="mt-0.5 text-xs text-gold-600">{review.event_type}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      {faqs.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
            <div className="lg:pt-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Questions,<br />answered
              </h2>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
                Everything brides usually ask us before their first visit to the studio.
              </p>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-500 transition-colors"
              >
                Still curious? Message us
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="border-t border-border">
              {faqs.slice(0, 8).map((faq) => (
                <details key={faq.id} className="group border-b border-border">
                  <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none">
                    <span className="font-serif text-base sm:text-lg text-foreground transition-colors group-open:text-gold-700">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 flex-shrink-0 text-lg leading-none text-gold-500 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[62ch] pb-6 pr-8 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ── */}
      <section className="bg-gradient-to-r from-bridal-maroon to-bridal-ruby text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Begin Your Bridal Journey
          </h2>
          <p className="text-white/80 mb-8">
            Book a consultation and discover your dream outfit. Available for custom orders and personalized fittings.
          </p>
          <WhatsAppButton
            productName="Bridal Consultation Request"
            phoneNumber={phone}
            size="lg"
            className="mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
