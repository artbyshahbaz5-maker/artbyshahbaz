"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import type { Banner } from "@/types";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", button_text: "Explore Collection", button_link: "/products" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/banners").then((r) => r.json());
    setBanners(res.banners || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("folder", "banners");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((r) => r.json());
    if (res.success) setForm((p) => ({ ...p, image_url: res.url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.image_url) return;
    setSaving(true);
    await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setOpen(false);
    setForm({ title: "", subtitle: "", image_url: "", button_text: "Explore Collection", button_link: "/products" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" }); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Banners</h1>
          <p className="text-neutral-400 text-sm mt-1">Homepage hero banners & slides</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold gap-2">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>
      {loading ? <div className="flex items-center gap-2 text-neutral-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.length === 0 && <p className="text-neutral-500 text-sm py-6 col-span-full">No banners yet.</p>}
          {banners.map((b) => (
            <div key={b.id} className="relative rounded-xl overflow-hidden border border-neutral-800 group">
              <div className="relative aspect-[16/9]">
                {b.image_url ? <Image src={b.image_url} alt={b.title || "Banner"} fill className="object-cover" /> : <div className="bg-neutral-800 w-full h-full" />}
              </div>
              <div className="p-3 bg-neutral-900">
                <p className="text-white text-sm font-medium truncate">{b.title || "(No title)"}</p>
                <p className="text-neutral-400 text-xs truncate">{b.subtitle}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)} className="h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-neutral-900 border-neutral-700 text-white">
          <DialogHeader><DialogTitle className="font-serif text-xl text-white">Add Banner</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {form.image_url && <div className="relative h-40 rounded-xl overflow-hidden border border-neutral-700"><Image src={form.image_url} alt="Preview" fill className="object-cover" /></div>}
            <div>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} className="hidden" />
              <Button type="button" variant="adminSecondary" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? "Uploading..." : "Upload Banner Image"}
              </Button>
            </div>
            {[["Title", "title", "e.g. New Collection 2025"], ["Subtitle", "subtitle", "Luxury Bridal Couture"], ["Button Text", "button_text", "Explore Collection"], ["Button Link", "button_link", "/products"]].map(([label, key, ph]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-neutral-300">{label}</Label>
                <Input value={(form as any)[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key as string]: e.target.value }))} placeholder={ph} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.image_url} className="flex-1 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Add Banner
              </Button>
              <Button variant="adminSecondary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
