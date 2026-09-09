"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload, RotateCcw, KeyRound, Check } from "lucide-react";
import type { SiteSettings, SocialLinks } from "@/types";

type FieldOpts = { full?: boolean; type?: string };

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }),
      fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(social),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

  const inputClass =
    "bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-gold-500";

  const field = (
    label: string,
    key: keyof SiteSettings,
    placeholder?: string,
    opts: FieldOpts = {},
  ) => (
    <div className={`space-y-2 ${opts.full ? "sm:col-span-2" : ""}`}>
      <Label className="text-sm font-medium text-neutral-300">{label}</Label>
      <Input
        type={opts.type}
        value={(settings[key] as string) || ""}
        onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  const socialField = (
    label: string,
    key: keyof SocialLinks,
    placeholder?: string,
    opts: FieldOpts = {},
  ) => (
    <div className={`space-y-2 ${opts.full ? "sm:col-span-2" : ""}`}>
      <Label className="text-sm font-medium text-neutral-300">{label}</Label>
      <Input
        value={(social[key] as string) || ""}
        onChange={(e) => setSocial((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 py-16 text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading settings…
        </div>
      </div>
    );
  }

  const hasLogo = !!settings.logo_url && settings.logo_url.trim() !== "";

  return (
    <div className="max-w-3xl pb-24">
      {/* Page header */}
      <header className="mb-12">
        <h1 className="font-serif text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1.5 text-sm text-neutral-400">
          Shop details, contact information and branding for the public site.
        </p>
      </header>

      <div className="space-y-14">
        {/* Shop information */}
        <section>
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Shop information</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Used in page titles, the footer and search results.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("Shop name", "title", "Art By Shahbaz")}
            {field("Tagline", "tagline", "Luxury Bridal Couture")}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-neutral-300">Description</Label>
              <Textarea
                value={settings.description || ""}
                onChange={(e) => setSettings((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Contact & location */}
        <section className="border-t border-neutral-800 pt-12">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Contact &amp; location</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Shown on the contact page, footer and product enquiries.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("Address", "address", "Shop #38, Kehkashan Arcade, Clifton, Karachi", { full: true })}
            {field("Phone 1", "phone1", "+92 300 1234567")}
            {field("Phone 2", "phone2", "Optional")}
            {field("Email", "email", "info@artbyshahbaz.com", { full: true, type: "email" })}
            {field("Weekday hours", "hours_weekday", "Mon – Sat: 11AM – 9PM")}
            {field("Weekend hours", "hours_weekend", "Sunday: By Appointment")}
          </div>
        </section>

        {/* Social links */}
        <section className="border-t border-neutral-800 pt-12">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Social &amp; messaging</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Empty fields are hidden from the site. WhatsApp powers the enquiry buttons.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {socialField("WhatsApp number", "whatsapp", "923001234567")}
            {socialField("Instagram URL", "instagram", "https://instagram.com/artbyshahbaz")}
            {socialField("Facebook URL", "facebook", "https://facebook.com/artbyshahbaz")}
            {socialField("YouTube URL", "youtube", "Optional")}
            {socialField("TikTok URL", "tiktok", "Optional")}
          </div>
        </section>

        {/* Branding */}
        <section className="border-t border-neutral-800 pt-12">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Branding</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Logo for the site header, footer and this admin panel. Applied when you save.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800">
              <Image
                src={hasLogo ? (settings.logo_url as string) : "/logo.jpg"}
                alt="Current logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                ref={logoRef}
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="adminSecondary"
                size="sm"
                onClick={() => logoRef.current?.click()}
                disabled={logoUploading}
                className="gap-2"
              >
                {logoUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {logoUploading ? "Uploading…" : hasLogo ? "Replace logo" : "Upload logo"}
              </Button>
              {hasLogo && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to default
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Admin account */}
        <section className="border-t border-neutral-800 pt-12">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <KeyRound className="h-4 w-4 text-gold-400" />
              Admin account
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Changes the password for the account you are signed in with. Saved on its own — you stay signed in.
            </p>
          </div>
          <div className="grid max-w-sm gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-300">Current password</Label>
              <Input
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                className={inputClass}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-300">New password</Label>
              <Input
                type="password"
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
              />
              <p className="text-xs text-neutral-500">At least 8 characters.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-300">Confirm new password</Label>
              <Input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {pwMsg.text}
              </p>
            )}
            <div>
              <Button
                onClick={handlePasswordUpdate}
                disabled={pwSaving || !pw.currentPassword || !pw.newPassword || !pw.confirm}
                variant="adminSecondary"
                className="gap-2"
              >
                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update password
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-14 border-t border-neutral-800 bg-neutral-950/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex max-w-3xl items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <Check className="h-4 w-4" /> Changes saved
              </span>
            ) : (
              "Edits stay on this page until you save."
            )}
          </p>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-gold-500 font-semibold text-neutral-950 hover:bg-gold-400"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
