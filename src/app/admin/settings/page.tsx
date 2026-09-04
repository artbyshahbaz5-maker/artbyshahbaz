"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type { SiteSettings, SocialLinks } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [social, setSocial] = useState<Partial<SocialLinks>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/social").then((r) => r.json()),
    ]).then(([s, soc]) => {
      setSettings(s.settings || {});
      setSocial(soc.social || {});
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await Promise.all([
      fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }),
      fetch("/api/admin/social", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(social),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-neutral-400 py-10">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading settings...
    </div>
  );

  const field = (label: string, key: keyof SiteSettings, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label className="text-neutral-300">{label}</Label>
      <Input
        value={(settings[key] as string) || ""}
        onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
      />
    </div>
  );

  const socialField = (label: string, key: keyof SocialLinks, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label className="text-neutral-300">{label}</Label>
      <Input
        value={(social[key] as string) || ""}
        onChange={(e) => setSocial((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your shop info and contact details.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Shop Info */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base mb-1">Shop Information</h2>
          {field("Shop Name", "title", "Art By Shahbaz")}
          {field("Tagline", "tagline", "Luxury Bridal Couture")}
          <div className="space-y-1.5">
            <Label className="text-neutral-300">Description</Label>
            <Textarea
              value={settings.description || ""}
              onChange={(e) => setSettings((p) => ({ ...p, description: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              rows={3}
            />
          </div>
          {field("Address", "address", "Shop #38, Kehkashan Arcade, Clifton, Karachi")}
          {field("Phone 1", "phone1", "+92 300 1234567")}
          {field("Phone 2 (optional)", "phone2")}
          {field("Email", "email", "info@artbyshahbaz.com")}
          {field("Weekday Hours", "hours_weekday", "Mon – Sat: 11AM – 9PM")}
          {field("Weekend Hours", "hours_weekend", "Sunday: By Appointment")}
        </section>

        {/* Social Links */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base mb-1">Social & Contact Links</h2>
          {socialField("WhatsApp Number", "whatsapp", "923001234567")}
          {socialField("Instagram URL", "instagram", "https://instagram.com/artbyshahbaz")}
          {socialField("Facebook URL", "facebook", "https://facebook.com/artbyshahbaz")}
          {socialField("YouTube URL", "youtube")}
          {socialField("TikTok URL", "tiktok")}
        </section>
      </div>
    </div>
  );
}
