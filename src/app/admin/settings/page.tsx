"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload, Trash2, KeyRound } from "lucide-react";
import type { SiteSettings, SocialLinks } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [social, setSocial] = useState<Partial<SocialLinks>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "branding");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.success && res.url) {
      setSettings((p) => ({ ...p, logo_url: res.url }));
    } else {
      alert(res?.message || "Logo upload failed.");
    }
    setLogoUploading(false);
    if (logoRef.current) logoRef.current.value = "";
  }

  function removeLogo() {
    setSettings((p) => ({ ...p, logo_url: "" }));
  }

  async function handlePasswordUpdate() {
    setPwMsg(null);
    if (pw.newPassword.length < 8) {
      setPwMsg({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ ok: false, text: "New password and confirmation do not match." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        }),
      }).then((r) => r.json());
      if (res.success) {
        setPwMsg({ ok: true, text: "Password updated." });
        setPw({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        setPwMsg({ ok: false, text: res.message || "Failed to update password." });
      }
    } catch (err: any) {
      setPwMsg({ ok: false, text: err?.message || "Failed to update password." });
    } finally {
      setPwSaving(false);
    }
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage your shop info and contact details.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start">
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
              rows={4}
            />
          </div>
        </section>

        {/* Contact & Location */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base mb-1">Contact &amp; Location</h2>
          {field("Address", "address", "Shop #38, Kehkashan Arcade, Clifton, Karachi")}
          {field("Phone 1", "phone1", "+92 300 1234567")}
          {field("Phone 2 (optional)", "phone2")}
          {field("Email", "email", "info@artbyshahbaz.com")}
          {field("Weekday Hours", "hours_weekday", "Mon – Sat: 11AM – 9PM")}
          {field("Weekend Hours", "hours_weekend", "Sunday: By Appointment")}
        </section>

        {/* Social Links */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base mb-1">Social &amp; Contact Links</h2>
          {socialField("WhatsApp Number", "whatsapp", "923001234567")}
          {socialField("Instagram URL", "instagram", "https://instagram.com/artbyshahbaz")}
          {socialField("Facebook URL", "facebook", "https://facebook.com/artbyshahbaz")}
          {socialField("YouTube URL", "youtube")}
          {socialField("TikTok URL", "tiktok")}
        </section>

        {/* Branding / Logo */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base mb-1">Branding</h2>
          <p className="text-neutral-400 text-xs">
            Shown in the site header, footer and admin panel. Leave empty to use the default logo.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
              <Image
                src={settings.logo_url && settings.logo_url.trim() !== "" ? settings.logo_url : "/logo.jpg"}
                alt="Current logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input type="file" accept="image/*" ref={logoRef} onChange={handleLogoUpload} className="hidden" />
              <Button
                type="button"
                variant="adminSecondary"
                size="sm"
                onClick={() => logoRef.current?.click()}
                disabled={logoUploading}
                className="gap-2"
              >
                {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {logoUploading ? "Uploading..." : "Upload New Logo"}
              </Button>
              {settings.logo_url && settings.logo_url.trim() !== "" && (
                <Button
                  type="button"
                  variant="adminSecondary"
                  size="sm"
                  onClick={removeLogo}
                  className="gap-2 border-red-800/60 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Reset to default
                </Button>
              )}
            </div>
          </div>
          <p className="text-neutral-500 text-xs">Click “Save Changes” above to apply logo updates.</p>
        </section>
      </div>

      {/* Account / Password */}
      <div className="mt-6">
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5 max-w-md">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-gold-400" />
            <h2 className="text-white font-semibold text-base">Admin Account</h2>
          </div>
          <p className="text-neutral-400 text-xs">
            Change the password for the admin account you are signed in with.
          </p>
          <div className="space-y-1.5">
            <Label className="text-neutral-300">Current Password</Label>
            <Input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-neutral-300">New Password</Label>
            <Input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-neutral-300">Confirm New Password</Label>
            <Input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              className="bg-neutral-800 border-neutral-700 text-white"
              autoComplete="new-password"
            />
          </div>
          {pwMsg && (
            <p className={pwMsg.ok ? "text-sm text-green-400" : "text-sm text-red-400"}>{pwMsg.text}</p>
          )}
          <Button
            onClick={handlePasswordUpdate}
            disabled={pwSaving || !pw.currentPassword || !pw.newPassword || !pw.confirm}
            className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2"
          >
            {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Update Password
          </Button>
        </section>
      </div>
    </div>
  );
}
